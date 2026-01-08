import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing, fontSize, borderRadius } from '../theme/spacing';
import { GameWithDetails } from '../types/database';

interface GameCardProps {
  game: GameWithDetails;
  onPress: () => void;
  style?: ViewStyle;
}

export default function GameCard({ game, onPress, style }: GameCardProps) {
  const spotsLeft = game.players_needed - game.players_joined;
  const isFull = spotsLeft <= 0;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getStatusColor = () => {
    switch (game.status) {
      case 'open':
        return colors.success;
      case 'full':
        return colors.warning;
      case 'in_progress':
        return colors.accent;
      case 'completed':
        return colors.gray;
      case 'cancelled':
        return colors.error;
      default:
        return colors.gray;
    }
  };

  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.7}>
      {/* Status Badge */}
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
        <Text style={styles.statusText}>{game.status.toUpperCase()}</Text>
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={2}>
        {game.title}
      </Text>

      {/* Date & Time */}
      <View style={styles.row}>
        <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
        <Text style={styles.rowText}>{formatDate(game.game_date)}</Text>
        <Ionicons name="time-outline" size={16} color={colors.textSecondary} style={styles.rowIcon} />
        <Text style={styles.rowText}>{game.start_time}</Text>
      </View>

      {/* Location */}
      <View style={styles.row}>
        <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
        <Text style={styles.rowText} numberOfLines={1}>
          {game.court?.name || game.custom_location || 'Location TBD'}
        </Text>
      </View>

      {/* Players */}
      <View style={styles.footer}>
        <View style={styles.playersInfo}>
          <Ionicons name="people" size={18} color={isFull ? colors.warning : colors.primary} />
          <Text style={[styles.playersText, isFull && styles.fullText]}>
            {isFull ? 'Full' : `${spotsLeft} spots left`}
          </Text>
        </View>
        {game.skill_level && (
          <View style={styles.skillBadge}>
            <Text style={styles.skillText}>{game.skill_level}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  statusText: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: 'bold',
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  rowIcon: {
    marginLeft: spacing.md,
  },
  rowText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  playersInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playersText: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  fullText: {
    color: colors.warning,
  },
  skillBadge: {
    backgroundColor: colors.lightGray,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  skillText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
});
