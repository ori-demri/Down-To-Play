/**
 * Map Screen
 * Main screen showing football fields on a map
 * Supports both authenticated and guest users
 */

import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, StatusBar, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapView } from '@/components/map';
import { FieldDetailsSheet } from '@/components/ui/FieldDetailsSheet';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { LoginModal } from '@/components/ui/LoginModal';
import { ProfileButton } from '@/components/ui/ProfileButton';
import { ProfileDrawer } from '@/components/ui/ProfileDrawer';
import { colors } from '@/constants';
import { useAuth, useRequireAuth } from '@/features/auth';
import { useFields } from '@/features/fields/hooks/useFields';
import { useLocation } from '@/hooks';
import { Field } from '@/types';
import { CreateFieldScreen } from './CreateFieldScreen';

export function MapScreen() {
  const { coordinates, isLoading: isLoadingLocation } = useLocation();
  const { fields, isLoading: isLoadingFields, refetch: refetchFields } = useFields(coordinates);
  const { isAuthenticated, consumeAuthIntent } = useAuth();
  const { showLoginModal, closeLoginModal, checkAuth } = useRequireAuth();

  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [isCreateFieldVisible, setIsCreateFieldVisible] = useState(false);
  const [isProfileDrawerVisible, setIsProfileDrawerVisible] = useState(false);

  // Handle auth intent after login
  useEffect(() => {
    if (isAuthenticated) {
      const intent = consumeAuthIntent();
      if (intent?.type === 'add_field') {
        setIsCreateFieldVisible(true);
      }
    }
  }, [isAuthenticated, consumeAuthIntent]);

  const handleFieldSelect = useCallback((field: Field) => {
    setSelectedField(field);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedField(null);
  }, []);

  const handleCreateGame = useCallback((_field: Field) => {
    // TODO: Navigate to create game screen - feature to be implemented
  }, []);

  const handleOpenCreateField = useCallback(() => {
    // Check if user is authenticated
    const isAuthed = checkAuth({ type: 'add_field' });
    if (!isAuthed) {
      return; // Login modal will be shown
    }

    setSelectedField(null); // Close any open field details
    setIsCreateFieldVisible(true);
  }, [checkAuth]);

  const handleCloseCreateField = useCallback(() => {
    setIsCreateFieldVisible(false);
  }, []);

  const handleFieldCreated = useCallback(() => {
    // Refresh fields list from Supabase
    refetchFields();
  }, [refetchFields]);

  const handleOpenProfileDrawer = useCallback(() => {
    setIsProfileDrawerVisible(true);
  }, []);

  const handleCloseProfileDrawer = useCallback(() => {
    setIsProfileDrawerVisible(false);
  }, []);

  const handleSignInFromDrawer = useCallback(() => {
    setIsProfileDrawerVisible(false);
    // Small delay to allow drawer to close before showing login modal
    setTimeout(() => {
      checkAuth(null);
    }, 300);
  }, [checkAuth]);

  const handleLoginSuccess = useCallback(() => {
    // Check for pending intent
    const intent = consumeAuthIntent();
    if (intent?.type === 'add_field') {
      setIsCreateFieldVisible(true);
    }
  }, [consumeAuthIntent]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.mapContainer}>
        <MapView
          fields={fields}
          userLocation={coordinates}
          isLoadingLocation={isLoadingLocation || isLoadingFields}
          onFieldSelect={handleFieldSelect}
          selectedFieldId={selectedField?.id}
        />

        {/* Profile button (top left) */}
        <View style={styles.profileButtonContainer}>
          <ProfileButton onPress={handleOpenProfileDrawer} />
        </View>

        {/* Floating Action Button to add new field */}
        <FloatingActionButton icon="⚽" label="Add Field" onPress={handleOpenCreateField} />
      </View>

      {/* Field details bottom sheet */}
      <FieldDetailsSheet
        field={selectedField}
        onClose={handleCloseDetails}
        onCreateGame={handleCreateGame}
      />

      {/* Create Field Modal */}
      <Modal
        visible={isCreateFieldVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseCreateField}
      >
        <CreateFieldScreen onClose={handleCloseCreateField} onSuccess={handleFieldCreated} />
      </Modal>

      {/* Profile Drawer */}
      <ProfileDrawer
        visible={isProfileDrawerVisible}
        onClose={handleCloseProfileDrawer}
        onSignIn={handleSignInFromDrawer}
      />

      {/* Login Modal (for protected actions) */}
      <LoginModal
        visible={showLoginModal}
        onClose={closeLoginModal}
        onSuccess={handleLoginSuccess}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },
  profileButtonContainer: {
    left: 16,
    position: 'absolute',
    top: 16,
  },
});
