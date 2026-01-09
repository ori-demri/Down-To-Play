import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MapScreen } from './src/screens/MapScreen';
import { ErrorBoundary } from './src/components/ErrorBoundary';

/**
 * Root App component
 * Simple map-focused app without authentication
 */
export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <MapScreen />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
