import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useGameStore } from '../../stores/gameStore';
import { useCourtStore } from '../../stores/courtStore';
import { useAuthStore } from '../../stores/authStore';
import { useLocationStore } from '../../stores/locationStore';
import { colors } from '../../theme/colors';
import { spacing, fontSize, borderRadius } from '../../theme/spacing';
import { SkillLevel } from '../../types/database';

export default function CreateGameScreen() {
  const navigation = useNavigation();
  const { profile } = useAuthStore();
  const { createGame, isLoading } = useGameStore();
  const { nearbyCourts, fetchNearbyCourts } = useCourtStore();
  const { currentLocation } = useLocationStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courtId, setCourtId] = useState<string | null>(null);
  const [customLocation, setCustomLocation] = useState('');
  const [gameDate, setGameDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [playersNeeded, setPlayersNeeded] = useState('5');
  const [skillLevel, setSkillLevel] = useState<SkillLevel | ''>('');

  useEffect(() => {
    fetchNearbyCourts();
  }, []);

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a game title');
      return;
    }
    if (!gameDate) {
      Alert.alert('Error', 'Please select a date');
      return;
    }
    if (!startTime) {
      Alert.alert('Error', 'Please enter a start time');
      return;
    }
    if (!courtId && !customLocation.trim()) {
      Alert.alert('Error', 'Please select a court or enter a custom location');
      return;
    }

    const game = await createGame({
      title: title.trim(),
      description: description.trim() || null,
      court_id: courtId,
      organizer_id: profile!.id,
      game_date: gameDate,
      start_time: startTime,
      players_needed: parseInt(playersNeeded, 10),
      skill_level: skillLevel || null,
      status: 'open',
      custom_location: courtId ? null : customLocation.trim(),
      latitude: courtId ? null : currentLocation?.coords.latitude || null,
      longitude: courtId ? null : currentLocation?.coords.longitude || null,
    });

    if (game) {
      Alert.alert('Success', 'Game created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        {/* Title */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Game Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Sunday Morning Kickaround"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Tell players what to expect..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date *</Text>
          <TextInput
            style={styles.input}
            value={gameDate}
            onChangeText={setGameDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Time */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Start Time *</Text>
          <TextInput
            style={styles.input}
            value={startTime}
            onChangeText={setStartTime}
            placeholder="e.g., 10:00 AM"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Court Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Court</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={courtId}
              onValueChange={(value) => {
                setCourtId(value);
                if (value) setCustomLocation('');
              }}
              style={styles.picker}
            >
              <Picker.Item label="Select a court..." value={null} />
              {nearbyCourts.map((court) => (
                <Picker.Item key={court.id} label={court.name} value={court.id} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Custom Location */}
        {!courtId && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Or Enter Custom Location *</Text>
            <TextInput
              style={styles.input}
              value={customLocation}
              onChangeText={setCustomLocation}
              placeholder="e.g., Central Park North Field"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        )}

        {/* Players Needed */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Players Needed *</Text>
          <View style={styles.counterContainer}>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => setPlayersNeeded(String(Math.max(1, parseInt(playersNeeded) - 1)))}
            >
              <Ionicons name="remove" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.counterValue}>{playersNeeded}</Text>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => setPlayersNeeded(String(Math.min(22, parseInt(playersNeeded) + 1)))}
            >
              <Ionicons name="add" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Skill Level */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Skill Level (Optional)</Text>
          <View style={styles.skillButtons}>
            {(['beginner', 'intermediate', 'advanced', 'pro'] as SkillLevel[]).map((level) => (
              <TouchableOpacity
                key={level}
                style={[styles.skillButton, skillLevel === level && styles.skillButtonActive]}
                onPress={() => setSkillLevel(skillLevel === level ? '' : level)}
              >
                <Text style={[styles.skillButtonText, skillLevel === level && styles.skillButtonTextActive]}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={[styles.createButton, isLoading && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={isLoading}
        >
          <Text style={styles.createButtonText}>{isLoading ? 'Creating...' : 'Create Game'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  form: { padding: spacing.lg },
  inputGroup: { marginBottom: spacing.lg },
  label: { fontSize: fontSize.md, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  pickerContainer: { backgroundColor: colors.white, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.lightGray, overflow: 'hidden' },
  picker: { height: 50 },
  counterContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  counterButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.primary },
  counterValue: { fontSize: fontSize.xxl, fontWeight: 'bold', color: colors.textPrimary, minWidth: 50, textAlign: 'center' },
  skillButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  skillButton: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: borderRadius.full, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.lightGray },
  skillButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  skillButtonText: { fontSize: fontSize.md, color: colors.textPrimary },
  skillButtonTextActive: { color: colors.white },
  createButton: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: borderRadius.lg, alignItems: 'center', marginTop: spacing.lg },
  createButtonDisabled: { opacity: 0.6 },
  createButtonText: { color: colors.white, fontSize: fontSize.lg, fontWeight: '600' },
});
