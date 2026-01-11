import React, { useRef, useCallback, useState, useEffect, memo } from 'react';
import { StyleSheet, View, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { colors, spacing, borderRadius, typography, MAP_CONFIG } from '@/constants';
import { Field, Coordinates } from '@/types';
import { FieldMarker } from './FieldMarker';

// Initialize MapLibre
MapLibreGL.setAccessToken(null);

// Clean, modern map style (similar to Google Maps)
// Using OpenFreeMap Positron - clean, light style
const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';

interface MapViewProps {
  fields: Field[];
  userLocation: Coordinates | null;
  isLoadingLocation: boolean;
  onFieldSelect: (field: Field) => void;
  selectedFieldId?: string | null;
  onRegionChange?: (region: { latitude: number; longitude: number }) => void;
}

function MapViewComponent({
  fields,
  userLocation,
  isLoadingLocation,
  onFieldSelect,
  selectedFieldId,
  onRegionChange,
}: MapViewProps) {
  const cameraRef = useRef<MapLibreGL.CameraRef>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Center map on user location when it becomes available
  useEffect(() => {
    if (userLocation && isMapReady && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [userLocation.longitude, userLocation.latitude],
        zoomLevel: 14,
        animationDuration: 1000,
      });
    }
  }, [userLocation, isMapReady]);

  const handleMapReady = useCallback(() => {
    setIsMapReady(true);
  }, []);

  const handleCenterOnUser = useCallback(() => {
    if (userLocation && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [userLocation.longitude, userLocation.latitude],
        zoomLevel: 14,
        animationDuration: 500,
      });
    }
  }, [userLocation]);

  const handleRegionDidChange = useCallback(
    (feature: GeoJSON.Feature<GeoJSON.Point>) => {
      if (feature.geometry.type === 'Point') {
        const [longitude, latitude] = feature.geometry.coordinates;
        onRegionChange?.({ latitude, longitude });
      }
    },
    [onRegionChange]
  );

  const defaultCenter: [number, number] = userLocation
    ? [userLocation.longitude, userLocation.latitude]
    : [MAP_CONFIG.defaultRegion.longitude, MAP_CONFIG.defaultRegion.latitude];

  const defaultZoom = userLocation ? 14 : 10;

  return (
    <View style={styles.container}>
      <MapLibreGL.MapView
        style={styles.map}
        mapStyle={MAP_STYLE}
        logoEnabled={false}
        attributionEnabled={true}
        attributionPosition={{ bottom: 8, right: 8 }}
        onDidFinishLoadingMap={handleMapReady}
        onRegionDidChange={handleRegionDidChange}
      >
        <MapLibreGL.Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: defaultCenter,
            zoomLevel: defaultZoom,
          }}
        />
        <MapLibreGL.UserLocation visible={true} />
        {fields.map((field) => (
          <FieldMarker
            key={field.id}
            field={field}
            isSelected={selectedFieldId === field.id}
            onPress={onFieldSelect}
          />
        ))}
      </MapLibreGL.MapView>

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
  centerButton: {
    alignItems: 'center',
    backgroundColor: colors.background,
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
    backgroundColor: colors.background,
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
    color: colors.text.secondary,
    fontSize: typography.sizes.sm,
    marginLeft: spacing.sm,
  },
  map: {
    flex: 1,
  },
});

// Memoize the component to prevent unnecessary re-renders
export const MapView = memo(MapViewComponent);
