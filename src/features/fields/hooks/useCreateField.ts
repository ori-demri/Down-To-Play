import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  CreateFieldFormData,
  CreateFieldFormErrors,
  SelectedImage,
  DEFAULT_FORM_DATA,
} from '../types';
import { fieldRepository } from '../repositories/fieldRepository';
import { Coordinates } from '@/types';
import { fieldLogger } from '@/utils/logger';

interface UseCreateFieldReturn {
  formData: CreateFieldFormData;
  images: SelectedImage[];
  errors: CreateFieldFormErrors;
  isSubmitting: boolean;
  uploadProgress: number;
  validationError: string | null;
  updateFormData: <K extends keyof CreateFieldFormData>(
    key: K,
    value: CreateFieldFormData[K]
  ) => void;
  setImages: (images: SelectedImage[]) => void;
  setCoordinates: (coordinates: Coordinates) => void;
  validateForm: () => boolean;
  submitForm: (userId: string | null) => Promise<boolean>;
  resetForm: () => void;
  clearValidationError: () => void;
}

export function useCreateField(): UseCreateFieldReturn {
  const [formData, setFormData] = useState<CreateFieldFormData>(DEFAULT_FORM_DATA);
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [errors, setErrors] = useState<CreateFieldFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);

  const clearValidationError = useCallback(() => {
    setValidationError(null);
  }, []);

  const updateFormData = useCallback(<K extends keyof CreateFieldFormData>(
    key: K,
    value: CreateFieldFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Clear error when field is updated
    if (errors[key as keyof CreateFieldFormErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key as keyof CreateFieldFormErrors];
        return newErrors;
      });
    }
  }, [errors]);

  const setCoordinates = useCallback((coordinates: Coordinates) => {
    setFormData(prev => ({ ...prev, coordinates }));
    if (errors.coordinates) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.coordinates;
        return newErrors;
      });
    }
  }, [errors]);

  const validateForm = useCallback((): boolean => {
    const newErrors: CreateFieldFormErrors = {};
    const errorMessages: string[] = [];

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Field name is required';
      errorMessages.push('Field name is required');
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Field name must be at least 3 characters';
      errorMessages.push('Field name must be at least 3 characters');
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Field name must be less than 100 characters';
      errorMessages.push('Field name must be less than 100 characters');
    }

    // Description validation (optional but has max length)
    if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
      errorMessages.push('Description is too long');
    }

    // Location validation
    if (formData.coordinates.latitude === 0 && formData.coordinates.longitude === 0) {
      newErrors.coordinates = 'Please select a location for the field';
      errorMessages.push('Please select a location');
    }

    // Player capacity validation (must be positive if provided)
    if (typeof formData.playerCapacity === 'number' && formData.playerCapacity <= 0) {
      newErrors.playerCapacity = 'Player capacity must be greater than 0';
      errorMessages.push('Player capacity must be greater than 0');
    }

    // Images validation - at least one required
    if (images.length === 0) {
      newErrors.images = 'Please add at least one photo of the field';
      errorMessages.push('Please add at least one photo');
    }

    setErrors(newErrors);
    
    // Set validation error message for snackbar (show first error)
    if (errorMessages.length > 0) {
      setValidationError(errorMessages[0]);
    }
    
    return Object.keys(newErrors).length === 0;
  }, [formData, images]);

  const submitForm = useCallback(async (userId: string | null): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const result = await fieldRepository.createField(
        formData,
        images,
        userId,
        setUploadProgress
      );

      if (result.success) {
        // Show success message
        Alert.alert(
          'Field Submitted! 🎉',
          'Thank you for contributing! Your field has been submitted for review and will be visible once approved.',
          [{ text: 'OK' }]
        );

        // Show any upload warnings
        if (result.errors && result.errors.length > 0) {
          fieldLogger.warn('Some images failed to upload', { errors: result.errors });
        }

        fieldLogger.info('Field created successfully', { fieldId: result.field?.id });
        return true;
      } else {
        const errorMessage = result.error || 'Failed to create field';
        setErrors({ general: errorMessage });
        Alert.alert(
          'Submission Failed',
          errorMessage,
          [{ text: 'OK' }]
        );
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setErrors({ general: errorMessage });
      Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, images, validateForm]);

  const resetForm = useCallback(() => {
    setFormData(DEFAULT_FORM_DATA);
    setImages([]);
    setErrors({});
    setIsSubmitting(false);
    setUploadProgress(0);
    setValidationError(null);
  }, []);

  return {
    formData,
    images,
    errors,
    isSubmitting,
    uploadProgress,
    validationError,
    updateFormData,
    setImages,
    setCoordinates,
    validateForm,
    submitForm,
    resetForm,
    clearValidationError,
  };
}
