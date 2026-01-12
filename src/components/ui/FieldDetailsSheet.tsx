import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { spacing, borderRadius, typography, ThemeColors } from '@/constants';
import { useTheme, useThemedStyles } from '@/features/theme';
import { Field, SurfaceType } from '@/types';

interface FieldDetailsSheetProps {
  field: Field | null;
  onClose: () => void;
  onCreateGame?: (field: Field) => void;
}

const formatSurfaceType = (type: SurfaceType): string => {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

interface AmenityItemProps {
  icon: string;
  label: string;
  available: boolean;
  colors: ThemeColors;
}

function AmenityItem({ icon, label, available, colors }: AmenityItemProps) {
  return (
    <View style={[styles.amenityItem, !available && styles.amenityUnavailable]}>
      <Text style={styles.amenityIcon}>{icon}</Text>
      <Text
        style={[
          styles.amenityLabelBase,
          { color: colors.text.primary },
          !available && styles.amenityLabelUnavailable,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

export const FieldDetailsSheet = memo(function FieldDetailsSheet({
  field,
  onClose,
  onCreateGame,
}: FieldDetailsSheetProps) {
  const { colors, isDark } = useTheme();
  const themedStyles = useThemedStyles(createThemedStyles, isDark);

  const handleCreateGame = useCallback(() => {
    if (field) {
      onCreateGame?.(field);
    }
  }, [field, onCreateGame]);

  if (!field) return null;

  return (
    <View style={themedStyles.container}>
      {/* Handle bar */}
      <View style={styles.handleContainer}>
        <View style={themedStyles.handle} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={themedStyles.title}>{field.name}</Text>
            <TouchableOpacity onPress={onClose} style={themedStyles.closeButton}>
              <Text style={themedStyles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.badges}>
            <View style={[styles.badge, themedStyles.surfaceBadge]}>
              <Text style={themedStyles.badgeText}>{formatSurfaceType(field.surface_type)}</Text>
            </View>
            {field.is_free && (
              <View style={[styles.badge, themedStyles.freeBadge]}>
                <Text style={themedStyles.freeBadgeText}>FREE</Text>
              </View>
            )}
          </View>
        </View>

        {/* Description */}
        {field.description && <Text style={themedStyles.description}>{field.description}</Text>}

        {/* Location */}
        {field.address && (
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={themedStyles.locationText}>
              {field.address}
              {field.city && `, ${field.city}`}
            </Text>
          </View>
        )}

        {/* Capacity */}
        {field.player_capacity && (
          <View style={styles.capacityRow}>
            <Text style={styles.capacityIcon}>👥</Text>
            <Text style={themedStyles.capacityText}>Up to {field.player_capacity} players</Text>
          </View>
        )}

        {/* Amenities */}
        <Text style={themedStyles.sectionTitle}>Amenities</Text>
        <View style={styles.amenitiesGrid}>
          <AmenityItem icon="💡" label="Lights" available={field.has_lights} colors={colors} />
          <AmenityItem icon="🥅" label="Goals" available={field.has_goals} colors={colors} />
          <AmenityItem
            icon="🚿"
            label="Changing Rooms"
            available={field.has_changing_rooms}
            colors={colors}
          />
          <AmenityItem icon="🅿️" label="Parking" available={field.has_parking} colors={colors} />
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={themedStyles.primaryButton} onPress={handleCreateGame}>
            <Text style={themedStyles.primaryButtonText}>Create Game Here</Text>
          </TouchableOpacity>

          <TouchableOpacity style={themedStyles.secondaryButton}>
            <Text style={themedStyles.secondaryButtonText}>Get Directions</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
});

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  actions: {
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
  },
  amenityIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  amenityItem: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    width: '50%',
  },
  amenityLabelBase: {
    fontSize: typography.sizes.sm,
  },
  amenityLabelUnavailable: {
    textDecorationLine: 'line-through',
  },
  amenityUnavailable: {
    opacity: 0.4,
  },
  badge: {
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badges: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  capacityIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  capacityRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  content: {
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  header: {
    marginBottom: spacing.md,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  locationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  titleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

/* eslint-disable react-native/no-unused-styles */
const createThemedStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    badgeText: {
      color: colors.primary,
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.medium,
    },
    capacityText: {
      color: colors.text.secondary,
      fontSize: typography.sizes.sm,
    },
    closeButton: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 16,
      height: 32,
      justifyContent: 'center',
      width: 32,
    },
    closeButtonText: {
      color: colors.text.secondary,
      fontSize: 16,
    },
    container: {
      backgroundColor: colors.background,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      bottom: 0,
      elevation: 8,
      left: 0,
      maxHeight: SCREEN_HEIGHT * 0.6,
      position: 'absolute',
      right: 0,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
    },
    description: {
      color: colors.text.secondary,
      fontSize: typography.sizes.md,
      lineHeight: 22,
      marginBottom: spacing.md,
    },
    freeBadge: {
      backgroundColor: colors.success,
    },
    freeBadgeText: {
      color: colors.text.inverse,
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.bold,
    },
    handle: {
      backgroundColor: colors.border,
      borderRadius: 2,
      height: 4,
      width: 40,
    },
    locationText: {
      color: colors.text.secondary,
      flex: 1,
      fontSize: typography.sizes.sm,
    },
    primaryButton: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      marginBottom: spacing.sm,
      paddingVertical: spacing.md,
    },
    primaryButtonText: {
      color: colors.text.inverse,
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.semibold,
    },
    secondaryButton: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      paddingVertical: spacing.md,
    },
    secondaryButtonText: {
      color: colors.text.primary,
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.medium,
    },
    sectionTitle: {
      color: colors.text.primary,
      fontSize: typography.sizes.lg,
      fontWeight: typography.weights.semibold,
      marginBottom: spacing.sm,
      marginTop: spacing.sm,
    },
    surfaceBadge: {
      backgroundColor: colors.primaryLight + '20',
    },
    title: {
      color: colors.text.primary,
      flex: 1,
      fontSize: typography.sizes.xxl,
      fontWeight: typography.weights.bold,
      marginRight: spacing.md,
    },
  });
/* eslint-enable react-native/no-unused-styles */
