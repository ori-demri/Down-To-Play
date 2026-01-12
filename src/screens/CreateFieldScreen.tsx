import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Button,
  TextInput,
  Checkbox,
  SurfaceTypePicker,
  ImagePickerComponent,
  Snackbar,
} from '@/components/ui';
import { LocationPicker } from '@/components/ui/LocationPicker';
import { spacing, borderRadius, typography, ThemeColors } from '@/constants';
import { useAuth } from '@/features/auth';
import { useCreateField } from '@/features/fields/hooks/useCreateField';
import { useFields } from '@/features/fields/hooks/useFields';
import { useTheme, useThemedStyles } from '@/features/theme';
import { useLocation } from '@/hooks';
import { SurfaceType } from '@/types';

interface CreateFieldScreenProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateFieldScreen({ onClose, onSuccess }: CreateFieldScreenProps) {
  const { coordinates: userLocation, isLoading: isLoadingLocation } = useLocation();
  const { fields } = useFields(userLocation);
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const themedStyles = useThemedStyles(createThemedStyles, isDark);

  const {
    formData,
    images,
    errors,
    isSubmitting,
    uploadProgress,
    validationError,
    updateFormData,
    setImages,
    setCoordinates,
    submitForm,
    clearValidationError,
  } = useCreateField();

  const handleSubmit = useCallback(async () => {
    // Submit with authenticated user ID
    const success = await submitForm(user?.id || null);
    if (success) {
      onSuccess?.();
      onClose();
    }
  }, [submitForm, user?.id, onSuccess, onClose]);

  const handleSurfaceTypeChange = useCallback(
    (value: SurfaceType) => {
      updateFormData('surfaceType', value);
    },
    [updateFormData]
  );

  return (
    <SafeAreaView style={themedStyles.container}>
      {/* Header */}
      <View style={themedStyles.header}>
        <TouchableOpacity onPress={onClose} style={themedStyles.closeButton}>
          <Text style={themedStyles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={themedStyles.headerTitle}>Add Football Field</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Introduction */}
          <View style={themedStyles.intro}>
            <Text style={themedStyles.introTitle}>Help grow the community! 🌱</Text>
            <Text style={themedStyles.introText}>
              Share a public football field and help others discover great places to play. Your
              submission will be reviewed before being published.
            </Text>
          </View>

          {/* Location Picker */}
          <LocationPicker
            value={formData.coordinates}
            onChange={setCoordinates}
            userLocation={userLocation}
            isLoadingLocation={isLoadingLocation}
            error={errors.coordinates}
            fields={fields}
          />

          {/* Field Name */}
          <TextInput
            label="Field Name"
            placeholder="e.g., Central Park Football Field"
            value={formData.name}
            onChangeText={(text) => updateFormData('name', text)}
            error={errors.name}
            required
            maxLength={100}
            autoCapitalize="words"
          />

          {/* Description */}
          <TextInput
            label="Description"
            placeholder="Describe the field, its condition, best times to play, etc."
            value={formData.description}
            onChangeText={(text) => updateFormData('description', text)}
            error={errors.description}
            multiline
            numberOfLines={3}
            maxLength={500}
          />

          {/* Surface Type */}
          <SurfaceTypePicker
            value={formData.surfaceType}
            onChange={handleSurfaceTypeChange}
            error={errors.surfaceType}
          />

          {/* Images */}
          <ImagePickerComponent
            images={images}
            onImagesChange={setImages}
            maxImages={5}
            error={errors.images}
          />

          {/* Amenities Section */}
          <View style={styles.section}>
            <Text style={themedStyles.sectionTitle}>Amenities & Features</Text>

            <Checkbox
              label="Free to use"
              icon="🆓"
              checked={formData.isFree}
              onToggle={(checked) => updateFormData('isFree', checked)}
            />

            <Checkbox
              label="Has lights (for night games)"
              icon="💡"
              checked={formData.hasLights}
              onToggle={(checked) => updateFormData('hasLights', checked)}
            />

            <Checkbox
              label="Has goals"
              icon="🥅"
              checked={formData.hasGoals}
              onToggle={(checked) => updateFormData('hasGoals', checked)}
            />

            <Checkbox
              label="Has changing rooms"
              icon="🚿"
              checked={formData.hasChangingRooms}
              onToggle={(checked) => updateFormData('hasChangingRooms', checked)}
            />

            <Checkbox
              label="Has parking nearby"
              icon="🅿️"
              checked={formData.hasParking}
              onToggle={(checked) => updateFormData('hasParking', checked)}
            />
          </View>

          {/* Additional Notes */}
          <TextInput
            label="Additional Notes"
            placeholder="Any other useful information (accessibility, nearby facilities, etc.)"
            value={formData.notes}
            onChangeText={(text) => updateFormData('notes', text)}
            multiline
            numberOfLines={2}
            maxLength={300}
          />

          {/* Player Capacity */}
          <TextInput
            label="Player Capacity"
            placeholder="Maximum number of players (e.g., 10, 22)"
            value={formData.playerCapacity?.toString() || ''}
            onChangeText={(text) => {
              const num = parseInt(text, 10);
              updateFormData('playerCapacity', isNaN(num) ? null : num);
            }}
            keyboardType="number-pad"
            hint="Optional - How many players can comfortably play here?"
            error={errors.playerCapacity}
          />

          {/* Submit Button */}
          <View style={styles.submitContainer}>
            {isSubmitting ? (
              <View style={styles.progressContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={themedStyles.progressText}>Uploading... {uploadProgress}%</Text>
                <View style={themedStyles.progressBar}>
                  <View style={[themedStyles.progressFill, { width: `${uploadProgress}%` }]} />
                </View>
              </View>
            ) : (
              <Button
                title="Submit Field for Review"
                onPress={handleSubmit}
                size="large"
                disabled={isSubmitting}
              />
            )}
          </View>

          {/* Disclaimer */}
          <Text style={themedStyles.disclaimer}>
            By submitting, you confirm this is a public football field and the information provided
            is accurate. Submissions are reviewed before being published.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Validation Error Snackbar */}
      <Snackbar
        visible={!!validationError}
        message={validationError || ''}
        type="error"
        onDismiss={clearValidationError}
        duration={4000}
      />
    </SafeAreaView>
  );
}

