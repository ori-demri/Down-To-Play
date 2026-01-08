import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useGameStore } from '../../stores/gameStore';
import { useAuthStore } from '../../stores/authStore';
import { colors } from '../../theme/colors';
import { spacing, fontSize, borderRadius } from '../../theme/spacing';
import { GamesStackParamList } from '../../navigation/MainNavigator';
import { ParticipantStatus } from '../../types/database';

type RouteProps = RouteProp<GamesStackParamList, 'GameDetail'>;

export default function GameDetailScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation();
  const { gameId } = route.params;
  
  const { selectedGame, fetchGameById, joinGame, leaveGame, updateParticipantStatus, deleteGame, subscribeToGame, isLoading } = useGameStore();
  const { profile } = useAuthStore();

  useEffect(() => {
    fetchGameById(gameId);
    const unsubscribe = subscribeToGame(gameId);
    return () => unsubscribe();
  }, [gameId]);

  if (!selectedGame) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const isOrganizer = selectedGame.organizer_id === profile?.id;
  const myParticipation = selectedGame.participants?.find((p) => p.player_id === profile?.id);
  const hasJoined = !!myParticipation;
  const spotsLeft = selectedGame.players_needed - selectedGame.players_joined;
  const approvedParticipants = selectedGame.participants?.filter((p) => p.status === 'approved') || [];
  const pendingParticipants = selectedGame.participants?.filter((p) => p.status === 'pending') || [];

  const handleJoin = () => {
    Alert.alert('Join Game', 'Send a request to join this game?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Join', onPress: () => joinGame(gameId) },
    ]);
  };

  const handleLeave = () => {
    Alert.alert('Leave Game', 'Are you sure you want to leave this game?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: () => leaveGame(gameId) },
    ]);
  };

  const handleDelete = () => {
    Alert.alert('Delete Game', 'Are you sure you want to delete this game?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteGame(gameId);
        navigation.goBack();
      }},
    ]);
  };

  const handleParticipantAction = (playerId: string, status: ParticipantStatus) => {
    updateParticipantStatus(gameId, playerId, status);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{selectedGame.status.toUpperCase()}</Text>
        </View>
        <Text style={styles.title}>{selectedGame.title}</Text>
        <View style={styles.organizerRow}>
          <Image
            source={{ uri: selectedGame.organizer?.avatar_url || 'https://via.placeholder.com/40' }}
            style={styles.organizerAvatar}
          />
          <Text style={styles.organizerName}>
            Organized by {selectedGame.organizer?.full_name || 'Unknown'}
          </Text>
        </View>
      </View>

      {/* Details */}
      <View style={styles.detailsCard}>
        <DetailRow icon="calendar" label="Date" value={formatDate(selectedGame.game_date)} />
        <DetailRow icon="time" label="Time" value={selectedGame.start_time} />
        <DetailRow icon="location" label="Location" value={selectedGame.court?.name || selectedGame.custom_location || 'TBD'} />
        <DetailRow icon="people" label="Players Needed" value={`${spotsLeft} of ${selectedGame.players_needed} spots left`} />
        {selectedGame.skill_level && (
          <DetailRow icon="trophy" label="Skill Level" value={selectedGame.skill_level} />
        )}
      </View>

      {/* Description */}
      {selectedGame.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{selectedGame.description}</Text>
        </View>
      )}

      {/* Participants */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Players ({approvedParticipants.length})</Text>
        {approvedParticipants.length > 0 ? (
          approvedParticipants.map((participant) => (
            <View key={participant.id} style={styles.participantRow}>
              <Image
                source={{ uri: participant.player?.avatar_url || 'https://via.placeholder.com/40' }}
                style={styles.participantAvatar}
              />
              <Text style={styles.participantName}>{participant.player?.full_name || 'Player'}</Text>
              <Text style={styles.participantPosition}>{participant.player?.position || ''}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No confirmed players yet</Text>
        )}
      </View>

      {/* Pending Requests (Organizer Only) */}
      {isOrganizer && pendingParticipants.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pending Requests ({pendingParticipants.length})</Text>
          {pendingParticipants.map((participant) => (
            <View key={participant.id} style={styles.pendingRow}>
              <Image
                source={{ uri: participant.player?.avatar_url || 'https://via.placeholder.com/40' }}
                style={styles.participantAvatar}
              />
              <View style={styles.pendingInfo}>
                <Text style={styles.participantName}>{participant.player?.full_name || 'Player'}</Text>
                <Text style={styles.participantPosition}>{participant.player?.position || ''}</Text>
              </View>
              <TouchableOpacity
                style={styles.approveButton}
                onPress={() => handleParticipantAction(participant.player_id, 'approved')}
              >
                <Ionicons name="checkmark" size={20} color={colors.white} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() => handleParticipantAction(participant.player_id, 'rejected')}
              >
                <Ionicons name="close" size={20} color={colors.white} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {isOrganizer ? (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete Game</Text>
          </TouchableOpacity>
        ) : hasJoined ? (
          <TouchableOpacity style={styles.leaveButton} onPress={handleLeave}>
            <Text style={styles.leaveButtonText}>
              {myParticipation?.status === 'pending' ? 'Cancel Request' : 'Leave Game'}
            </Text>
          </TouchableOpacity>
        ) : spotsLeft > 0 && selectedGame.status === 'open' ? (
          <TouchableOpacity style={styles.joinButton} onPress={handleJoin}>
            <Text style={styles.joinButtonText}>Request to Join</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.fullButton}>
            <Text style={styles.fullButtonText}>Game is Full</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon as any} size={20} color={colors.primary} />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: colors.primary, padding: spacing.lg, paddingTop: spacing.md },
  statusBadge: { backgroundColor: colors.secondary, alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.sm },
  statusText: { color: colors.white, fontSize: fontSize.xs, fontWeight: 'bold' },
  title: { fontSize: fontSize.xxl, fontWeight: 'bold', color: colors.white, marginTop: spacing.sm },
  organizerRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  organizerAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: spacing.sm },
  organizerName: { color: colors.white, fontSize: fontSize.md },
  detailsCard: { backgroundColor: colors.white, margin: spacing.md, padding: spacing.md, borderRadius: borderRadius.lg },
  detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  detailLabel: { color: colors.textSecondary, fontSize: fontSize.md, marginLeft: spacing.sm, width: 100 },
  detailValue: { flex: 1, color: colors.textPrimary, fontSize: fontSize.md, fontWeight: '500' },
  section: { backgroundColor: colors.white, margin: spacing.md, marginTop: 0, padding: spacing.md, borderRadius: borderRadius.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.md },
  description: { fontSize: fontSize.md, color: colors.textSecondary, lineHeight: 22 },
  participantRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  participantAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: spacing.md },
  participantName: { flex: 1, fontSize: fontSize.md, fontWeight: '500', color: colors.textPrimary },
  participantPosition: { fontSize: fontSize.sm, color: colors.textSecondary, textTransform: 'capitalize' },
  pendingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  pendingInfo: { flex: 1 },
  approveButton: { backgroundColor: colors.success, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginLeft: spacing.sm },
  rejectButton: { backgroundColor: colors.error, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginLeft: spacing.sm },
  emptyText: { fontSize: fontSize.md, color: colors.textMuted, fontStyle: 'italic' },
  actions: { padding: spacing.lg },
  joinButton: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: borderRadius.lg, alignItems: 'center' },
  joinButtonText: { color: colors.white, fontSize: fontSize.lg, fontWeight: '600' },
  leaveButton: { backgroundColor: colors.white, paddingVertical: spacing.md, borderRadius: borderRadius.lg, alignItems: 'center', borderWidth: 1, borderColor: colors.error },
  leaveButtonText: { color: colors.error, fontSize: fontSize.lg, fontWeight: '600' },
  deleteButton: { backgroundColor: colors.error, paddingVertical: spacing.md, borderRadius: borderRadius.lg, alignItems: 'center' },
  deleteButtonText: { color: colors.white, fontSize: fontSize.lg, fontWeight: '600' },
  fullButton: { backgroundColor: colors.lightGray, paddingVertical: spacing.md, borderRadius: borderRadius.lg, alignItems: 'center' },
  fullButtonText: { color: colors.textMuted, fontSize: fontSize.lg, fontWeight: '600' },
});
