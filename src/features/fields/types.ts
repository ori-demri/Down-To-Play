import { SurfaceType, Coordinates } from '@/types';

// Form data for creating a new field
export interface CreateFieldFormData {
  name: string;
  description: string;
  coordinates: Coordinates;
  surfaceType: SurfaceType;
  isFree: boolean;
  hasLights: boolean;
  hasGoals: boolean;
  hasChangingRooms: boolean;
  hasParking: boolean;
  playerCapacity: number | null;
  notes: string;
}

// Image selected from device (before upload)
export interface SelectedImage {
  uri: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
}

// Validation errors for the form
export interface CreateFieldFormErrors {
  name?: string;
  description?: string;
  coordinates?: string;
  surfaceType?: string;
  playerCapacity?: string;
  images?: string;
  general?: string;
}

// Default form values
export const DEFAULT_FORM_DATA: CreateFieldFormData = {
  name: '',
  description: '',
  coordinates: { latitude: 0, longitude: 0 },
  surfaceType: 'natural_grass',
  isFree: true,
  hasLights: false,
  hasGoals: true,
  hasChangingRooms: false,
  hasParking: false,
  playerCapacity: null,
  notes: '',
};

// Surface type display labels
export const SURFACE_TYPE_LABELS: Record<SurfaceType, string> = {
  natural_grass: 'Natural Grass',
  synthetic_turf: 'Synthetic Turf',
  artificial_grass: 'Artificial Grass',
  asphalt: 'Asphalt',
  concrete: 'Concrete',
  dirt: 'Dirt',
  sand: 'Sand',
  indoor: 'Indoor',
};

// Surface type icons/emojis
export const SURFACE_TYPE_ICONS: Record<SurfaceType, string> = {
  natural_grass: '🌱',
  synthetic_turf: '🟢',
  artificial_grass: '🌿',
  asphalt: '⬛',
  concrete: '🔲',
  dirt: '🟤',
  sand: '🏖️',
  indoor: '🏟️',
};
