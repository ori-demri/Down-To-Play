import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { MapScreen } from './src/screens/MapScreen';

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
