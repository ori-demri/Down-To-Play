import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import RNMapView, { Region } from 'react-native-maps';
import { colors, spacing, borderRadius, typography, MAP_CONFIG } from '@/constants';
import { Coordinates } from '@/types';

interface LocationPickerProps {
  value: Coordinates;
  onChange: (coordinates: Coordinates) => void;
  userLocation: Coordinates | null;
  error?: string;
  isLoadingLocation?: boolean;
}

export function LocationPicker({
  value,
  onChange,
  userLocation,
  error,
  isLoadingLocation = false,
}: LocationPickerProps) {
  const mapRef = useRef<RNMapView>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Center on user location when it becomes available and value is not set
  useEffect(() => {
    if (userLocation && isMapReady && value.latitude === 0 && value.longitude === 0) {
      onChange(userLocation);
      mapRef.current?.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          ...MAP_CONFIG.userLocationDelta,
        },
        500
      );
    }
  }, [userLocation, isMapReady, value, onChange]);

  const handleMapReady = useCallback(() => {
    setIsMapReady(true);
  }, []);

  const handleRegionChangeComplete = useCallback(
    (region: Region) => {
      onChange({
        latitude: region.latitude,
        longitude: region.longitude,
      });
    },
    [onChange]
  );

  const handleCenterOnUser = useCallback(() => {
    if (userLocation && mapRef.current) {
      onChange(userLocation);
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          ...MAP_CONFIG.userLocationDelta,
        },
        500
      );
    }
  }, [userLocation, onChange]);

  const initialRegion =
    value.latitude !== 0
      ? {
          latitude: value.latitude,
          longitude: value.longitude,
          ...MAP_CONFIG.userLocationDelta,
        }
      : userLocation
        ? {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            ...MAP_CONFIG.userLocationDelta,
          }
        : MAP_CONFIG.defaultRegion;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Field Location *</Text>
      <Text style={styles.hint}>Drag the map to position the pin on the field location</Text>

      <View style={styles.mapContainer}>
        <RNMapView
          ref={mapRef}
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={true}
          showsMyLocationButton={false}
          onMapReady={handleMapReady}
          onRegionChangeComplete={handleRegionChangeComplete}
        />

        {/* Center pin indicator */}
        <View style={styles.pinContainer} pointerEvents="none">
          <View style={styles.pin}>
            <Text style={styles.pinIcon}>📍</Text>
          </View>
          <View style={styles.pinShadow} />
        </View>

        {/* Center on user button */}
        {userLocation && (
          <TouchableOpacity
            style={styles.centerButton}
            onPress={handleCenterOnUser}
            activeOpacity={0.8}
          >
            <Text style={styles.centerButtonIcon}>🎯</Text>
          </TouchableOpacity>
        )}

        {/* Loading overlay */}
        {isLoadingLocation && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Getting location...</Text>
          </View>
        )}
      </View>

      {/* Coordinates display */}
      {value.latitude !== 0 && (
        <View style={styles.coordinatesContainer}>
          <Text style={styles.coordinatesLabel}>Selected coordinates:</Text>
          <Text style={styles.coordinates}>
            {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
          </Text>
        </View>
      )}

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  centerButton: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 22,
    bottom: spacing.sm,
    elevation: 4,
    height: 44,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: 44,
  },
  centerButtonIcon: {
    fontSize: 20,
  },
  container: {
    marginBottom: spacing.md,
  },
  coordinates: {
    color: colors.text.secondary,
    fontFamily: 'monospace',
    fontSize: typography.sizes.xs,
  },
  coordinatesContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  coordinatesLabel: {
    color: colors.text.muted,
    fontSize: typography.sizes.xs,
    marginRight: spacing.xs,
  },
  error: {
    color: colors.error,
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
  hint: {
    color: colors.text.muted,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.sm,
  },
  label: {
    color: colors.text.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.xs,
  },
  loadingOverlay: {
    alignItems: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: spacing.sm,
  },
  loadingText: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    color: colors.text.secondary,
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  map: {
    flex: 1,
  },
  mapContainer: {
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    height: 250,
    overflow: 'hidden',
  },
  pin: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  pinContainer: {
    alignItems: 'center',
    left: '50%',
    marginLeft: -20,
    marginTop: -40,
    position: 'absolute',
    top: '50%',
  },
  pinIcon: {
    fontSize: 36,
  },
  pinShadow: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 5,
    height: 4,
    marginTop: -5,
    width: 10,
  },
});
