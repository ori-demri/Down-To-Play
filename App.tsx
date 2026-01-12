/**
 * Down To Play - Root App Component
 * Football field discovery and pickup game organization
 */

import React, { useCallback } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { AuthProvider, useAuth } from './src/features/auth';
import { profileRepository } from './src/features/auth/repositories/profileRepository';
import { AppearancePreference } from './src/features/auth/types';
import { ThemeProvider } from './src/features/theme';
import { LoadingScreen } from './src/screens/LoadingScreen';
import { MapScreen } from './src/screens/MapScreen';

/**
 * Main App Content
 * Handles auth state and routing
 */
function AppContent() {
  const { isInitialized } = useAuth();

  // Show loading screen while checking auth state
  if (!isInitialized) {
    return <LoadingScreen />;
  }

  // Main app - MapScreen handles both authenticated and guest users
  return <MapScreen />;
}

/**
 * Themed App Wrapper
 * Connects ThemeProvider to user's profile preference
 */
function ThemedApp() {
  const { profile, user, refreshProfile } = useAuth();

  const handleAppearanceChange = useCallback(
    async (preference: AppearancePreference) => {
      if (user) {
        await profileRepository.update(user.id, { appearance: preference });
        await refreshProfile();
      }
    },
    [user, refreshProfile]
  );

  return (
    <ThemeProvider
      initialPreference={profile?.appearance ?? 'system'}
      onAppearanceChange={handleAppearanceChange}
    >
      <AppContent />
    </ThemeProvider>
  );
}

/**
 * Root App Component
 */
export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <ThemedApp />
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
