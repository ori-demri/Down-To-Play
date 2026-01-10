/**
 * Down To Play - Root App Component
 * Football field discovery and pickup game organization
 */

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { AuthProvider, useAuth } from './src/features/auth';
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
 * Root App Component
 */
export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
