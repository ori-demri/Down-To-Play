import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { usePlayerStore } from '../../stores/playerStore';
import { useLocationStore } from '../../stores/locationStore';
import { colors } from '../../theme/colors';
import { spacing, fontSize, borderRadius } from '../../theme/spacing';
import { PlayersStackParamList } from '../../navigation/MainNavigator';
import PlayerCard from '../../components/PlayerCard';

type NavigationProp = NativeStackNavigationProp<PlayersStackParamList, 'Players'>;

export default function PlayersScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { nearbyPlayers, fetchNearbyPlayers, isLoading } = usePlayerStore();
  const { getCurrentLocation } = useLocationStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await getCurrentLocation();
    await fetchNearbyPlayers();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filteredPlayers = nearbyPlayers.filter((player) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      player.full_name?.toLowerCase().includes(query) ||
      player.position?.toLowerCase().includes(query)
    );
  });

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or position..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Ionicons name="close-circle" size={20} color={colors.textMuted} onPress={() => setSearchQuery('')} />
        )}
      </View>

      {/* Players List */}
      <FlatList
        data={filteredPlayers}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <PlayerCard
            player={item}
            onPress={() => navigation.navigate('PlayerDetail', { playerId: item.id })}
          />
        )}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={colors.mediumGray} />
            <Text style={styles.emptyStateTitle}>No players found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'Try a different search' : 'No available players in your area'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    margin: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  searchInput: { flex: 1, paddingVertical: spacing.md, paddingHorizontal: spacing.sm, fontSize: fontSize.md, color: colors.textPrimary },
  listContent: { padding: spacing.sm },
  columnWrapper: { justifyContent: 'space-between' },
  emptyState: { flex: 1, alignItems: 'center', paddingVertical: spacing.xxl },
  emptyStateTitle: { fontSize: fontSize.xl, fontWeight: '600', color: colors.textPrimary, marginTop: spacing.lg },
  emptyStateText: { fontSize: fontSize.md, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
});
