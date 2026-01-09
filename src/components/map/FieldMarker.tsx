import React, { useState, useCallback, memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
const getSurfaceIconName = (surfaceType: SurfaceType): keyof typeof MaterialCommunityIcons.glyphMap => {
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
  const [tracksChanges, setTracksChanges] = useState(true);
  const markerColor = getSurfaceColor(field.surface_type);
  const iconName = getSurfaceIconName(field.surface_type);
  
  // Memoize the press handler to prevent unnecessary re-renders
  const handlePress = useCallback(() => {
    onPress(field);
  }, [field, onPress]);
  
  // Delay turning off tracksViewChanges to ensure icon renders
  const handleLayout = useCallback(() => {
    setTimeout(() => setTracksChanges(false), 500);
  }, []);
  
  return (
    <Marker
      coordinate={field.coordinates}
      onPress={handlePress}
      anchor={{ x: 0.5, y: 1 }}
      tracksViewChanges={tracksChanges}
      onLayout={handleLayout}
    >
      <View style={styles.markerWrapper}>
        <View style={[
          styles.markerContainer,
          isSelected && styles.markerContainerSelected,
        ]}>
          <View style={[
            styles.iconBackground,
            { backgroundColor: markerColor },
            isSelected && styles.iconBackgroundSelected,
          ]}>
            <MaterialCommunityIcons 
              name={iconName} 
              size={isSelected ? 16 : 14} 
              color="#FFFFFF" 
            />
          </View>
        </View>
        <View style={[
          styles.pointer,
          { borderTopColor: markerColor },
          isSelected && styles.pointerSelected,
        ]} />
      </View>
    </Marker>
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
  markerWrapper: {
    alignItems: 'center',
  },
  markerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  markerContainerSelected: {
    padding: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  iconBackground: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBackgroundSelected: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  pointerSelected: {
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
  },
});
