import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/constants';
import { SURFACE_TYPE_LABELS, SURFACE_TYPE_ICONS } from '@/features/fields/types';
import { SurfaceType } from '@/types';

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
  error: {
    color: colors.error,
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
  label: {
    color: colors.text.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.sm,
  },
  option: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: 'transparent',
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    justifyContent: 'center',
    marginRight: spacing.sm,
    minWidth: 90,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  optionIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  optionLabel: {
    color: colors.text.secondary,
    fontSize: typography.sizes.xs,
    textAlign: 'center',
  },
  optionLabelSelected: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  optionSelected: {
    backgroundColor: colors.primaryLight + '20',
    borderColor: colors.primary,
  },
  scrollContent: {
    paddingRight: spacing.md,
  },
});