// Static styles that don't depend on theme
const styles = StyleSheet.create({
  headerRight: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  progressContainer: {
    alignItems: 'center',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: spacing.md,
  },
  submitContainer: {
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
});

/* eslint-disable react-native/no-unused-styles */
// Dynamic styles that depend on theme colors
const createThemedStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    closeButton: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 20,
      height: 40,
      justifyContent: 'center',
      width: 40,
    },
    closeButtonText: {
      color: colors.text.secondary,
      fontSize: 18,
    },
    container: {
      backgroundColor: colors.background,
      flex: 1,
    },
    disclaimer: {
      color: colors.text.muted,
      fontSize: typography.sizes.xs,
      lineHeight: 16,
      textAlign: 'center',
    },
    header: {
      alignItems: 'center',
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    headerTitle: {
      color: colors.text.primary,
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.semibold,
    },
    intro: {
      backgroundColor: colors.primaryLight + '15',
      borderRadius: borderRadius.lg,
      marginBottom: spacing.lg,
      padding: spacing.md,
    },
    introText: {
      color: colors.text.secondary,
      fontSize: typography.sizes.sm,
      lineHeight: 20,
    },
    introTitle: {
      color: colors.primary,
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.semibold,
      marginBottom: spacing.xs,
    },
    progressBar: {
      backgroundColor: colors.surface,
      borderRadius: 2,
      height: 4,
      overflow: 'hidden',
      width: '100%',
    },
    progressFill: {
      backgroundColor: colors.primary,
      height: '100%',
    },
    progressText: {
      color: colors.text.secondary,
      fontSize: typography.sizes.sm,
      marginBottom: spacing.sm,
      marginTop: spacing.sm,
    },
    sectionTitle: {
      color: colors.text.primary,
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.semibold,
      marginBottom: spacing.sm,
    },
  });
/* eslint-enable react-native/no-unused-styles */
