/**
 * Profile Button Component
 * Shows user avatar when logged in, or sign-in prompt when guest
 */

import React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import { typography, ThemeColors } from '@/constants';
import { useAuth } from '@/features/auth';
import { useTheme, useThemedStyles } from '@/features/theme';

interface ProfileButtonProps {
  onPress: () => void;
}

export function ProfileButton({ onPress }: ProfileButtonProps) {
  const { isAuthenticated, profile } = useAuth();
  const { isDark } = useTheme();
  const themedStyles = useThemedStyles(createThemedStyles, isDark);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      {isAuthenticated && profile ? (
        // Authenticated user - show avatar
        profile.avatarUrl ? (
          <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={themedStyles.avatarPlaceholder}>
            <Text style={themedStyles.avatarInitial}>
              {profile.displayName?.[0]?.toUpperCase() || profile.username[0].toUpperCase()}
            </Text>
          </View>
        )
      ) : (
        // Guest - show sign in icon
        <View style={themedStyles.guestContainer}>
          <Text style={styles.guestIcon}>👤</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 20,
    height: 40,
    width: 40,
  },
  container: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  guestIcon: {
    fontSize: 20,
  },
});

/* eslint-disable react-native/no-unused-styles */
const createThemedStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    avatarInitial: {
      color: colors.primary,
      fontSize: typography.sizes.md,
      fontWeight: typography.weights.semibold,
    },
    avatarPlaceholder: {
      alignItems: 'center',
      backgroundColor: colors.primary + '20',
      borderRadius: 20,
      height: 40,
      justifyContent: 'center',
      width: 40,
    },
    guestContainer: {
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: 20,
      height: 40,
      justifyContent: 'center',
      width: 40,
    },
  });
/* eslint-enable react-native/no-unused-styles */
