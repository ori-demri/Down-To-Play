import React, { useCallback, memo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { Field, SurfaceType } from '@/types';

interface FieldMarkerProps {
  field: Field;
  isSelected?: boolean;
  onPress: (field: Field) => void;
}

// Get color based on surface type
const getSurfaceColor = (surfaceType: SurfaceType): string => {
  switch (surfaceType) {
    case 'natural_grass':
      return '#16A34A';
    case 'synthetic_turf':
    case 'artificial_grass':
      return '#059669';
    case 'indoor':
      return '#7C3AED';
    case 'asphalt':
    case 'concrete':
      return '#4B5563';
    case 'dirt':
      return '#D97706';
    case 'sand':
      return '#CA8A04';
    default:
      return '#16A34A';
  }
};

// Get icon name based on surface type
const getSurfaceIconName = (
  surfaceType: SurfaceType
): keyof typeof MaterialCommunityIcons.glyphMap => {
  switch (surfaceType) {
    case 'natural_grass':
    case 'synthetic_turf':
    case 'artificial_grass':
      return 'soccer-field';
    case 'indoor':
      return 'stadium-variant';
    case 'asphalt':
    case 'concrete':
      return 'basketball';
    case 'dirt':
      return 'soccer';
    case 'sand':
      return 'beach';
    default:
      return 'soccer-field';
  }
};

function FieldMarkerComponent({ field, isSelected = false, onPress }: FieldMarkerProps) {
  const markerColor = getSurfaceColor(field.surface_type);
  const iconName = getSurfaceIconName(field.surface_type);

  // Memoize the press handler to prevent unnecessary re-renders
  const handlePress = useCallback(() => {
    onPress(field);
  }, [field, onPress]);

  // MapLibre uses [longitude, latitude] format
  const coordinate: [number, number] = [field.coordinates.longitude, field.coordinates.latitude];

  return (
    <MapLibreGL.MarkerView coordinate={coordinate} anchor={{ x: 0.5, y: 1 }}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <View style={styles.markerWrapper}>
          <View style={[styles.markerContainer, isSelected && styles.markerContainerSelected]}>
            <View
              style={[
                styles.iconBackground,
                { backgroundColor: markerColor },
                isSelected && styles.iconBackgroundSelected,
              ]}
            >
              <MaterialCommunityIcons name={iconName} size={isSelected ? 16 : 14} color="#FFFFFF" />
            </View>
          </View>
          <View
            style={[
              styles.pointer,
              { borderTopColor: markerColor },
              isSelected && styles.pointerSelected,
            ]}
          />
        </View>
      </TouchableOpacity>
    </MapLibreGL.MarkerView>
  );
}

// Memoize the component to prevent unnecessary re-renders when parent updates
export const FieldMarker = memo(FieldMarkerComponent, (prevProps, nextProps) => {
  return (
    prevProps.field.id === nextProps.field.id &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.field.surface_type === nextProps.field.surface_type
  );
});

const styles = StyleSheet.create({
  iconBackground: {
    alignItems: 'center',
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  iconBackgroundSelected: {
    borderRadius: 14,
    height: 28,
    width: 28,
  },
  markerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    elevation: 3,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  markerContainerSelected: {
    elevation: 5,
    padding: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  markerWrapper: {
    alignItems: 'center',
  },
  pointer: {
    borderLeftColor: 'transparent',
    borderLeftWidth: 5,
    borderRightColor: 'transparent',
    borderRightWidth: 5,
    borderTopWidth: 6,
    height: 0,
    marginTop: -1,
    width: 0,
  },
  pointerSelected: {
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
  },
});
