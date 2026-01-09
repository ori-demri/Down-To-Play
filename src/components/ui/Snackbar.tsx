import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/constants';

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

const TYPE_CONFIG: Record<SnackbarType, { backgroundColor: string; icon: string }> = {
  error: { backgroundColor: colors.error, icon: '✕' },
  success: { backgroundColor: colors.success, icon: '✓' },
  warning: { backgroundColor: '#F59E0B', icon: '⚠' },
  info: { backgroundColor: colors.primary, icon: 'ℹ' },
};

export function Snackbar({
  visible,
  message,
  type = 'error',
  duration = 4000,
  onDismiss,
  action,
}: SnackbarProps) {
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

  const config = TYPE_CONFIG[type];

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: config.backgroundColor },
        { transform: [{ translateY }], opacity },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      </View>
      {action && (
        <TouchableOpacity onPress={action.onPress} style={styles.actionButton}>
          <Text style={styles.actionLabel}>{action.label}</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={handleDismiss} style={styles.dismissButton}>
        <Text style={styles.dismissIcon}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 9999,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 16,
    color: colors.background,
    marginRight: spacing.sm,
  },
  message: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.background,
    fontWeight: typography.weights.medium,
  },
  actionButton: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  actionLabel: {
    fontSize: typography.sizes.sm,
    color: colors.background,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
  },
  dismissButton: {
    marginLeft: spacing.xs,
    padding: spacing.xs,
  },
  dismissIcon: {
    fontSize: 14,
    color: colors.background,
    opacity: 0.8,
  },
});
