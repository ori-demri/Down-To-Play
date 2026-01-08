import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Switch, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { usePlayerStore } from '../../stores/playerStore';
import { colors } from '../../theme/colors';
import { spacing, fontSize, borderRadius } from '../../theme/spacing';
import { ProfileStackParamList } from '../../navigation/MainNavigator';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'Profile'>;

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { profile, signOut } = useAuthStore();
  const { toggleAvailability } = usePlayerStore();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  if (!profile) return null;

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: profile.avatar_url || 'https://via.placeholder.com/100' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{profile.full_name || 'Player'}</Text>
        <Text style={styles.email}>{profile.email}</Text>
        <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile')}>
          <Ionicons name="pencil" size={16} color={colors.primary} />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Availability Toggle */}
      <View style={styles.availabilityCard}>
        <View style={styles.availabilityInfo}>
          <Ionicons name="radio-button-on" size={24} color={profile.is_available ? colors.success : colors.gray} />
          <View style={styles.availabilityText}>
            <Text style={styles.availabilityTitle}>Available to Play</Text>
            <Text style={styles.availabilitySubtitle}>
              {profile.is_available ? 'Other players can see you on the map' : 'You are hidden from other players'}
            </Text>
          </View>
        </View>
        <Switch
          value={profile.is_available}
          onValueChange={toggleAvailability}
          trackColor={{ false: colors.lightGray, true: colors.success + '50' }}
          thumbColor={profile.is_available ? colors.success : colors.gray}
        />
      </View>

      {/* Player Info */}
      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Player Info</Text>
        <InfoRow icon="football" label="Position" value={profile.position || 'Not set'} />
        <InfoRow icon="trophy" label="Skill Level" value={profile.skill_level || 'Not set'} />
        <InfoRow icon="document-text" label="Bio" value={profile.bio || 'No bio added'} />
      </View>

      {/* Actions */}
      <View style={styles.actionsCard}>
        <TouchableOpacity style={styles.actionRow} onPress={() => {}}>
          <Ionicons name="settings-outline" size={22} color={colors.textPrimary} />
          <Text style={styles.actionText}>Settings</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionRow} onPress={() => {}}>
          <Ionicons name="help-circle-outline" size={22} color={colors.textPrimary} />
          <Text style={styles.actionText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionRow} onPress={() => {}}>
          <Ionicons name="shield-checkmark-outline" size={22} color={colors.textPrimary} />
          <Text style={styles.actionText}>Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionRow, styles.signOutRow]} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={22} color={colors.error} />
          <Text style={[styles.actionText, styles.signOutText]}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* App Version */}
      <Text style={styles.version}>Down To Play v1.0.0</Text>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon as any} size={20} color={colors.primary} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, padding: spacing.xl, alignItems: 'center' },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: colors.white },
  name: { fontSize: fontSize.xxl, fontWeight: 'bold', color: colors.white, marginTop: spacing.md },
  email: { fontSize: fontSize.md, color: colors.white + 'CC', marginTop: spacing.xs },
  editButton: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md, backgroundColor: colors.white, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.full, gap: spacing.xs },
  editButtonText: { color: colors.primary, fontWeight: '500' },
  availabilityCard: { backgroundColor: colors.white, margin: spacing.md, padding: spacing.md, borderRadius: borderRadius.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  availabilityInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  availabilityText: { marginLeft: spacing.md, flex: 1 },
  availabilityTitle: { fontSize: fontSize.md, fontWeight: '600', color: colors.textPrimary },
  availabilitySubtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  infoCard: { backgroundColor: colors.white, marginHorizontal: spacing.md, marginBottom: spacing.md, padding: spacing.md, borderRadius: borderRadius.lg },
  cardTitle: { fontSize: fontSize.lg, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  infoLabel: { color: colors.textSecondary, fontSize: fontSize.md, marginLeft: spacing.sm, width: 90 },
  infoValue: { flex: 1, fontSize: fontSize.md, color: colors.textPrimary, textTransform: 'capitalize' },
  actionsCard: { backgroundColor: colors.white, marginHorizontal: spacing.md, marginBottom: spacing.md, borderRadius: borderRadius.lg, overflow: 'hidden' },
  actionRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.lightGray },
  actionText: { flex: 1, fontSize: fontSize.md, color: colors.textPrimary, marginLeft: spacing.md },
  signOutRow: { borderBottomWidth: 0 },
  signOutText: { color: colors.error },
  version: { textAlign: 'center', color: colors.textMuted, fontSize: fontSize.sm, padding: spacing.lg },
});
