import React, { useRef, useCallback, useState, useEffect, memo } from 'react';
import { StyleSheet, View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import RNMapView, { Region, PROVIDER_GOOGLE, MapStyleElement } from 'react-native-maps';
import { spacing, borderRadius, typography, MAP_CONFIG } from '@/constants';
import { useTheme } from '@/features/theme';
import { Field, Coordinates } from '@/types';
import { FieldMarker } from './FieldMarker';

interface MapViewProps {
  fields: Field[];
  userLocation: Coordinates | null;
  isLoadingLocation: boolean;
  onFieldSelect: (field: Field) => void;
  selectedFieldId?: string | null;
  onRegionChange?: (region: Region) => void;
  customMapStyle?: MapStyleElement[];
}

function MapViewComponent({
  fields,
  userLocation,
  isLoadingLocation,
  onFieldSelect,
  selectedFieldId,
  onRegionChange,
  customMapStyle,
}: MapViewProps) {
  const mapRef = useRef<RNMapView>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const { colors } = useTheme();

  // Center map on user location when it becomes available
  useEffect(() => {
    if (userLocation && isMapReady && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          ...MAP_CONFIG.userLocationDelta,
        },
        1000
      );
    }
  }, [userLocation, isMapReady]);

  const handleMapReady = useCallback(() => {
    setIsMapReady(true);
  }, []);

  const handleCenterOnUser = useCallback(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          ...MAP_CONFIG.userLocationDelta,
        },
        500
      );
    }
  }, [userLocation]);

  const handleRegionChangeComplete = useCallback(
    (region: Region) => {
      onRegionChange?.(region);
    },
    [onRegionChange]
  );

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
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        toolbarEnabled={false}
        onMapReady={handleMapReady}
        onRegionChangeComplete={handleRegionChangeComplete}
        customMapStyle={customMapStyle}
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
          style={[styles.centerButton, { backgroundColor: colors.background }]}
          onPress={handleCenterOnUser}
          activeOpacity={0.8}
        >
          <Text style={styles.centerButtonIcon}>🎯</Text>
        </TouchableOpacity>
      )}

      {/* Loading indicator */}
      {isLoadingLocation && (
        <View style={styles.loadingOverlay}>
          <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
              Finding your location...
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centerButton: {
    alignItems: 'center',
    borderRadius: 24,
    bottom: spacing.xl,
    elevation: 4,
    height: 48,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: 48,
  },
  centerButtonIcon: {
    fontSize: 20,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    borderRadius: borderRadius.full,
    elevation: 3,
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loadingOverlay: {
    alignItems: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: spacing.xl,
  },
  loadingText: {
    fontSize: typography.sizes.sm,
    marginLeft: spacing.sm,
  },
  map: {
    flex: 1,
  },
});

// Memoize the component to prevent unnecessary re-renders
export const MapView = memo(MapViewComponent);
