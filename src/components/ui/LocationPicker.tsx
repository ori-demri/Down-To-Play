import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import RNMapView, { Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { FieldMarker } from '@/components/map/FieldMarker';
import { spacing, borderRadius, typography, MAP_CONFIG } from '@/constants';
import { useTheme } from '@/features/theme';
import { Coordinates, Field } from '@/types';

interface LocationPickerProps {
  value: Coordinates;
  onChange: (coordinates: Coordinates) => void;
  userLocation: Coordinates | null;
  error?: string;
  isLoadingLocation?: boolean;
  fields?: Field[];
}

export function LocationPicker({
  value,
  onChange,
  userLocation,
  error,
  isLoadingLocation = false,
  fields = [],
}: LocationPickerProps) {
  const mapRef = useRef<RNMapView>(null);
  const { colors, mapStyle } = useTheme();
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
      <Text style={[styles.label, { color: colors.text.primary }]}>Field Location *</Text>
      <Text style={[styles.hint, { color: colors.text.secondary }]}>
        Drag the map to position the pin on the field location
      </Text>

      <View style={[styles.mapContainer, { borderColor: colors.border }]}>
        <RNMapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={true}
          showsMyLocationButton={false}
          onMapReady={handleMapReady}
          onRegionChangeComplete={handleRegionChangeComplete}
          customMapStyle={mapStyle}
        >
          {fields.map((field) => (
            <FieldMarker
              key={field.id}
              field={field}
              isSelected={false}
              onPress={() => undefined}
            />
          ))}
        </RNMapView>

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
            style={[styles.centerButton, { backgroundColor: colors.background }]}
            onPress={handleCenterOnUser}
            activeOpacity={0.8}
          >
            <Text style={styles.centerButtonIcon}>🎯</Text>
          </TouchableOpacity>
        )}

        {/* Loading overlay */}
        {isLoadingLocation && (
          <View style={[styles.loadingOverlay, { backgroundColor: colors.overlay }]}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text.inverse }]}>
              Getting location...
            </Text>
          </View>
        )}
      </View>

      {/* Coordinates display */}
      {value.latitude !== 0 && (
        <View style={[styles.coordinatesContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.coordinatesLabel, { color: colors.text.secondary }]}>
            Selected coordinates:
          </Text>
          <Text style={[styles.coordinates, { color: colors.text.primary }]}>
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
    fontFamily: 'monospace',
    fontSize: typography.sizes.xs,
  },
  coordinatesContainer: {
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    flexDirection: 'row',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  coordinatesLabel: {
    fontSize: typography.sizes.xs,
    marginRight: spacing.xs,
  },
  error: {
    color: '#EF4444', // Keep error color static
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
  hint: {
    fontSize: typography.sizes.sm,
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.xs,
  },
  loadingOverlay: {
    alignItems: 'center',
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    left: 0,
    paddingVertical: spacing.md,
    position: 'absolute',
    right: 0,
    top: spacing.sm,
  },
  loadingText: {
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
  },
  map: {
    flex: 1,
  },
  mapContainer: {
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
