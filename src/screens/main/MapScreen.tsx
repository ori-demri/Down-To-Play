import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLocationStore } from '../../stores/locationStore';
import { useCourtStore } from '../../stores/courtStore';
import { useGameStore } from '../../stores/gameStore';
import { usePlayerStore } from '../../stores/playerStore';
import { colors } from '../../theme/colors';
import { spacing, fontSize, borderRadius } from '../../theme/spacing';
import { MapStackParamList } from '../../navigation/MainNavigator';

type NavigationProp = NativeStackNavigationProp<MapStackParamList, 'Map'>;

type FilterType = 'all' | 'courts' | 'games' | 'players';

export default function MapScreen() {
  const navigation = useNavigation<NavigationProp>();
  const mapRef = useRef<MapView>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  
  const { currentLocation, getCurrentLocation } = useLocationStore();
  const { nearbyCourts, fetchNearbyCourts } = useCourtStore();
  const { nearbyGames, fetchNearbyGames } = useGameStore();
  const { nearbyPlayers, fetchNearbyPlayers } = usePlayerStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await getCurrentLocation();
    await Promise.all([fetchNearbyCourts(), fetchNearbyGames(), fetchNearbyPlayers()]);
  };

  const centerOnUser = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  };

  const initialRegion = currentLocation
    ? {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : {
        latitude: 37.7749,
        longitude: -122.4194,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };

  const showCourts = activeFilter === 'all' || activeFilter === 'courts';
  const showGames = activeFilter === 'all' || activeFilter === 'games';
  const showPlayers = activeFilter === 'all' || activeFilter === 'players';

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {/* Court Markers */}
        {showCourts && nearbyCourts.map((court) => (
          <Marker
            key={`court-${court.id}`}
            coordinate={{ latitude: court.latitude, longitude: court.longitude }}
            title={court.name}
            description={court.address || 'Soccer Court'}
            pinColor={colors.markerCourt}
          />
        ))}

        {/* Game Markers */}
        {showGames && nearbyGames.map((game) => {
          const lat = game.court?.latitude || game.latitude;
          const lng = game.court?.longitude || game.longitude;
          if (!lat || !lng) return null;
          
          return (
            <Marker
              key={`game-${game.id}`}
              coordinate={{ latitude: lat, longitude: lng }}
              title={game.title}
              description={`${game.players_needed - game.players_joined} players needed`}
              pinColor={colors.markerGame}
              onCalloutPress={() => navigation.navigate('GameDetail', { gameId: game.id })}
            />
          );
        })}

        {/* Player Markers */}
        {showPlayers && nearbyPlayers.map((player) => {
          if (!player.latitude || !player.longitude) return null;
          
          return (
            <Marker
              key={`player-${player.id}`}
              coordinate={{ latitude: player.latitude, longitude: player.longitude }}
              title={player.full_name || 'Player'}
              description={player.position || 'Available'}
              pinColor={colors.markerPlayer}
              onCalloutPress={() => navigation.navigate('PlayerDetail', { playerId: player.id })}
            />
          );
        })}
      </MapView>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <FilterButton label="All" active={activeFilter === 'all'} onPress={() => setActiveFilter('all')} />
        <FilterButton label="Courts" active={activeFilter === 'courts'} onPress={() => setActiveFilter('courts')} icon="location" />
        <FilterButton label="Games" active={activeFilter === 'games'} onPress={() => setActiveFilter('games')} icon="football" />
        <FilterButton label="Players" active={activeFilter === 'players'} onPress={() => setActiveFilter('players')} icon="people" />
      </View>

      {/* Center on User Button */}
      <TouchableOpacity style={styles.centerButton} onPress={centerOnUser}>
        <Ionicons name="locate" size={24} color={colors.primary} />
      </TouchableOpacity>

      {/* Legend */}
      <View style={styles.legend}>
        <LegendItem color={colors.markerCourt} label="Courts" />
        <LegendItem color={colors.markerGame} label="Games" />
        <LegendItem color={colors.markerPlayer} label="Players" />
      </View>
    </View>
  );
}

function FilterButton({ label, active, onPress, icon }: { label: string; active: boolean; onPress: () => void; icon?: string }) {
  return (
    <TouchableOpacity style={[styles.filterButton, active && styles.filterButtonActive]} onPress={onPress}>
      {icon && <Ionicons name={icon as any} size={16} color={active ? colors.white : colors.textPrimary} />}
      <Text style={[styles.filterButtonText, active && styles.filterButtonTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  filterContainer: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButtonActive: { backgroundColor: colors.primary },
  filterButtonText: { fontSize: fontSize.sm, color: colors.textPrimary, fontWeight: '500' },
  filterButtonTextActive: { color: colors.white },
  centerButton: {
    position: 'absolute',
    bottom: spacing.xl + 60,
    right: spacing.md,
    backgroundColor: colors.white,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legend: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.md,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    gap: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: fontSize.sm, color: colors.textSecondary },
});
