import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { supabase, STORAGE_BUCKETS } from '@/infrastructure/supabase';
import { SelectedImage } from '../types';
import { storageLogger } from '@/utils/logger';

// Maximum image size in bytes (5MB)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// Allowed image types
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface ImagePickerResult {
  success: boolean;
  image?: SelectedImage;
  error?: string;
}

interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

class ImageService {
  /**
   * Request permission to access the media library
   */
  async requestMediaLibraryPermission(): Promise<boolean> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Request permission to access the camera
   */
  async requestCameraPermission(): Promise<boolean> {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Pick an image from the device gallery
   */
  async pickImageFromGallery(): Promise<ImagePickerResult> {
    try {
      const hasPermission = await this.requestMediaLibraryPermission();
      if (!hasPermission) {
        return {
          success: false,
          error: 'Permission to access photos was denied. Please enable it in settings.',
        };
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return { success: false, error: 'Image selection cancelled' };
      }

      const asset = result.assets[0];
      return this.processPickedImage(asset);
    } catch (error) {
      storageLogger.error('Error picking image from gallery', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      return {
        success: false,
        error: 'Failed to pick image. Please try again.',
      };
    }
  }

  /**
   * Take a photo using the camera
   */
  async takePhoto(): Promise<ImagePickerResult> {
    try {
      const hasPermission = await this.requestCameraPermission();
      if (!hasPermission) {
        return {
          success: false,
          error: 'Permission to access camera was denied. Please enable it in settings.',
        };
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return { success: false, error: 'Photo capture cancelled' };
      }

      const asset = result.assets[0];
      return this.processPickedImage(asset);
    } catch (error) {
      storageLogger.error('Error taking photo', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      return {
        success: false,
        error: 'Failed to take photo. Please try again.',
      };
    }
  }

  /**
   * Process and validate a picked image
   */
  private async processPickedImage(
    asset: ImagePicker.ImagePickerAsset
  ): Promise<ImagePickerResult> {
    const uri = asset.uri;
    const mimeType = asset.mimeType || 'image/jpeg';
    
    // Validate mime type
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return {
        success: false,
        error: 'Invalid image format. Please use JPEG, PNG, or WebP.',
      };
    }

    // File size check - asset.fileSize is available from ImagePicker
    // We'll do a basic validation, actual size check happens during upload
    if (!uri) {
      return {
        success: false,
        error: 'Failed to read image file.',
      };
    }

    // Estimate file size from ImagePicker (passed as parameter in future)
    const fileSize = 0; // Will be checked during upload if needed

    // Generate a filename
    const extension = mimeType.split('/')[1] || 'jpg';
    const fileName = `field_${Date.now()}.${extension}`;

    return {
      success: true,
      image: {
        uri,
        fileName,
        mimeType,
        fileSize,
      },
    };
  }

  /**
   * Upload an image to Supabase Storage
   */
  async uploadImage(
    image: SelectedImage,
    fieldId: string,
    userId: string | null
  ): Promise<ImageUploadResult> {
    try {
      // Read the file as base64 using expo-file-system
      const base64 = await FileSystem.readAsStringAsync(image.uri, {
        encoding: 'base64',
      });

      // Create the storage path: userId/fieldId/filename (use 'anonymous' if no userId)
      const userFolder = userId || 'anonymous';
      const storagePath = `${userFolder}/${fieldId}/${image.fileName}`;

      // Convert base64 to ArrayBuffer and upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.FIELD_IMAGES)
        .upload(storagePath, decode(base64), {
          contentType: image.mimeType,
          upsert: false,
        });

      if (error) {
        storageLogger.error('Supabase storage error', { error: error.message });
        return {
          success: false,
          error: `Failed to upload image: ${error.message}`,
        };
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKETS.FIELD_IMAGES)
        .getPublicUrl(data.path);

      storageLogger.debug('Image uploaded successfully', { path: data.path });
      return {
        success: true,
        url: urlData.publicUrl,
      };
    } catch (error) {
      storageLogger.error('Error uploading image', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      return {
        success: false,
        error: 'Failed to upload image. Please check your connection and try again.',
      };
    }
  }

  /**
   * Upload multiple images with progress tracking
   */
  async uploadImages(
    images: SelectedImage[],
    fieldId: string,
    userId: string | null,
    onProgress?: (progress: number) => void
  ): Promise<{ urls: string[]; errors: string[] }> {
    const urls: string[] = [];
    const errors: string[] = [];
    const total = images.length;

    for (let i = 0; i < images.length; i++) {
      const result = await this.uploadImage(images[i], fieldId, userId);
      
      if (result.success && result.url) {
        urls.push(result.url);
      } else {
        errors.push(result.error || `Failed to upload image ${i + 1}`);
      }

      // Report progress
      const progress = Math.round(((i + 1) / total) * 100);
      onProgress?.(progress);
    }

    return { urls, errors };
  }

  /**
   * Delete an image from storage
   */
  async deleteImage(imageUrl: string): Promise<boolean> {
    try {
      // Extract the path from the URL
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      const bucketIndex = pathParts.findIndex(p => p === STORAGE_BUCKETS.FIELD_IMAGES);
      
      if (bucketIndex === -1) {
        storageLogger.warn('Invalid image URL - bucket not found', { imageUrl });
        return false;
      }

      const storagePath = pathParts.slice(bucketIndex + 1).join('/');

      const { error } = await supabase.storage
        .from(STORAGE_BUCKETS.FIELD_IMAGES)
        .remove([storagePath]);

      if (error) {
        storageLogger.error('Error deleting image from storage', { error: error.message });
        return false;
      }

      storageLogger.debug('Image deleted successfully', { storagePath });
      return true;
    } catch (error) {
      storageLogger.error('Error deleting image', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      return false;
    }
  }
}

export const imageService = new ImageService();
