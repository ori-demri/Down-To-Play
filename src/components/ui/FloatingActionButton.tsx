import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
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
  container: {
    position: 'absolute',
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  circular: {
    width: 56,
    height: 56,
    borderRadius: 28,
    right: spacing.md,
    bottom: spacing.xl + 60, // Above the center button
  },
  extended: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 28,
    right: spacing.md,
    bottom: spacing.xl + 60,
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    fontSize: 24,
    color: colors.text.inverse,
  },
  label: {
    color: colors.text.inverse,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
});
