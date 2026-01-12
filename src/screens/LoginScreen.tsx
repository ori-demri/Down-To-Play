/**
 * Login / Onboarding Screen
 * Provides Google Sign-In with clear value proposition
 */

import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Snackbar } from '@/components/ui/Snackbar';
import { spacing, borderRadius, typography, ThemeColors } from '@/constants';
import { useAuth } from '@/features/auth';
import { useTheme, useThemedStyles } from '@/features/theme';

interface LoginScreenProps {
  /** Called when user chooses to skip login */
  onSkip?: () => void;
  /** Called after successful login */
  onSuccess?: () => void;
  /** Whether to show the skip option */
  showSkip?: boolean;
}

export function LoginScreen({ onSkip, onSuccess, showSkip = true }: LoginScreenProps) {
  const { signInWithGoogle, isLoading } = useAuth();
  const { colors, isDark } = useTheme();
  const themedStyles = useThemedStyles(createThemedStyles, isDark);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = useCallback(async () => {
    setError(null);

    const result = await signInWithGoogle();

    if (result.success) {
      onSuccess?.();
    } else if (!result.cancelled && result.error) {
      setError(result.error);
    }
  }, [signInWithGoogle, onSuccess]);

  const handleSkip = useCallback(() => {
    onSkip?.();
  }, [onSkip]);

  return (
    <SafeAreaView style={themedStyles.container}>
      <View style={styles.content}>
        {/* Logo & Branding */}
        <View style={styles.brandingSection}>
          <View style={themedStyles.logoContainer}>
            <Text style={styles.logoEmoji}>⚽</Text>
          </View>
          <Text style={themedStyles.appName}>Down To Play</Text>
          <Text style={themedStyles.tagline}>Find your next game</Text>
        </View>

        {/* Value Proposition */}
        <View style={styles.valueSection}>
          <ValueItem icon="📍" text="Discover football fields near you" colors={colors} />
          <ValueItem icon="👥" text="Connect with local players" colors={colors} />
          <ValueItem icon="🏟️" text="Organize and join pickup games" colors={colors} />
          <ValueItem icon="⭐" text="Rate and review playing spots" colors={colors} />
        </View>

        {/* Sign In Section */}
        <View style={styles.authSection}>
          <TouchableOpacity
            style={[themedStyles.googleButton, isLoading && styles.googleButtonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.text.primary} />
            ) : (
              <>
                <Text style={styles.googleIconText}>G</Text>
                <Text style={themedStyles.googleButtonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          {showSkip && (
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip} disabled={isLoading}>
              <Text style={themedStyles.skipButtonText}>Skip for now</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Legal */}
        <View style={styles.legalSection}>
          <Text style={themedStyles.legalText}>
            By continuing, you agree to our{' '}
            <Text style={themedStyles.legalLink}>Terms of Service</Text> and{' '}
            <Text style={themedStyles.legalLink}>Privacy Policy</Text>
          </Text>
        </View>
      </View>

      {/* Error Snackbar */}
      <Snackbar
        visible={!!error}
        message={error || ''}
        type="error"
        onDismiss={() => setError(null)}
        duration={5000}
      />
    </SafeAreaView>
  );
}

/**
 * Value proposition item component
 */
function ValueItem({ icon, text, colors }: { icon: string; text: string; colors: ThemeColors }) {
  return (
    <View style={styles.valueItem}>
      <Text style={styles.valueIcon}>{icon}</Text>
      <Text style={[styles.valueText, { color: colors.text.primary }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  authSection: {
    paddingHorizontal: spacing.xl,
    width: '100%',
  },
  brandingSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  googleButtonDisabled: {
    opacity: 0.7,
  },
  googleIconText: {
    color: '#4285F4',
    fontSize: 20,
    fontWeight: typography.weights.bold,
    marginRight: spacing.sm,
  },
  legalSection: {
    bottom: spacing.lg,
    paddingHorizontal: spacing.xl,
    position: 'absolute',
  },
  logoEmoji: {
    fontSize: 40,
  },
  skipButton: {
    alignItems: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  valueIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  valueItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  valueSection: {
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  valueText: {
    flex: 1,
    fontSize: typography.sizes.md,
  },
});

/* eslint-disable react-native/no-unused-styles */
const createThemedStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    appName: {
      color: colors.text.primary,
      fontSize: 32,
      fontWeight: typography.weights.bold,
      marginBottom: spacing.xs,
    },
    container: {
      backgroundColor: colors.background,
      flex: 1,
    },
    googleButton: {
      alignItems: 'center',
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      elevation: 2,
      flexDirection: 'row',
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    googleButtonText: {
      color: colors.text.primary,
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.semibold,
    },
    legalLink: {
      color: colors.primary,
      textDecorationLine: 'underline',
    },
    legalText: {
      color: colors.text.muted,
      fontSize: typography.sizes.xs,
      lineHeight: 18,
      textAlign: 'center',
    },
    logoContainer: {
      alignItems: 'center',
      backgroundColor: colors.primary + '15',
      borderRadius: 40,
      height: 80,
      justifyContent: 'center',
      marginBottom: spacing.md,
      width: 80,
    },
    skipButtonText: {
      color: colors.text.secondary,
      fontSize: typography.sizes.sm,
    },
    tagline: {
      color: colors.text.secondary,
      fontSize: typography.sizes.md,
    },
  });
/* eslint-enable react-native/no-unused-styles */
