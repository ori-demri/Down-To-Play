/**
 * Profile Button Component
 * Shows user avatar when logged in, or sign-in prompt when guest
 */

import React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import { colors, typography } from '@/constants';
import { useAuth } from '@/features/auth';

interface ProfileButtonProps {
  onPress: () => void;
}

export function ProfileButton({ onPress }: ProfileButtonProps) {
  const { isAuthenticated, profile } = useAuth();

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      {isAuthenticated && profile ? (
        // Authenticated user - show avatar
        profile.avatarUrl ? (
          <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>
              {profile.displayName?.[0]?.toUpperCase() || profile.username[0].toUpperCase()}
            </Text>
          </View>
        )
      ) : (
        // Guest - show sign in icon
        <View style={styles.guestContainer}>
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
  container: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  guestContainer: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  guestIcon: {
    fontSize: 20,
  },
});
