import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { spacing, ThemeColors } from '@/constants';
import { useTheme, useThemedStyles } from '@/features/theme';

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
  const { isDark } = useTheme();
  const themedStyles = useThemedStyles(createThemedStyles, isDark);

  return (
    <TouchableOpacity
      style={[
        themedStyles.container,
        label ? styles.extended : styles.circular,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <Text style={themedStyles.icon}>{icon}</Text>
      {label && <Text style={themedStyles.label}>{label}</Text>}
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
});

/* eslint-disable react-native/no-unused-styles */
const createThemedStyles = (colors: ThemeColors) =>
  StyleSheet.create({
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
/* eslint-enable react-native/no-unused-styles */
