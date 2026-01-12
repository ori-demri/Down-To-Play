import React, { useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  TextInputProps as RNTextInputProps,
  ViewStyle,
} from 'react-native';
import { spacing, borderRadius, typography, ThemeColors } from '@/constants';
import { useTheme, useThemedStyles } from '@/features/theme';

interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  required?: boolean;
}

export function TextInput({
  label,
  error,
  hint,
  containerStyle,
  inputStyle,
  required = false,
  ...props
}: TextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const { colors, isDark } = useTheme();
  const themedStyles = useThemedStyles(createThemedStyles, isDark);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={themedStyles.label}>
          {label}
          {required && <Text style={themedStyles.required}> *</Text>}
        </Text>
      )}
      <RNTextInput
        style={[
          themedStyles.input,
          isFocused && themedStyles.inputFocused,
          error && themedStyles.inputError,
          props.multiline && styles.inputMultiline,
          inputStyle,
        ]}
        placeholderTextColor={colors.text.muted}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        {...props}
      />
      {error && <Text style={themedStyles.error}>{error}</Text>}
      {hint && !error && <Text style={themedStyles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
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
    hint: {
      color: colors.text.muted,
      fontSize: typography.sizes.sm,
      marginTop: spacing.xs,
    },
    input: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      color: colors.text.primary,
      fontSize: typography.sizes.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    inputError: {
      borderColor: colors.error,
    },
    inputFocused: {
      backgroundColor: colors.background,
      borderColor: colors.primary,
    },
    label: {
      color: colors.text.primary,
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.medium,
      marginBottom: spacing.xs,
    },
    required: {
      color: colors.error,
    },
  });
/* eslint-enable react-native/no-unused-styles */
