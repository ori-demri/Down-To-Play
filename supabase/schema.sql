-- =====================================================
-- Football Fields App - Supabase Database Schema
-- =====================================================
-- Run this SQL in your Supabase SQL Editor to set up the database

-- Enable PostGIS extension for geospatial queries (if not already enabled)
CREATE EXTENSION IF NOT EXISTS postgis;

-- =====================================================
-- ENUMS
-- =====================================================

-- Surface type enum
CREATE TYPE surface_type AS ENUM (
  'natural_grass',
  'synthetic_turf',
  'artificial_grass',
  'asphalt',
  'concrete',
  'dirt',
  'sand',
  'indoor'
);

-- Field status enum (for moderation workflow)
CREATE TYPE field_status AS ENUM (
  'pending',    -- Newly created, awaiting moderation
  'active',     -- Approved and visible to all users
  'inactive',   -- Temporarily disabled
  'rejected'    -- Rejected by moderators
);

-- =====================================================
-- TABLES
-- =====================================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Football fields
CREATE TABLE IF NOT EXISTS public.fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  
  -- Location data (stored as separate columns for simplicity + PostGIS point for queries)
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  location GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
  ) STORED,
  
  -- Address info (can be populated via reverse geocoding)
  address TEXT,
  city TEXT,
  country TEXT,
  
  -- Field characteristics
  surface_type surface_type NOT NULL,
  is_free BOOLEAN DEFAULT TRUE NOT NULL,
  has_lights BOOLEAN DEFAULT FALSE NOT NULL,
  has_goals BOOLEAN DEFAULT TRUE NOT NULL,
  has_changing_rooms BOOLEAN DEFAULT FALSE NOT NULL,
  has_parking BOOLEAN DEFAULT FALSE NOT NULL,
  player_capacity INTEGER CHECK (player_capacity > 0),
  
  -- Additional notes from the user
  notes TEXT,
  
  -- Moderation status
  status field_status DEFAULT 'pending' NOT NULL,
  
  -- Audit fields
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Field images
CREATE TABLE IF NOT EXISTS public.field_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Geospatial index for location-based queries
CREATE INDEX IF NOT EXISTS idx_fields_location ON public.fields USING GIST (location);

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_fields_status ON public.fields (status);

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_fields_status_created ON public.fields (status, created_at DESC);

-- Index for field images by field
CREATE INDEX IF NOT EXISTS idx_field_images_field_id ON public.field_images (field_id);

-- Index for finding primary images quickly
CREATE INDEX IF NOT EXISTS idx_field_images_primary ON public.field_images (field_id) WHERE is_primary = TRUE;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to find fields within a radius (in meters)
CREATE OR REPLACE FUNCTION find_fields_within_radius(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  radius_meters INTEGER DEFAULT 5000
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  address TEXT,
  city TEXT,
  country TEXT,
  surface_type surface_type,
  is_free BOOLEAN,
  has_lights BOOLEAN,
  has_goals BOOLEAN,
  has_changing_rooms BOOLEAN,
  has_parking BOOLEAN,
  player_capacity INTEGER,
  status field_status,
  created_by UUID,
  created_at TIMESTAMPTZ,
  distance_meters DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.name,
    f.description,
    f.latitude,
    f.longitude,
    f.address,
    f.city,
    f.country,
    f.surface_type,
    f.is_free,
    f.has_lights,
    f.has_goals,
    f.has_changing_rooms,
    f.has_parking,
    f.player_capacity,
    f.status,
    f.created_by,
    f.created_at,
    ST_Distance(f.location, ST_MakePoint(lng, lat)::geography) as distance_meters
  FROM public.fields f
  WHERE f.status = 'active'
    AND ST_DWithin(f.location, ST_MakePoint(lng, lat)::geography, radius_meters)
  ORDER BY distance_meters;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at for profiles
DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at for fields
DROP TRIGGER IF EXISTS trigger_fields_updated_at ON public.fields;
CREATE TRIGGER trigger_fields_updated_at
  BEFORE UPDATE ON public.fields
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Ensure only one primary image per field
CREATE OR REPLACE FUNCTION ensure_single_primary_image()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = TRUE THEN
    UPDATE public.field_images
    SET is_primary = FALSE
    WHERE field_id = NEW.field_id AND id != NEW.id AND is_primary = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_single_primary_image ON public.field_images;
CREATE TRIGGER trigger_single_primary_image
  BEFORE INSERT OR UPDATE ON public.field_images
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_primary_image();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_images ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Fields policies
CREATE POLICY "Active fields are viewable by everyone"
  ON public.fields FOR SELECT
  USING (status = 'active' OR created_by = auth.uid());

CREATE POLICY "Authenticated users can create fields"
  ON public.fields FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own pending fields"
  ON public.fields FOR UPDATE
  USING (created_by = auth.uid() AND status = 'pending');

-- Field images policies
CREATE POLICY "Field images are viewable if field is visible"
  ON public.field_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.fields f
      WHERE f.id = field_id
      AND (f.status = 'active' OR f.created_by = auth.uid())
    )
  );

CREATE POLICY "Authenticated users can upload images"
  ON public.field_images FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own uploaded images"
  ON public.field_images FOR DELETE
  USING (uploaded_by = auth.uid());

-- =====================================================
-- STORAGE BUCKET SETUP
-- =====================================================
-- Run these in the Supabase Dashboard > Storage

-- 1. Create a bucket called 'field-images' (public)
-- 2. Set the following policies:

-- Storage policy: Allow authenticated users to upload
-- CREATE POLICY "Authenticated users can upload field images"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'field-images'
--   AND auth.role() = 'authenticated'
-- );

-- Storage policy: Allow public read access
-- CREATE POLICY "Public read access for field images"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'field-images');

-- Storage policy: Users can delete their own uploads
-- CREATE POLICY "Users can delete their own field images"
-- ON storage.objects FOR DELETE
-- USING (
--   bucket_id = 'field-images'
--   AND auth.uid()::text = (storage.foldername(name))[1]
-- );
