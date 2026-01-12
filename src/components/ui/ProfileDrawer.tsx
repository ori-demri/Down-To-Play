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
import { spacing, borderRadius, typography } from '@/constants';
import { useAuth } from '@/features/auth';
import { useTheme } from '@/features/theme';

interface ProfileDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSignIn: () => void;
}

export function ProfileDrawer({ visible, onClose, onSignIn }: ProfileDrawerProps) {
  const { isAuthenticated, profile, user, signOut, isLoading } = useAuth();
  const { colors, preference, setAppearance } = useTheme();

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Backdrop */}
        <Pressable
          style={[styles.backdrop, { backgroundColor: colors.overlay }]}
          onPress={onClose}
        />

        {/* Drawer */}
        <SafeAreaView style={[styles.drawer, { backgroundColor: colors.background }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={[styles.closeIcon, { color: colors.text.secondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {isAuthenticated && profile ? (
              // Authenticated User
              <>
                <View style={styles.profileSection}>
                  {profile.avatarUrl ? (
                    <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
                  ) : (
                    <View
                      style={[styles.avatarPlaceholder, { backgroundColor: colors.primary + '20' }]}
                    >
                      <Text style={[styles.avatarInitial, { color: colors.primary }]}>
                        {profile.displayName?.[0]?.toUpperCase() ||
                          profile.username[0].toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <Text style={[styles.displayName, { color: colors.text.primary }]}>
                    {profile.displayName || profile.username}
                  </Text>
                  <Text style={[styles.email, { color: colors.text.secondary }]}>
                    {user?.email}
                  </Text>
                </View>

                {/* Appearance Section */}
                <View style={[styles.appearanceSection, { borderTopColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>
                    Appearance
                  </Text>
                  <View style={styles.appearanceOptions}>
                    <AppearanceOption
                      icon="☀️"
                      label="Light"
                      isSelected={preference === 'light'}
                      onPress={() => setAppearance('light')}
                      colors={colors}
                    />
                    <AppearanceOption
                      icon="🌙"
                      label="Dark"
                      isSelected={preference === 'dark'}
                      onPress={() => setAppearance('dark')}
                      colors={colors}
                    />
                    <AppearanceOption
                      icon="📱"
                      label="System"
                      isSelected={preference === 'system'}
                      onPress={() => setAppearance('system')}
                      colors={colors}
                    />
                  </View>
                </View>

                {/* eslint-disable @typescript-eslint/no-empty-function */}
                <View style={[styles.menuSection, { borderTopColor: colors.border }]}>
                  <MenuItem icon="👤" label="Edit Profile" onPress={() => {}} colors={colors} />
                  <MenuItem icon="📍" label="My Fields" onPress={() => {}} colors={colors} />
                  <MenuItem icon="⚽" label="My Games" onPress={() => {}} colors={colors} />
                  <MenuItem icon="⚙️" label="Settings" onPress={() => {}} colors={colors} />
                </View>
                {/* eslint-enable @typescript-eslint/no-empty-function */}

                <View style={[styles.footerSection, { borderTopColor: colors.border }]}>
                  <TouchableOpacity
                    style={[styles.signOutButton, { borderColor: colors.error }]}
                    onPress={handleSignOut}
                    disabled={isLoading}
                  >
                    <Text style={[styles.signOutText, { color: colors.error }]}>
                      {isLoading ? 'Signing out...' : 'Sign Out'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              // Guest User
              <>
                <View style={styles.guestSection}>
                  <View style={[styles.guestIconContainer, { backgroundColor: colors.surface }]}>
                    <Text style={styles.guestIcon}>👤</Text>
                  </View>
                  <Text style={[styles.guestTitle, { color: colors.text.primary }]}>
                    Welcome, Guest!
                  </Text>
                  <Text style={[styles.guestSubtitle, { color: colors.text.secondary }]}>
                    Sign in to add fields, join games, and connect with other players.
                  </Text>
                  <TouchableOpacity
                    style={[styles.signInButton, { backgroundColor: colors.primary }]}
                    onPress={onSignIn}
                  >
                    <Text style={[styles.signInText, { color: colors.text.inverse }]}>Sign In</Text>
                  </TouchableOpacity>
                </View>

                {/* Appearance Section for Guests */}
                <View style={[styles.appearanceSection, { borderTopColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>
                    Appearance
                  </Text>
                  <View style={styles.appearanceOptions}>
                    <AppearanceOption
                      icon="☀️"
                      label="Light"
                      isSelected={preference === 'light'}
                      onPress={() => setAppearance('light')}
                      colors={colors}
                    />
                    <AppearanceOption
                      icon="🌙"
                      label="Dark"
                      isSelected={preference === 'dark'}
                      onPress={() => setAppearance('dark')}
                      colors={colors}
                    />
                    <AppearanceOption
                      icon="📱"
                      label="System"
                      isSelected={preference === 'system'}
                      onPress={() => setAppearance('system')}
                      colors={colors}
                    />
                  </View>
                </View>

                {/* eslint-disable @typescript-eslint/no-empty-function */}
                <View style={[styles.menuSection, { borderTopColor: colors.border }]}>
                  <MenuItem icon="❓" label="Help & Support" onPress={() => {}} colors={colors} />
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
function MenuItem({
  icon,
  label,
  onPress,
  colors,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={[styles.menuLabel, { color: colors.text.primary }]}>{label}</Text>
      <Text style={[styles.menuArrow, { color: colors.text.muted }]}>›</Text>
    </TouchableOpacity>
  );
}

/**
 * Appearance Option Component
 */
function AppearanceOption({
  icon,
  label,
  isSelected,
  onPress,
  colors,
}: {
  icon: string;
  label: string;
  isSelected: boolean;
  onPress: () => void;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <TouchableOpacity
      style={[
        styles.appearanceOption,
        {
          backgroundColor: isSelected ? colors.primary + '20' : colors.surface,
          borderColor: isSelected ? colors.primary : colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.appearanceIcon}>{icon}</Text>
      <Text
        style={[
          styles.appearanceLabel,
          {
            color: isSelected ? colors.primary : colors.text.secondary,
            fontWeight: isSelected ? typography.weights.semibold : typography.weights.regular,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  appearanceIcon: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  appearanceLabel: {
    fontSize: typography.sizes.xs,
  },
  appearanceOption: {
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    flex: 1,
    marginHorizontal: spacing.xs,
    paddingVertical: spacing.md,
  },
  appearanceOptions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
  },
  appearanceSection: {
    borderTopWidth: 1,
    paddingBottom: spacing.md,
    paddingTop: spacing.md,
  },
  avatar: {
    borderRadius: 40,
    height: 80,
    marginBottom: spacing.md,
    width: 80,
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: typography.weights.bold,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 80,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  closeButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  closeIcon: {
    fontSize: 20,
  },
  displayName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.xs,
  },
  drawer: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
    width: '100%',
  },
  email: {
    fontSize: typography.sizes.sm,
  },
  footerSection: {
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
    fontSize: typography.sizes.sm,
    lineHeight: 20,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  guestTitle: {
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
    flex: 1,
    fontSize: typography.sizes.md,
  },
  menuSection: {
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
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    textTransform: 'uppercase',
  },
  signInButton: {
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  signInText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  signOutButton: {
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingVertical: spacing.sm,
  },
  signOutText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
});
