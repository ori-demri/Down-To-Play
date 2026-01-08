import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing, fontSize, borderRadius } from '../theme/spacing';
import { NearbyPlayer } from '../types/database';

interface PlayerCardProps {
  player: NearbyPlayer;
  onPress: () => void;
  compact?: boolean;
  style?: ViewStyle;
}

export default function PlayerCard({ player, onPress, compact = false, style }: PlayerCardProps) {
  if (compact) {
    return (
      <TouchableOpacity style={[styles.compactCard, style]} onPress={onPress} activeOpacity={0.7}>
        <Image
          source={{ uri: player.avatar_url || 'https://via.placeholder.com/60' }}
          style={styles.compactAvatar}
        />
        <Text style={styles.compactName} numberOfLines={1}>
          {player.full_name?.split(' ')[0] || 'Player'}
        </Text>
        {player.position && (
          <Text style={styles.compactPosition} numberOfLines={1}>
            {player.position}
          </Text>
        )}
        {player.distance !== undefined && (
          <Text style={styles.compactDistance}>{player.distance.toFixed(1)} km</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.7}>
      <Image
        source={{ uri: player.avatar_url || 'https://via.placeholder.com/80' }}
        style={styles.avatar}
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {player.full_name || 'Player'}
        </Text>
        
        {player.position && (
          <View style={styles.row}>
            <Ionicons name="football-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.rowText}>{player.position}</Text>
          </View>
        )}
        
        {player.skill_level && (
          <View style={styles.row}>
            <Ionicons name="trophy-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.rowText}>{player.skill_level}</Text>
          </View>
        )}
        
        {player.distance !== undefined && (
          <View style={styles.row}>
            <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.rowText}>{player.distance.toFixed(1)} km away</Text>
          </View>
        )}
      </View>
      
      <View style={[styles.availabilityDot, player.is_available ? styles.available : styles.unavailable]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  rowText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    textTransform: 'capitalize',
  },
  availabilityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  available: {
    backgroundColor: colors.available,
  },
  unavailable: {
    backgroundColor: colors.unavailable,
  },
  // Compact styles
  compactCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    width: '48%',
    marginBottom: spacing.md,
    marginHorizontal: '1%',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  compactAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: spacing.sm,
  },
  compactName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  compactPosition: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  compactDistance: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
