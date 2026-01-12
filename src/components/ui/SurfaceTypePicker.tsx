import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { spacing, borderRadius, typography, ThemeColors } from '@/constants';
import { SURFACE_TYPE_LABELS, SURFACE_TYPE_ICONS } from '@/features/fields/types';
import { useTheme, useThemedStyles } from '@/features/theme';
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
  const { isDark } = useTheme();
  const themedStyles = useThemedStyles(createThemedStyles, isDark);

  return (
    <View style={styles.container}>
      <Text style={themedStyles.label}>Surface Type *</Text>
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
              style={[themedStyles.option, isSelected && themedStyles.optionSelected]}
              onPress={() => onChange(type)}
              activeOpacity={0.7}
            >
              <Text style={styles.optionIcon}>{SURFACE_TYPE_ICONS[type]}</Text>
              <Text
                style={[themedStyles.optionLabel, isSelected && themedStyles.optionLabelSelected]}
                numberOfLines={2}
              >
                {SURFACE_TYPE_LABELS[type]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {error && <Text style={themedStyles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  optionIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  scrollContent: {
    paddingRight: spacing.md,
  },
});

/* eslint-disable react-native/no-unused-styles */
const createThemedStyles = (colors: ThemeColors) =>
  StyleSheet.create({
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
  });
/* eslint-enable react-native/no-unused-styles */
