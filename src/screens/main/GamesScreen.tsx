import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useGameStore } from '../../stores/gameStore';
import { useLocationStore } from '../../stores/locationStore';
import { colors } from '../../theme/colors';
import { spacing, fontSize, borderRadius } from '../../theme/spacing';
import { GamesStackParamList } from '../../navigation/MainNavigator';
import GameCard from '../../components/GameCard';

type NavigationProp = NativeStackNavigationProp<GamesStackParamList, 'Games'>;

type TabType = 'nearby' | 'my';

export default function GamesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<TabType>('nearby');
  const [refreshing, setRefreshing] = useState(false);
  
  const { nearbyGames, myGames, fetchNearbyGames, fetchMyGames, isLoading } = useGameStore();
  const { getCurrentLocation } = useLocationStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await getCurrentLocation();
    await Promise.all([fetchNearbyGames(), fetchMyGames()]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const displayedGames = activeTab === 'nearby' ? nearbyGames : myGames;

  return (
    <View style={styles.container}>
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'nearby' && styles.activeTab]}
          onPress={() => setActiveTab('nearby')}
        >
          <Text style={[styles.tabText, activeTab === 'nearby' && styles.activeTabText]}>Nearby</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my' && styles.activeTab]}
          onPress={() => setActiveTab('my')}
        >
          <Text style={[styles.tabText, activeTab === 'my' && styles.activeTabText]}>My Games</Text>
        </TouchableOpacity>
      </View>

      {/* Games List */}
      <FlatList
        data={displayedGames}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GameCard
            game={item}
            onPress={() => navigation.navigate('GameDetail', { gameId: item.id })}
            style={styles.gameCard}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="football-outline" size={64} color={colors.mediumGray} />
            <Text style={styles.emptyStateTitle}>
              {activeTab === 'nearby' ? 'No games nearby' : 'No games yet'}
            </Text>
            <Text style={styles.emptyStateText}>
              {activeTab === 'nearby'
                ? 'Be the first to create a game in your area!'
                : 'Create or join a game to see it here'}
            </Text>
          </View>
        }
      />

      {/* Create Game FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateGame')}>
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: { borderBottomColor: colors.primary },
  tabText: { fontSize: fontSize.lg, color: colors.textSecondary, fontWeight: '500' },
  activeTabText: { color: colors.primary },
  listContent: { padding: spacing.md },
  gameCard: { marginBottom: spacing.md },
  emptyState: { alignItems: 'center', paddingVertical: spacing.xxl },
  emptyStateTitle: { fontSize: fontSize.xl, fontWeight: '600', color: colors.textPrimary, marginTop: spacing.lg },
  emptyStateText: { fontSize: fontSize.md, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm, paddingHorizontal: spacing.xl },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
