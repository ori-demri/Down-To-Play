import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../stores/authStore';
import { colors } from '../../theme/colors';
import { spacing, fontSize, borderRadius } from '../../theme/spacing';
import { PlayerPosition, SkillLevel } from '../../types/database';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { profile, updateProfile, isLoading } = useAuthStore();
  
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [position, setPosition] = useState<PlayerPosition | ''>(profile?.position || '');
  const [skillLevel, setSkillLevel] = useState<SkillLevel | ''>(profile?.skill_level || '');
  const [bio, setBio] = useState(profile?.bio || '');

  const handleSave = async () => {
    await updateProfile({
      full_name: fullName.trim() || null,
      position: position || null,
      skill_level: skillLevel || null,
      bio: bio.trim() || null,
    });
    Alert.alert('Success', 'Profile updated!', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const positions: PlayerPosition[] = ['goalkeeper', 'defender', 'midfielder', 'forward', 'any'];
  const skillLevels: SkillLevel[] = ['beginner', 'intermediate', 'advanced', 'pro'];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        {/* Full Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Your full name"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Position */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Preferred Position</Text>
          <View style={styles.optionButtons}>
            {positions.map((pos) => (
              <TouchableOpacity
                key={pos}
                style={[styles.optionButton, position === pos && styles.optionButtonActive]}
                onPress={() => setPosition(position === pos ? '' : pos)}
              >
                <Text style={[styles.optionButtonText, position === pos && styles.optionButtonTextActive]}>
                  {pos.charAt(0).toUpperCase() + pos.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Skill Level */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Skill Level</Text>
          <View style={styles.optionButtons}>
            {skillLevels.map((level) => (
              <TouchableOpacity
                key={level}
                style={[styles.optionButton, skillLevel === level && styles.optionButtonActive]}
                onPress={() => setSkillLevel(skillLevel === level ? '' : level)}
              >
                <Text style={[styles.optionButtonText, skillLevel === level && styles.optionButtonTextActive]}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bio */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell other players about yourself..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>{isLoading ? 'Saving...' : 'Save Changes'}</Text>
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
  textArea: { height: 120, textAlignVertical: 'top' },
  optionButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  optionButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  optionButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionButtonText: { fontSize: fontSize.md, color: colors.textPrimary },
  optionButtonTextActive: { color: colors.white },
  saveButton: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: borderRadius.lg, alignItems: 'center', marginTop: spacing.lg },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: colors.white, fontSize: fontSize.lg, fontWeight: '600' },
});
