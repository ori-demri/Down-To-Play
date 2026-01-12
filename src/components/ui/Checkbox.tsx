import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { spacing, borderRadius, typography, ThemeColors } from '@/constants';
import { useTheme, useThemedStyles } from '@/features/theme';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
  disabled?: boolean;
  icon?: string;
}

export function Checkbox({ label, checked, onToggle, disabled = false, icon }: CheckboxProps) {
  const { isDark } = useTheme();
  const themedStyles = useThemedStyles(createThemedStyles, isDark);

  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled]}
      onPress={() => !disabled && onToggle(!checked)}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View style={[themedStyles.checkbox, checked && themedStyles.checkboxChecked]}>
        {checked && <Text style={themedStyles.checkmark}>✓</Text>}
      </View>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={[themedStyles.label, disabled && themedStyles.labelDisabled]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: spacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    fontSize: 18,
    marginLeft: spacing.sm,
  },
});

/* eslint-disable react-native/no-unused-styles */
const createThemedStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    checkbox: {
      alignItems: 'center',
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderRadius: borderRadius.sm,
      borderWidth: 2,
      height: 24,
      justifyContent: 'center',
      width: 24,
    },
    checkboxChecked: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    checkmark: {
      color: colors.text.inverse,
      fontSize: 14,
      fontWeight: typography.weights.bold,
    },
    label: {
      color: colors.text.primary,
      flex: 1,
      fontSize: typography.sizes.md,
      marginLeft: spacing.sm,
    },
    labelDisabled: {
      color: colors.text.muted,
    },
  });
/* eslint-enable react-native/no-unused-styles */
