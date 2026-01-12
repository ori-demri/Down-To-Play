import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { spacing, borderRadius, typography, ThemeColors } from '@/constants';
import { useTheme, useThemedStyles } from '@/features/theme';
import { appLogger } from '@/utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Check if an error is the expo-updates IOException that occurs during OAuth in Expo Go
 * This error doesn't affect app functionality and can be safely ignored
 */
function isExpoUpdatesError(error: Error | null): boolean {
  if (!error) return false;
  const message = error.message || '';
  return (
    message.includes('Failed to download remote update') ||
    message.includes('java.io.IOException') ||
    message.includes('IOException')
  );
}

/**
 * Themed fallback UI component
 */
function ErrorFallbackUI({ error, onRetry }: { error: Error | null; onRetry: () => void }) {
  const { isDark } = useTheme();
  const themedStyles = useThemedStyles(createThemedStyles, isDark);

  return (
    <View style={themedStyles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>😕</Text>
        <Text style={themedStyles.title}>Something went wrong</Text>
        <Text style={themedStyles.message}>
          We&apos;re sorry, but something unexpected happened. Please try again.
        </Text>
        {__DEV__ && error && (
          <View style={themedStyles.errorDetails}>
            <Text style={themedStyles.errorTitle}>Error Details:</Text>
            <Text style={themedStyles.errorText}>{error.message}</Text>
          </View>
        )}
        <TouchableOpacity style={themedStyles.button} onPress={onRetry}>
          <Text style={themedStyles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/**
 * Error Boundary component to catch and handle React errors gracefully
 * Prevents the entire app from crashing due to component errors
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Auto-recover from expo-updates errors - they don't affect functionality
    if (isExpoUpdatesError(error)) {
      appLogger.warn('ErrorBoundary: Auto-recovering from expo-updates error', {
        error: error.message,
      });
      // Return no error state to continue rendering normally
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Don't log expo-updates errors as errors, just warnings
    if (isExpoUpdatesError(error)) {
      appLogger.warn('ErrorBoundary: Caught expo-updates error (non-fatal)', {
        error: error.message,
      });
      // Force re-render to recover
      this.setState({ hasError: false, error: null });
      return;
    }

    appLogger.error('ErrorBoundary caught an error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // Here you could also send to error reporting service like Sentry
    // Sentry.captureException(error, { extra: errorInfo });
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Render custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI with theme support
      return <ErrorFallbackUI error={this.state.error} onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
});

/* eslint-disable react-native/no-unused-styles */
const createThemedStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    button: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
    },
    buttonText: {
      color: colors.text.inverse,
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.semibold,
    },
    container: {
      alignItems: 'center',
      backgroundColor: colors.background,
      flex: 1,
      justifyContent: 'center',
      padding: spacing.lg,
    },
    errorDetails: {
      backgroundColor: colors.error + '15',
      borderRadius: borderRadius.md,
      marginBottom: spacing.lg,
      padding: spacing.md,
      width: '100%',
    },
    errorText: {
      color: colors.error,
      fontFamily: 'monospace',
      fontSize: typography.sizes.xs,
    },
    errorTitle: {
      color: colors.error,
      fontSize: typography.sizes.sm,
      fontWeight: typography.weights.semibold,
      marginBottom: spacing.xs,
    },
    message: {
      color: colors.text.secondary,
      fontSize: typography.sizes.md,
      lineHeight: 22,
      marginBottom: spacing.lg,
      textAlign: 'center',
    },
    title: {
      color: colors.text.primary,
      fontSize: typography.sizes.xl,
      fontWeight: typography.weights.bold,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
  });
/* eslint-enable react-native/no-unused-styles */
