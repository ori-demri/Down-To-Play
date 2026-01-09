import React, { useState, useCallback } from 'react';
import { StyleSheet, View, StatusBar, Modal, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapView } from '@/components/map';
import { FieldDetailsSheet } from '@/components/ui/FieldDetailsSheet';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { CreateFieldScreen } from './CreateFieldScreen';
import { useLocation } from '@/hooks';
import { useFields } from '@/features/fields/hooks/useFields';
import { Field } from '@/types';
import { colors } from '@/constants';

export function MapScreen() {
  const { coordinates, isLoading: isLoadingLocation } = useLocation();
  const { fields, isLoading: isLoadingFields, refetch: refetchFields } = useFields(coordinates);
  
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [isCreateFieldVisible, setIsCreateFieldVisible] = useState(false);

  const handleFieldSelect = useCallback((field: Field) => {
    setSelectedField(field);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedField(null);
  }, []);

  const handleCreateGame = useCallback((field: Field) => {
    // TODO: Navigate to create game screen - feature to be implemented
  }, []);

  const handleOpenCreateField = useCallback(() => {
    setSelectedField(null); // Close any open field details
    setIsCreateFieldVisible(true);
  }, []);

  const handleCloseCreateField = useCallback(() => {
    setIsCreateFieldVisible(false);
  }, []);

  const handleFieldCreated = useCallback(() => {
    // Refresh fields list from Supabase
    refetchFields();
  }, [refetchFields]);

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

        {/* Menu button */}
        <TouchableOpacity style={styles.menuButton}>
          <View style={styles.menuIconContainer}>
            <Text style={styles.menuIcon}>☰</Text>
          </View>
        </TouchableOpacity>

        {/* Floating Action Button to add new field */}
        <FloatingActionButton
          icon="⚽"
          label="Add Field"
          onPress={handleOpenCreateField}
        />
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
        <CreateFieldScreen
          onClose={handleCloseCreateField}
          onSuccess={handleFieldCreated}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapContainer: {
    flex: 1,
  },
  menuButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 20,
    color: colors.text.primary,
  },
});
