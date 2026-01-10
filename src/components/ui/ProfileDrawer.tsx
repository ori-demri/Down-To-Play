/**
 * Profile Drawer Component
 * Side drawer showing user profile and options
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '@/constants';
import { useAuth } from '@/features/auth';

interface ProfileDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSignIn: () => void;
}

export function ProfileDrawer({ visible, onClose, onSignIn }: ProfileDrawerProps) {
  const { isAuthenticated, profile, user, signOut, isLoading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        {/* Drawer */}
        <SafeAreaView style={styles.drawer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            {isAuthenticated && profile ? (
              // Authenticated User
              <>
                <View style={styles.profileSection}>
                  {profile.avatarUrl ? (
                    <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarInitial}>
                        {profile.displayName?.[0]?.toUpperCase() ||
                          profile.username[0].toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.displayName}>{profile.displayName || profile.username}</Text>
                  <Text style={styles.email}>{user?.email}</Text>
                </View>

                {/* eslint-disable @typescript-eslint/no-empty-function */}
                <View style={styles.menuSection}>
                  <MenuItem icon="👤" label="Edit Profile" onPress={() => {}} />
                  <MenuItem icon="📍" label="My Fields" onPress={() => {}} />
                  <MenuItem icon="⚽" label="My Games" onPress={() => {}} />
                  <MenuItem icon="⚙️" label="Settings" onPress={() => {}} />
                </View>
                {/* eslint-enable @typescript-eslint/no-empty-function */}

                <View style={styles.footerSection}>
                  <TouchableOpacity
                    style={styles.signOutButton}
                    onPress={handleSignOut}
                    disabled={isLoading}
                  >
                    <Text style={styles.signOutText}>
                      {isLoading ? 'Signing out...' : 'Sign Out'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              // Guest User
              <>
                <View style={styles.guestSection}>
                  <View style={styles.guestIconContainer}>
                    <Text style={styles.guestIcon}>👤</Text>
                  </View>
                  <Text style={styles.guestTitle}>Welcome, Guest!</Text>
                  <Text style={styles.guestSubtitle}>
                    Sign in to add fields, join games, and connect with other players.
                  </Text>
                  <TouchableOpacity style={styles.signInButton} onPress={onSignIn}>
                    <Text style={styles.signInText}>Sign In</Text>
                  </TouchableOpacity>
                </View>

                {/* eslint-disable @typescript-eslint/no-empty-function */}
                <View style={styles.menuSection}>
                  <MenuItem icon="⚙️" label="Settings" onPress={() => {}} />
                  <MenuItem icon="❓" label="Help & Support" onPress={() => {}} />
                </View>
                {/* eslint-enable @typescript-eslint/no-empty-function */}
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

/**
 * Menu Item Component
 */
function MenuItem({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 40,
    height: 80,
    marginBottom: spacing.md,
    width: 80,
  },
  avatarInitial: {
    color: colors.primary,
    fontSize: 32,
    fontWeight: typography.weights.bold,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 80,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  closeButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  closeIcon: {
    color: colors.text.secondary,
    fontSize: 20,
  },
  displayName: {
    color: colors.text.primary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  drawer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
    width: '100%',
  },
  email: {
    color: colors.text.secondary,
    fontSize: typography.sizes.sm,
  },
  footerSection: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  guestIcon: {
    fontSize: 40,
  },
  guestIconContainer: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 80,
  },
  guestSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  guestSubtitle: {
    color: colors.text.secondary,
    fontSize: typography.sizes.sm,
    lineHeight: 20,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  guestTitle: {
    color: colors.text.primary,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.sm,
  },
  header: {
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  menuArrow: {
    color: colors.text.muted,
    fontSize: 20,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  menuItem: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  menuLabel: {
    color: colors.text.primary,
    flex: 1,
    fontSize: typography.sizes.md,
  },
  menuSection: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingVertical: spacing.sm,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  signInButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  signInText: {
    color: colors.background,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  signOutButton: {
    alignItems: 'center',
    borderColor: colors.error,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingVertical: spacing.sm,
  },
  signOutText: {
    color: colors.error,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
});
