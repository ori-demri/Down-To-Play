import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '@/constants';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: string;
  label?: string;
  style?: ViewStyle;
  disabled?: boolean;
}

export function FloatingActionButton({
  onPress,
  icon = '+',
  label,
  style,
  disabled = false,
}: FloatingActionButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        label ? styles.extended : styles.circular,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <Text style={styles.icon}>{icon}</Text>
      {label && <Text style={styles.label}>{label}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  circular: {
    borderRadius: 28,
    bottom: spacing.xl + 60,
    height: 56,
    right: spacing.md,
    width: 56, // Above the center button
  },
  container: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    elevation: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  disabled: {
    opacity: 0.5,
  },
  extended: {
    borderRadius: 28,
    bottom: spacing.xl + 60,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    right: spacing.md,
  },
  icon: {
    color: colors.text.inverse,
    fontSize: 24,
  },
  label: {
    color: colors.text.inverse,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
});
