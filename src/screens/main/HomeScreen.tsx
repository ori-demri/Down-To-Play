import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { useGameStore } from '../../stores/gameStore';
import { usePlayerStore } from '../../stores/playerStore';
import { useLocationStore } from '../../stores/locationStore';
import { colors } from '../../theme/colors';
import { spacing, fontSize, borderRadius } from '../../theme/spacing';
import { HomeStackParamList } from '../../navigation/MainNavigator';
import GameCard from '../../components/GameCard';
import PlayerCard from '../../components/PlayerCard';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { profile } = useAuthStore();
  const { nearbyGames, fetchNearbyGames, isLoading: gamesLoading } = useGameStore();
  const { nearbyPlayers, fetchNearbyPlayers, isLoading: playersLoading } = usePlayerStore();
  const { getCurrentLocation } = useLocationStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await getCurrentLocation();
    await Promise.all([fetchNearbyGames(), fetchNearbyPlayers()]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const upcomingGames = nearbyGames.slice(0, 5);
  const availablePlayers = nearbyPlayers.slice(0, 6);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
      }
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>
          Welcome back, {profile?.full_name?.split(' ')[0] || 'Player'}! 👋
        </Text>
        <Text style={styles.statusText}>
          {profile?.is_available ? (
            <Text style={styles.availableText}>● You're available to play</Text>
          ) : (
            <Text style={styles.unavailableText}>● You're set as unavailable</Text>
          )}
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.getParent()?.navigate('GamesTab', { screen: 'CreateGame' })}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: colors.secondary + '20' }]}>
            <Ionicons name="add-circle" size={28} color={colors.secondary} />
          </View>
          <Text style={styles.quickActionText}>Create Game</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.getParent()?.navigate('MapTab')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="map" size={28} color={colors.primary} />
          </View>
          <Text style={styles.quickActionText}>Find Courts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.getParent()?.navigate('PlayersTab')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: colors.accent + '20' }]}>
            <Ionicons name="people" size={28} color={colors.accent} />
          </View>
          <Text style={styles.quickActionText}>Find Players</Text>
        </TouchableOpacity>
      </View>

      {/* Upcoming Games Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Games</Text>
          <TouchableOpacity onPress={() => navigation.getParent()?.navigate('GamesTab')}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        {upcomingGames.length > 0 ? (
          <FlatList
            data={upcomingGames}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <GameCard
                game={item}
                onPress={() => navigation.navigate('GameDetail', { gameId: item.id })}
                style={styles.gameCard}
              />
            )}
            contentContainerStyle={styles.horizontalList}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="football-outline" size={48} color={colors.mediumGray} />
            <Text style={styles.emptyStateText}>No games nearby</Text>
            <Text style={styles.emptyStateSubtext}>Be the first to create one!</Text>
          </View>
        )}
      </View>

      {/* Available Players Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Players Ready to Play</Text>
          <TouchableOpacity onPress={() => navigation.getParent()?.navigate('PlayersTab')}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        {availablePlayers.length > 0 ? (
          <View style={styles.playersGrid}>
            {availablePlayers.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                onPress={() => navigation.navigate('PlayerDetail', { playerId: player.id })}
                compact
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={colors.mediumGray} />
            <Text style={styles.emptyStateText}>No players nearby</Text>
            <Text style={styles.emptyStateSubtext}>Check back later</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  welcomeSection: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  welcomeText: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  statusText: {
    fontSize: fontSize.md,
  },
  availableText: {
    color: colors.success,
  },
  unavailableText: {
    color: colors.mediumGray,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.lg,
    backgroundColor: colors.white,
    marginBottom: spacing.md,
  },
  quickActionButton: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quickActionText: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  seeAllText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '500',
  },
  horizontalList: {
    paddingLeft: spacing.lg,
  },
  gameCard: {
    width: 280,
    marginRight: spacing.md,
  },
  playersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  emptyStateText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyStateSubtext: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
