import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { spacing, borderRadius, typography, ThemeColors } from '@/constants';
import { useTheme, useThemedStyles } from '@/features/theme';

type SnackbarType = 'error' | 'success' | 'warning' | 'info';

interface SnackbarProps {
  visible: boolean;
  message: string;
  type?: SnackbarType;
  duration?: number;
  onDismiss: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
}

const getTypeConfig = (
  colors: ThemeColors
): Record<SnackbarType, { backgroundColor: string; icon: string }> => ({
  error: { backgroundColor: colors.error, icon: '✕' },
  success: { backgroundColor: colors.success, icon: '✓' },
  warning: { backgroundColor: colors.warning, icon: '⚠' },
  info: { backgroundColor: colors.primary, icon: 'ℹ' },
});

export function Snackbar({
  visible,
  message,
  type = 'error',
  duration = 4000,
  onDismiss,
  action,
}: SnackbarProps) {
  const { colors, isDark } = useTheme();
  const themedStyles = useThemedStyles(createThemedStyles, isDark);
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide in
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, duration]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!visible) return null;

  const config = getTypeConfig(colors)[type];

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: config.backgroundColor },
        { transform: [{ translateY }], opacity },
      ]}
    >
      <View style={styles.content}>
        <Text style={themedStyles.message} numberOfLines={2}>
          {message}
        </Text>
      </View>
      {action && (
        <TouchableOpacity onPress={action.onPress} style={styles.actionButton}>
          <Text style={themedStyles.actionLabel}>{action.label}</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={handleDismiss} style={styles.dismissButton}>
        <Text style={themedStyles.dismissIcon}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  container: {
    alignItems: 'center',
    borderRadius: borderRadius.md,
    bottom: 24,
    elevation: 6,
    flexDirection: 'row',
    left: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    position: 'absolute',
    right: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 9999,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  dismissButton: {
    marginLeft: spacing.xs,
    padding: spacing.xs,
  },
});

/* eslint-disable react-native/no-unused-styles */
const createThemedStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    actionLabel: {
      color: colors.background,
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.bold,
      textTransform: 'uppercase',
    },
    dismissIcon: {
      color: colors.background,
      fontSize: 14,
      opacity: 0.8,
    },
    message: {
      color: colors.background,
      flex: 1,
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.medium,
    },
  });
/* eslint-enable react-native/no-unused-styles */
