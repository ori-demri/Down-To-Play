import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { spacing, borderRadius, typography, ThemeColors } from '@/constants';
import { imageService } from '@/features/fields';
import { SelectedImage } from '@/features/fields/types';
import { useTheme, useThemedStyles } from '@/features/theme';

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
  const { isDark } = useTheme();
  const themedStyles = useThemedStyles(createThemedStyles, isDark);
  const canAddMore = images.length < maxImages;

  const handleAddImage = () => {
    Alert.alert('Add Photo', 'Choose how you want to add a photo of the field', [
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
    ]);
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
    Alert.alert('Remove Photo', 'Are you sure you want to remove this photo?', [
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
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={themedStyles.label}>Photos *</Text>
        <Text style={themedStyles.counter}>
          {images.length}/{maxImages}
        </Text>
      </View>

      <Text style={themedStyles.hint}>
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
              <View style={themedStyles.primaryBadge}>
                <Text style={themedStyles.primaryBadgeText}>Main</Text>
              </View>
            )}
            <TouchableOpacity
              style={themedStyles.removeButton}
              onPress={() => handleRemoveImage(index)}
            >
              <Text style={themedStyles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Add button */}
        {canAddMore && (
          <TouchableOpacity style={themedStyles.addButton} onPress={handleAddImage}>
            <Text style={styles.addButtonIcon}>📷</Text>
            <Text style={themedStyles.addButtonText}>Add Photo</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {error && <Text style={themedStyles.error}>{error}</Text>}
    </View>
  );
}

const IMAGE_SIZE = 120;

const styles = StyleSheet.create({
  addButtonIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  container: {
    marginBottom: spacing.md,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  image: {
    height: '100%',
    width: '100%',
  },
  imageContainer: {
    borderRadius: borderRadius.md,
    height: IMAGE_SIZE,
    marginRight: spacing.sm,
    overflow: 'hidden',
    width: IMAGE_SIZE,
  },
  scrollContent: {
    paddingRight: spacing.md,
  },
});

/* eslint-disable react-native/no-unused-styles */
const createThemedStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    addButton: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      borderStyle: 'dashed',
      borderWidth: 2,
      height: IMAGE_SIZE,
      justifyContent: 'center',
      width: IMAGE_SIZE,
    },
    addButtonText: {
      color: colors.text.secondary,
      fontSize: typography.sizes.sm,
    },
    counter: {
      color: colors.text.muted,
      fontSize: typography.sizes.sm,
    },
    error: {
      color: colors.error,
      fontSize: typography.sizes.sm,
      marginTop: spacing.sm,
    },
    hint: {
      color: colors.text.muted,
      fontSize: typography.sizes.sm,
      marginBottom: spacing.md,
    },
    label: {
      color: colors.text.primary,
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.medium,
    },
    primaryBadge: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.sm,
      left: spacing.xs,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      position: 'absolute',
      top: spacing.xs,
    },
    primaryBadgeText: {
      color: colors.text.inverse,
      fontSize: typography.sizes.xs,
      fontWeight: typography.weights.bold,
    },
    removeButton: {
      alignItems: 'center',
      backgroundColor: colors.error,
      borderRadius: 12,
      height: 24,
      justifyContent: 'center',
      position: 'absolute',
      right: spacing.xs,
      top: spacing.xs,
      width: 24,
    },
    removeButtonText: {
      color: colors.text.inverse,
      fontSize: 12,
      fontWeight: typography.weights.bold,
    },
  });
/* eslint-enable react-native/no-unused-styles */
