import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SurfaceType } from '@/types';
import { SURFACE_TYPE_LABELS, SURFACE_TYPE_ICONS } from '@/features/fields/types';
import { colors, spacing, borderRadius, typography } from '@/constants';

interface SurfaceTypePickerProps {
  value: SurfaceType;
  onChange: (value: SurfaceType) => void;
  error?: string;
}

const SURFACE_TYPES: SurfaceType[] = [
  'natural_grass',
  'synthetic_turf',
  'artificial_grass',
  'asphalt',
  'concrete',
  'dirt',
  'sand',
  'indoor',
];

export function SurfaceTypePicker({ value, onChange, error }: SurfaceTypePickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Surface Type *</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {SURFACE_TYPES.map((type) => {
          const isSelected = value === type;
          return (
            <TouchableOpacity
              key={type}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => onChange(type)}
              activeOpacity={0.7}
            >
              <Text style={styles.optionIcon}>{SURFACE_TYPE_ICONS[type]}</Text>
              <Text
                style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}
                numberOfLines={2}
              >
                {SURFACE_TYPE_LABELS[type]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  scrollContent: {
    paddingRight: spacing.md,
  },
  option: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 90,
  },
  optionSelected: {
    backgroundColor: colors.primaryLight + '20',
    borderColor: colors.primary,
  },
  optionIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  optionLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  optionLabelSelected: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  error: {
    fontSize: typography.sizes.sm,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
