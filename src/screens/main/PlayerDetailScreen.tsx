import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { usePlayerStore } from '../../stores/playerStore';
import { colors } from '../../theme/colors';
import { spacing, fontSize, borderRadius } from '../../theme/spacing';
import { PlayersStackParamList } from '../../navigation/MainNavigator';

type RouteProps = RouteProp<PlayersStackParamList, 'PlayerDetail'>;

export default function PlayerDetailScreen() {
  const route = useRoute<RouteProps>();
  const { playerId } = route.params;
  
  const { selectedPlayer, fetchPlayerById, isLoading } = usePlayerStore();

  useEffect(() => {
    fetchPlayerById(playerId);
  }, [playerId]);

  if (!selectedPlayer) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: selectedPlayer.avatar_url || 'https://via.placeholder.com/120' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{selectedPlayer.full_name || 'Player'}</Text>
        <View style={[styles.statusBadge, selectedPlayer.is_available ? styles.availableBadge : styles.unavailableBadge]}>
          <View style={[styles.statusDot, selectedPlayer.is_available ? styles.availableDot : styles.unavailableDot]} />
          <Text style={styles.statusText}>
            {selectedPlayer.is_available ? 'Available to Play' : 'Not Available'}
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <StatItem icon="football" label="Position" value={selectedPlayer.position || 'Not set'} />
        <StatItem icon="trophy" label="Skill" value={selectedPlayer.skill_level || 'Not set'} />
      </View>

      {/* Bio */}
      {selectedPlayer.bio && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{selectedPlayer.bio}</Text>
        </View>
      )}

      {/* Contact */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact</Text>
        <View style={styles.contactRow}>
          <Ionicons name="mail" size={20} color={colors.primary} />
          <Text style={styles.contactText}>{selectedPlayer.email}</Text>
        </View>
      </View>

      {/* Distance */}
      {(selectedPlayer as any).distance !== undefined && (
        <View style={styles.section}>
          <View style={styles.distanceRow}>
            <Ionicons name="location" size={20} color={colors.primary} />
            <Text style={styles.distanceText}>
              {((selectedPlayer as any).distance as number).toFixed(1)} km away
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function StatItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Ionicons name={icon as any} size={24} color={colors.primary} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: colors.primary, padding: spacing.xl, alignItems: 'center' },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: colors.white },
  name: { fontSize: fontSize.xxl, fontWeight: 'bold', color: colors.white, marginTop: spacing.md },
  statusBadge: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full },
  availableBadge: { backgroundColor: colors.success + '30' },
  unavailableBadge: { backgroundColor: colors.gray + '30' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.xs },
  availableDot: { backgroundColor: colors.success },
  unavailableDot: { backgroundColor: colors.gray },
  statusText: { color: colors.white, fontSize: fontSize.sm, fontWeight: '500' },
  statsContainer: { flexDirection: 'row', backgroundColor: colors.white, margin: spacing.md, borderRadius: borderRadius.lg, padding: spacing.md },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs },
  statValue: { fontSize: fontSize.md, fontWeight: '600', color: colors.textPrimary, marginTop: spacing.xs, textTransform: 'capitalize' },
  section: { backgroundColor: colors.white, marginHorizontal: spacing.md, marginBottom: spacing.md, padding: spacing.md, borderRadius: borderRadius.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.md },
  bioText: { fontSize: fontSize.md, color: colors.textSecondary, lineHeight: 22 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  contactText: { fontSize: fontSize.md, color: colors.textPrimary },
  distanceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  distanceText: { fontSize: fontSize.md, color: colors.textSecondary },
});
