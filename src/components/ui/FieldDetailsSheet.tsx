import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Field, SurfaceType } from '@/types';
import { colors, spacing, borderRadius, typography } from '@/constants';

interface FieldDetailsSheetProps {
  field: Field | null;
  onClose: () => void;
  onCreateGame?: (field: Field) => void;
}

const formatSurfaceType = (type: SurfaceType): string => {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

interface AmenityItemProps {
  icon: string;
  label: string;
  available: boolean;
}

function AmenityItem({ icon, label, available }: AmenityItemProps) {
  return (
    <View style={[styles.amenityItem, !available && styles.amenityUnavailable]}>
      <Text style={styles.amenityIcon}>{icon}</Text>
      <Text style={[styles.amenityLabel, !available && styles.amenityLabelUnavailable]}>
        {label}
      </Text>
    </View>
  );
}

export const FieldDetailsSheet = memo(function FieldDetailsSheet({ 
  field, 
  onClose, 
  onCreateGame 
}: FieldDetailsSheetProps) {
  const handleCreateGame = useCallback(() => {
    if (field) {
      onCreateGame?.(field);
    }
  }, [field, onCreateGame]);

  if (!field) return null;

  return (
    <View style={styles.container}>
      {/* Handle bar */}
      <View style={styles.handleContainer}>
        <View style={styles.handle} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{field.name}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.badges}>
            <View style={[styles.badge, styles.surfaceBadge]}>
              <Text style={styles.badgeText}>{formatSurfaceType(field.surface_type)}</Text>
            </View>
            {field.is_free && (
              <View style={[styles.badge, styles.freeBadge]}>
                <Text style={styles.freeBadgeText}>FREE</Text>
              </View>
            )}
          </View>
        </View>

        {/* Description */}
        {field.description && (
          <Text style={styles.description}>{field.description}</Text>
        )}

        {/* Location */}
        {field.address && (
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>
              {field.address}
              {field.city && `, ${field.city}`}
            </Text>
          </View>
        )}

        {/* Capacity */}
        {field.player_capacity && (
          <View style={styles.capacityRow}>
            <Text style={styles.capacityIcon}>👥</Text>
            <Text style={styles.capacityText}>
              Up to {field.player_capacity} players
            </Text>
          </View>
        )}

        {/* Amenities */}
        <Text style={styles.sectionTitle}>Amenities</Text>
        <View style={styles.amenitiesGrid}>
          <AmenityItem icon="💡" label="Lights" available={field.has_lights} />
          <AmenityItem icon="🥅" label="Goals" available={field.has_goals} />
          <AmenityItem icon="🚿" label="Changing Rooms" available={field.has_changing_rooms} />
          <AmenityItem icon="🅿️" label="Parking" available={field.has_parking} />
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleCreateGame}
          >
            <Text style={styles.primaryButtonText}>Create Game Here</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Get Directions</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
});

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: SCREEN_HEIGHT * 0.6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.md,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  badges: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
  },
  surfaceBadge: {
    backgroundColor: colors.primaryLight + '20',
  },
  badgeText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
  freeBadge: {
    backgroundColor: colors.success,
  },
  freeBadgeText: {
    fontSize: typography.sizes.sm,
    color: colors.text.inverse,
    fontWeight: typography.weights.bold,
  },
  description: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  locationText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    flex: 1,
  },
  capacityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  capacityIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  capacityText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    paddingVertical: spacing.sm,
  },
  amenityUnavailable: {
    opacity: 0.4,
  },
  amenityIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  amenityLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  amenityLabelUnavailable: {
    textDecorationLine: 'line-through',
  },
  actions: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  primaryButtonText: {
    color: colors.text.inverse,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.text.primary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
});
