export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          position: PlayerPosition | null;
          skill_level: SkillLevel | null;
          bio: string | null;
          is_available: boolean;
          latitude: number | null;
          longitude: number | null;
          last_location_update: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          position?: PlayerPosition | null;
          skill_level?: SkillLevel | null;
          bio?: string | null;
          is_available?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          last_location_update?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          position?: PlayerPosition | null;
          skill_level?: SkillLevel | null;
          bio?: string | null;
          is_available?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          last_location_update?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      courts: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          latitude: number;
          longitude: number;
          court_type: CourtType;
          is_public: boolean;
          has_lights: boolean;
          surface_type: SurfaceType | null;
          image_url: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address?: string | null;
          latitude: number;
          longitude: number;
          court_type?: CourtType;
          is_public?: boolean;
          has_lights?: boolean;
          surface_type?: SurfaceType | null;
          image_url?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string | null;
          latitude?: number;
          longitude?: number;
          court_type?: CourtType;
          is_public?: boolean;
          has_lights?: boolean;
          surface_type?: SurfaceType | null;
          image_url?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      games: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          court_id: string | null;
          organizer_id: string;
          game_date: string;
          start_time: string;
          end_time: string | null;
          players_needed: number;
          players_joined: number;
          skill_level: SkillLevel | null;
          status: GameStatus;
          latitude: number | null;
          longitude: number | null;
          custom_location: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          court_id?: string | null;
          organizer_id: string;
          game_date: string;
          start_time: string;
          end_time?: string | null;
          players_needed: number;
          players_joined?: number;
          skill_level?: SkillLevel | null;
          status?: GameStatus;
          latitude?: number | null;
          longitude?: number | null;
          custom_location?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          court_id?: string | null;
          organizer_id?: string;
          game_date?: string;
          start_time?: string;
          end_time?: string | null;
          players_needed?: number;
          players_joined?: number;
          skill_level?: SkillLevel | null;
          status?: GameStatus;
          latitude?: number | null;
          longitude?: number | null;
          custom_location?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      game_participants: {
        Row: {
          id: string;
          game_id: string;
          player_id: string;
          status: ParticipantStatus;
          joined_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          player_id: string;
          status?: ParticipantStatus;
          joined_at?: string;
        };
        Update: {
          id?: string;
          game_id?: string;
          player_id?: string;
          status?: ParticipantStatus;
          joined_at?: string;
        };
      };
    };
  };
}

export type PlayerPosition = 'goalkeeper' | 'defender' | 'midfielder' | 'forward' | 'any';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'pro';
export type CourtType = 'full' | 'half' | '5v5' | '7v7' | 'futsal';
export type SurfaceType = 'grass' | 'turf' | 'concrete' | 'indoor';
export type GameStatus = 'open' | 'full' | 'in_progress' | 'completed' | 'cancelled';
export type ParticipantStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn';

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Court = Database['public']['Tables']['courts']['Row'];
export type Game = Database['public']['Tables']['games']['Row'];
export type GameParticipant = Database['public']['Tables']['game_participants']['Row'];

// Extended types with relations
export interface GameWithDetails extends Game {
  court?: Court | null;
  organizer?: Profile;
  participants?: (GameParticipant & { player: Profile })[];
}

export interface NearbyPlayer extends Profile {
  distance?: number; // in kilometers
}
