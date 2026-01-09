// Field-related types

export type SurfaceType =
  | 'natural_grass'
  | 'synthetic_turf'
  | 'artificial_grass'
  | 'asphalt'
  | 'concrete'
  | 'dirt'
  | 'sand'
  | 'indoor';

export type FieldStatus = 'pending' | 'active' | 'inactive' | 'rejected';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Field {
  id: string;
  name: string;
  description: string | null;
  coordinates: Coordinates;
  address: string | null;
  city: string | null;
  country: string | null;
  surface_type: SurfaceType;
  is_free: boolean;
  has_lights: boolean;
  has_goals: boolean;
  has_changing_rooms: boolean;
  has_parking: boolean;
  player_capacity: number | null;
  status: FieldStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
