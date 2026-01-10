/**
 * Login / Onboarding Screen
 * Provides Google Sign-In with clear value proposition
 */

import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Snackbar } from '@/components/ui';
import { colors, spacing, borderRadius, typography } from '@/constants';
import { useAuth } from '@/features/auth';

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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo & Branding */}
        <View style={styles.brandingSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>⚽</Text>
          </View>
          <Text style={styles.appName}>Down To Play</Text>
          <Text style={styles.tagline}>Find your next game</Text>
        </View>

        {/* Value Proposition */}
        <View style={styles.valueSection}>
          <ValueItem icon="📍" text="Discover football fields near you" />
          <ValueItem icon="👥" text="Connect with local players" />
          <ValueItem icon="🏟️" text="Organize and join pickup games" />
          <ValueItem icon="⭐" text="Rate and review playing spots" />
        </View>

        {/* Sign In Section */}
        <View style={styles.authSection}>
          <TouchableOpacity
            style={[styles.googleButton, isLoading && styles.googleButtonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.text.primary} />
            ) : (
              <>
                <Text style={styles.googleIconText}>G</Text>
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          {showSkip && (
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip} disabled={isLoading}>
              <Text style={styles.skipButtonText}>Skip for now</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Legal */}
        <View style={styles.legalSection}>
          <Text style={styles.legalText}>
            By continuing, you agree to our <Text style={styles.legalLink}>Terms of Service</Text>{' '}
            and <Text style={styles.legalLink}>Privacy Policy</Text>
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
function ValueItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.valueItem}>
      <Text style={styles.valueIcon}>{icon}</Text>
      <Text style={styles.valueText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  appName: {
    color: colors.text.primary,
    fontSize: 32,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  authSection: {
    paddingHorizontal: spacing.xl,
    width: '100%',
  },
  brandingSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
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
  googleButtonDisabled: {
    opacity: 0.7,
  },
  googleButtonText: {
    color: colors.text.primary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  googleIconText: {
    color: '#4285F4',
    fontSize: 20,
    fontWeight: typography.weights.bold,
    marginRight: spacing.sm,
  },
  legalLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  legalSection: {
    bottom: spacing.lg,
    paddingHorizontal: spacing.xl,
    position: 'absolute',
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
  logoEmoji: {
    fontSize: 40,
  },
  skipButton: {
    alignItems: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  skipButtonText: {
    color: colors.text.secondary,
    fontSize: typography.sizes.sm,
  },
  tagline: {
    color: colors.text.secondary,
    fontSize: typography.sizes.md,
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
    color: colors.text.primary,
    flex: 1,
    fontSize: typography.sizes.md,
  },
});
