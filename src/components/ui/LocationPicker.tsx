import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import RNMapView, { Region } from 'react-native-maps';
import { Coordinates } from '@/types';
import { colors, spacing, borderRadius, typography, MAP_CONFIG } from '@/constants';

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
      mapRef.current?.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        ...MAP_CONFIG.userLocationDelta,
      }, 500);
    }
  }, [userLocation, isMapReady, value, onChange]);

  const handleMapReady = useCallback(() => {
    setIsMapReady(true);
  }, []);

  const handleRegionChangeComplete = useCallback((region: Region) => {
    onChange({
      latitude: region.latitude,
      longitude: region.longitude,
    });
  }, [onChange]);

  const handleCenterOnUser = useCallback(() => {
    if (userLocation && mapRef.current) {
      onChange(userLocation);
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        ...MAP_CONFIG.userLocationDelta,
      }, 500);
    }
  }, [userLocation, onChange]);

  const initialRegion = value.latitude !== 0
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
      <Text style={styles.hint}>
        Drag the map to position the pin on the field location
      </Text>

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
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  hint: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    marginBottom: spacing.sm,
  },
  mapContainer: {
    height: 250,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  map: {
    flex: 1,
  },
  pinContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -40,
    alignItems: 'center',
  },
  pin: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinIcon: {
    fontSize: 36,
  },
  pinShadow: {
    width: 10,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 5,
    marginTop: -5,
  },
  centerButton: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    width: 44,
    height: 44,
    borderRadius: 22,
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
    top: spacing.sm,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  coordinatesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  coordinatesLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginRight: spacing.xs,
  },
  coordinates: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontFamily: 'monospace',
  },
  error: {
    fontSize: typography.sizes.sm,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
