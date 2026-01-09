import React, { useRef, useCallback, useState, useEffect, memo } from 'react';
import { StyleSheet, View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import RNMapView, { Region } from 'react-native-maps';
import { Field, Coordinates } from '@/types';
import { colors, spacing, borderRadius, typography, MAP_CONFIG } from '@/constants';
import { FieldMarker } from './FieldMarker';

interface MapViewProps {
  fields: Field[];
  userLocation: Coordinates | null;
  isLoadingLocation: boolean;
  onFieldSelect: (field: Field) => void;
  selectedFieldId?: string | null;
  onRegionChange?: (region: Region) => void;
}

function MapViewComponent({
  fields,
  userLocation,
  isLoadingLocation,
  onFieldSelect,
  selectedFieldId,
  onRegionChange,
}: MapViewProps) {
  const mapRef = useRef<RNMapView>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Center map on user location when it becomes available
  useEffect(() => {
    if (userLocation && isMapReady && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        ...MAP_CONFIG.userLocationDelta,
      }, 1000);
    }
  }, [userLocation, isMapReady]);

  const handleMapReady = useCallback(() => {
    setIsMapReady(true);
  }, []);

  const handleCenterOnUser = useCallback(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        ...MAP_CONFIG.userLocationDelta,
      }, 500);
    }
  }, [userLocation]);

  const handleRegionChangeComplete = useCallback((region: Region) => {
    onRegionChange?.(region);
  }, [onRegionChange]);

  const initialRegion = userLocation
    ? {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        ...MAP_CONFIG.userLocationDelta,
      }
    : MAP_CONFIG.defaultRegion;

  return (
    <View style={styles.container}>
      <RNMapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        onMapReady={handleMapReady}
        onRegionChangeComplete={handleRegionChangeComplete}
      >
        {fields.map((field) => (
          <FieldMarker
            key={field.id}
            field={field}
            isSelected={selectedFieldId === field.id}
            onPress={onFieldSelect}
          />
        ))}
      </RNMapView>

      {/* Center on user location button */}
      {userLocation && (
        <TouchableOpacity
          style={styles.centerButton}
          onPress={handleCenterOnUser}
          activeOpacity={0.8}
        >
          <Text style={styles.centerButtonIcon}>📍</Text>
        </TouchableOpacity>
      )}

      {/* Loading indicator */}
      {isLoadingLocation && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Finding your location...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  centerButton: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.xl,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  centerButtonIcon: {
    fontSize: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: spacing.xl,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingText: {
    marginLeft: spacing.sm,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
});

// Memoize the component to prevent unnecessary re-renders
export const MapView = memo(MapViewComponent);
