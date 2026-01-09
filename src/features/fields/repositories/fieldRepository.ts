import { supabase } from '@/infrastructure/supabase';
import { Field, Coordinates, SurfaceType, FieldStatus } from '@/types';
import { CreateFieldFormData, SelectedImage } from '../types';
import { imageService } from '../services/imageService';
import { fieldLogger } from '@/utils/logger';

// Database row types
interface FieldRow {
  id: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
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
  notes: string | null;
  status: FieldStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface UploadFieldResult {
  success: boolean;
  field?: Field;
  imageUrls?: string[];
  error?: string;
  errors?: string[];
}

class FieldRepository {
  /**
   * Create a new field with images
   */
  async createField(
    formData: CreateFieldFormData,
    images: SelectedImage[],
    userId: string | null,
    onProgress?: (progress: number) => void
  ): Promise<UploadFieldResult> {
    try {
      // Step 1: Create the field record
      onProgress?.(5);
      
      // Anonymous uploads are active immediately (for dev), authenticated users go through moderation
      const status = userId ? 'pending' : 'active';
      
      const fieldData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        latitude: formData.coordinates.latitude,
        longitude: formData.coordinates.longitude,
        surface_type: formData.surfaceType,
        is_free: formData.isFree,
        has_lights: formData.hasLights,
        has_goals: formData.hasGoals,
        has_changing_rooms: formData.hasChangingRooms,
        has_parking: formData.hasParking,
        // player_capacity must be > 0 or null (DB constraint)
        player_capacity: formData.playerCapacity && formData.playerCapacity > 0 ? formData.playerCapacity : null,
        notes: formData.notes.trim() || null,
        status: status as 'pending' | 'active',
        created_by: userId,
      };

      const { data: fieldRecord, error: fieldError } = await supabase
        .from('fields')
        .insert(fieldData)
        .select()
        .single();

      if (fieldError || !fieldRecord) {
        fieldLogger.error('Error creating field', { error: fieldError?.message });
        return {
          success: false,
          error: `Failed to create field: ${fieldError?.message || 'Unknown error'}`,
        };
      }

      const typedFieldRecord = fieldRecord as unknown as FieldRow;
      onProgress?.(20);

      // Step 2: Upload images
      const imageUrls: string[] = [];
      const imageErrors: string[] = [];

      if (images.length > 0) {
        const uploadResult = await imageService.uploadImages(
          images,
          typedFieldRecord.id,
          userId,
          (imgProgress) => {
            // Scale image progress from 20% to 80%
            const scaledProgress = 20 + Math.round(imgProgress * 0.6);
            onProgress?.(scaledProgress);
          }
        );

        imageUrls.push(...uploadResult.urls);
        imageErrors.push(...uploadResult.errors);
      }

      onProgress?.(85);

      // Step 3: Create image records in the database
      if (imageUrls.length > 0) {
        const imageRecords = imageUrls.map((url, index) => ({
          field_id: typedFieldRecord.id,
          image_url: url,
          is_primary: index === 0, // First image is primary
          uploaded_by: userId,
        }));

        const { error: imagesError } = await supabase
          .from('field_images')
          .insert(imageRecords);

        if (imagesError) {
          fieldLogger.error('Error saving image records', { error: imagesError.message });
          imageErrors.push('Failed to save some image references');
        }
      }

      onProgress?.(100);

      // Convert to app Field type
      const field = this.mapRowToField(typedFieldRecord);

      return {
        success: true,
        field,
        imageUrls,
        errors: imageErrors.length > 0 ? imageErrors : undefined,
      };
    } catch (error) {
      fieldLogger.error('Error in createField', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    }
  }

  /**
   * Get all active fields
   */
  async getAllFields(): Promise<Field[]> {
    try {
      const { data, error } = await supabase
        .from('fields')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        fieldLogger.error('Error fetching all fields', { error: error.message });
        return [];
      }

      const rows = (data || []) as unknown as FieldRow[];
      fieldLogger.debug('Fetched fields', { count: rows.length });
      return rows.map(row => this.mapRowToField(row));
    } catch (error) {
      fieldLogger.error('Error in getAllFields', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      return [];
    }
  }

  /**
   * Get fields near a location
   */
  async getFieldsNearLocation(
    coordinates: Coordinates,
    radiusMeters: number = 5000
  ): Promise<Field[]> {
    try {
      // Using a raw query approach since RPC typing can be complex
      const { data, error } = await supabase
        .from('fields')
        .select('*')
        .eq('status', 'active');

      if (error) {
        fieldLogger.error('Error fetching nearby fields', { error: error.message });
        return [];
      }

      // Filter by distance client-side (for now - in production use PostGIS)
      const rows = (data || []) as unknown as FieldRow[];
      const filtered = rows.filter(row => {
        const distance = this.calculateDistance(
          coordinates,
          { latitude: row.latitude, longitude: row.longitude }
        );
        return distance <= radiusMeters;
      });
      
      fieldLogger.debug('Fetched nearby fields', { total: rows.length, filtered: filtered.length });
      return filtered.map(row => this.mapRowToField(row));
    } catch (error) {
      fieldLogger.error('Error in getFieldsNearLocation', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      return [];
    }
  }

  /**
   * Calculate distance between two coordinates in meters (Haversine formula)
   */
  private calculateDistance(from: Coordinates, to: Coordinates): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (from.latitude * Math.PI) / 180;
    const φ2 = (to.latitude * Math.PI) / 180;
    const Δφ = ((to.latitude - from.latitude) * Math.PI) / 180;
    const Δλ = ((to.longitude - from.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Get a field by ID
   */
  async getFieldById(id: string): Promise<Field | null> {
    try {
      const { data, error } = await supabase
        .from('fields')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return null;
      }

      return this.mapRowToField(data as unknown as FieldRow);
    } catch (error) {
      fieldLogger.error('Error in getFieldById', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      return null;
    }
  }

  /**
   * Get images for a field
   */
  async getFieldImages(fieldId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('field_images')
        .select('image_url')
        .eq('field_id', fieldId)
        .order('is_primary', { ascending: false });

      if (error) {
        fieldLogger.warn('Error fetching field images', { error: error.message, fieldId });
        return [];
      }

      return (data || []).map((row: { image_url: string }) => row.image_url);
    } catch (error) {
      fieldLogger.error('Error in getFieldImages', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      return [];
    }
  }

  /**
   * Map a database row to the app's Field type
   */
  private mapRowToField(row: FieldRow): Field {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      coordinates: {
        latitude: row.latitude,
        longitude: row.longitude,
      },
      address: row.address,
      city: row.city,
      country: row.country,
      surface_type: row.surface_type,
      is_free: row.is_free,
      has_lights: row.has_lights,
      has_goals: row.has_goals,
      has_changing_rooms: row.has_changing_rooms,
      has_parking: row.has_parking,
      player_capacity: row.player_capacity,
      status: row.status,
      created_by: row.created_by,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}

export const fieldRepository = new FieldRepository();
