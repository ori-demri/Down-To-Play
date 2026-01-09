import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { SelectedImage } from '@/features/fields/types';
import { imageService } from '@/features/fields';
import { colors, spacing, borderRadius, typography } from '@/constants';

interface ImagePickerProps {
  images: SelectedImage[];
  onImagesChange: (images: SelectedImage[]) => void;
  maxImages?: number;
  error?: string;
}

export function ImagePickerComponent({
  images,
  onImagesChange,
  maxImages = 5,
  error,
}: ImagePickerProps) {
  const canAddMore = images.length < maxImages;

  const handleAddImage = () => {
    Alert.alert(
      'Add Photo',
      'Choose how you want to add a photo of the field',
      [
        {
          text: 'Take Photo',
          onPress: handleTakePhoto,
        },
        {
          text: 'Choose from Gallery',
          onPress: handlePickFromGallery,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleTakePhoto = async () => {
    const result = await imageService.takePhoto();
    if (result.success && result.image) {
      onImagesChange([...images, result.image]);
    } else if (result.error && result.error !== 'Photo capture cancelled') {
      Alert.alert('Error', result.error);
    }
  };

  const handlePickFromGallery = async () => {
    const result = await imageService.pickImageFromGallery();
    if (result.success && result.image) {
      onImagesChange([...images, result.image]);
    } else if (result.error && result.error !== 'Image selection cancelled') {
      Alert.alert('Error', result.error);
    }
  };

  const handleRemoveImage = (index: number) => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const newImages = [...images];
            newImages.splice(index, 1);
            onImagesChange(newImages);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Photos *</Text>
        <Text style={styles.counter}>
          {images.length}/{maxImages}
        </Text>
      </View>
      
      <Text style={styles.hint}>
        Add at least one photo of the field. The first photo will be the main image.
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Existing images */}
        {images.map((image, index) => (
          <View key={image.uri} style={styles.imageContainer}>
            <Image source={{ uri: image.uri }} style={styles.image} />
            {index === 0 && (
              <View style={styles.primaryBadge}>
                <Text style={styles.primaryBadgeText}>Main</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveImage(index)}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Add button */}
        {canAddMore && (
          <TouchableOpacity style={styles.addButton} onPress={handleAddImage}>
            <Text style={styles.addButtonIcon}>📷</Text>
            <Text style={styles.addButtonText}>Add Photo</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const IMAGE_SIZE = 120;

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  counter: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
  },
  hint: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    marginBottom: spacing.md,
  },
  scrollContent: {
    paddingRight: spacing.md,
  },
  imageContainer: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    marginRight: spacing.sm,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  primaryBadge: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  primaryBadgeText: {
    color: colors.text.inverse,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  removeButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: colors.text.inverse,
    fontSize: 12,
    fontWeight: typography.weights.bold,
  },
  addButton: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  addButtonIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  addButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  error: {
    fontSize: typography.sizes.sm,
    color: colors.error,
    marginTop: spacing.sm,
  },
});
