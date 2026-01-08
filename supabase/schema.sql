-- Down To Play App Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE player_position AS ENUM ('goalkeeper', 'defender', 'midfielder', 'forward', 'any');
CREATE TYPE skill_level AS ENUM ('beginner', 'intermediate', 'advanced', 'pro');
CREATE TYPE court_type AS ENUM ('full', 'half', '5v5', '7v7', 'futsal');
CREATE TYPE surface_type AS ENUM ('grass', 'turf', 'concrete', 'indoor');
CREATE TYPE game_status AS ENUM ('open', 'full', 'in_progress', 'completed', 'cancelled');
CREATE TYPE participant_status AS ENUM ('pending', 'approved', 'rejected', 'withdrawn');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  position player_position,
  skill_level skill_level,
  bio TEXT,
  is_available BOOLEAN DEFAULT true,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  last_location_update TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courts table
CREATE TABLE courts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  court_type court_type DEFAULT 'full',
  is_public BOOLEAN DEFAULT true,
  has_lights BOOLEAN DEFAULT false,
  surface_type surface_type,
  image_url TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Games table
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  court_id UUID REFERENCES courts(id) ON DELETE SET NULL,
  organizer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  game_date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT,
  players_needed INTEGER NOT NULL DEFAULT 10,
  players_joined INTEGER DEFAULT 0,
  skill_level skill_level,
  status game_status DEFAULT 'open',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  custom_location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game participants table
CREATE TABLE game_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status participant_status DEFAULT 'pending',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_id, player_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_profiles_location ON profiles(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX idx_profiles_available ON profiles(is_available) WHERE is_available = true;
CREATE INDEX idx_courts_location ON courts(latitude, longitude);
CREATE INDEX idx_games_date ON games(game_date);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_organizer ON games(organizer_id);
CREATE INDEX idx_game_participants_game ON game_participants(game_id);
CREATE INDEX idx_game_participants_player ON game_participants(player_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_participants ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Courts policies
CREATE POLICY "Courts are viewable by everyone" ON courts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create courts" ON courts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Court creators can update their courts" ON courts
  FOR UPDATE USING (auth.uid() = created_by);

-- Games policies
CREATE POLICY "Games are viewable by everyone" ON games
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create games" ON games
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Organizers can update their games" ON games
  FOR UPDATE USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete their games" ON games
  FOR DELETE USING (auth.uid() = organizer_id);

-- Game participants policies
CREATE POLICY "Game participants are viewable by everyone" ON game_participants
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join games" ON game_participants
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = player_id);

CREATE POLICY "Players can leave games" ON game_participants
  FOR DELETE USING (auth.uid() = player_id);

CREATE POLICY "Organizers can manage participants" ON game_participants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM games WHERE games.id = game_participants.game_id AND games.organizer_id = auth.uid()
    )
  );

-- Function to handle new user profiles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update players_joined count
CREATE OR REPLACE FUNCTION update_players_joined()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE games SET players_joined = (
      SELECT COUNT(*) FROM game_participants 
      WHERE game_id = NEW.game_id AND status = 'approved'
    ) WHERE id = NEW.game_id;
    
    -- Update game status if full
    UPDATE games SET status = 'full' 
    WHERE id = NEW.game_id 
    AND players_joined >= players_needed 
    AND status = 'open';
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE games SET players_joined = (
      SELECT COUNT(*) FROM game_participants 
      WHERE game_id = OLD.game_id AND status = 'approved'
    ) WHERE id = OLD.game_id;
    
    -- Reopen game if not full anymore
    UPDATE games SET status = 'open' 
    WHERE id = OLD.game_id 
    AND players_joined < players_needed 
    AND status = 'full';
    
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for participant changes
CREATE TRIGGER on_participant_change
  AFTER INSERT OR UPDATE OR DELETE ON game_participants
  FOR EACH ROW EXECUTE FUNCTION update_players_joined();

-- Enable realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE games;
ALTER PUBLICATION supabase_realtime ADD TABLE game_participants;
