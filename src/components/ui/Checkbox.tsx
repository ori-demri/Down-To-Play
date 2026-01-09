import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/constants';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
  disabled?: boolean;
  icon?: string;
}

export function Checkbox({
  label,
  checked,
  onToggle,
  disabled = false,
  icon,
}: CheckboxProps) {
  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled]}
      onPress={() => !disabled && onToggle(!checked)}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
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
  icon: {
    fontSize: 18,
    marginLeft: spacing.sm,
  },
  label: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  labelDisabled: {
    color: colors.text.muted,
  },
});
