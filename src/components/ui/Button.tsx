import React, { memo } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { spacing, borderRadius, typography, ThemeColors } from '@/constants';
import { useTheme, useThemedStyles } from '@/features/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button = memo(function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}: ButtonProps) {
  const { colors, isDark } = useTheme();
  const themedStyles = useThemedStyles(createThemedStyles, isDark);
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        themedStyles[variant],
        styles[`${size}Size`],
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.text.inverse : colors.primary}
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              themedStyles[`${variant}Text`],
              styles[`${size}Text`],
              icon ? styles.textWithIcon : null,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  largeSize: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md + 2,
  },
  largeText: {
    fontSize: typography.sizes.lg,
  },
  mediumSize: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  mediumText: {
    fontSize: typography.sizes.md,
  },
  smallSize: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  smallText: {
    fontSize: typography.sizes.sm,
  },
  text: {
    fontWeight: typography.weights.semibold,
  },
  textWithIcon: {
    marginLeft: spacing.sm,
  },
});

/* eslint-disable react-native/no-unused-styles */
const createThemedStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    ghost: {
      backgroundColor: 'transparent',
    },
    ghostText: {
      color: colors.primary,
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: colors.primary,
      borderWidth: 1.5,
    },
    outlineText: {
      color: colors.primary,
    },
    primary: {
      backgroundColor: colors.primary,
    },
    primaryText: {
      color: colors.text.inverse,
    },
    secondary: {
      backgroundColor: colors.surface,
    },
    secondaryText: {
      color: colors.text.primary,
    },
  });
/* eslint-enable react-native/no-unused-styles */
