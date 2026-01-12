/**
 * Loading Screen
 * Shown while checking authentication state
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { spacing, typography, ThemeColors } from '@/constants';
import { useTheme, useThemedStyles } from '@/features/theme';

export function LoadingScreen() {
  const { colors, isDark } = useTheme();
  const themedStyles = useThemedStyles(createThemedStyles, isDark);

  return (
    <View style={themedStyles.container}>
      <View style={styles.content}>
        <View style={themedStyles.logoContainer}>
          <Text style={styles.logoEmoji}>⚽</Text>
        </View>
        <Text style={themedStyles.appName}>Down To Play</Text>
        <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 40,
  },
  spinner: {
    marginTop: spacing.md,
  },
});

/* eslint-disable react-native/no-unused-styles */
const createThemedStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    appName: {
      color: colors.text.primary,
      fontSize: typography.sizes.xl,
      fontWeight: typography.weights.bold,
      marginBottom: spacing.lg,
    },
    container: {
      backgroundColor: colors.background,
      flex: 1,
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
  });
/* eslint-enable react-native/no-unused-styles */
