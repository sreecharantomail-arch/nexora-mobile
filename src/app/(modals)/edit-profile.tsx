import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import { colors, typography, spacing, radius } from '../../theme';
import { ArrowLeft, Camera } from 'lucide-react-native';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore(); // reuse login to update state if needed, or just update user store
  
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('displayName', displayName.trim());
      formData.append('bio', bio.trim());
      
      if (imageUri) {
        if (Platform.OS === 'web') {
          const response = await fetch(imageUri);
          const blob = await response.blob();
          const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
          formData.append('image', file);
        } else {
          formData.append('image', {
            uri: Platform.OS === 'android' ? imageUri : imageUri.replace('file://', ''),
            name: 'profile.jpg',
            type: 'image/jpeg',
          } as any);
        }
      }

      const res = await api.put('/users/profile', formData);

      if (res.data.success) {
        setUser(res.data.data);
        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Error', res.data.error?.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Update Profile Error:', error);
      Alert.alert('Error', error.response?.data?.error?.message || 'Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} disabled={isSaving}>
          <ArrowLeft color={colors.primary} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={isSaving}>
          {isSaving ? <ActivityIndicator color={colors.accent} /> : <Text style={styles.saveText}>Save</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TouchableOpacity style={styles.avatarContainer} onPress={handlePickImage} disabled={isSaving}>
          <Image 
            source={{ uri: imageUri || user?.profileImage || 'https://via.placeholder.com/150' }} 
            style={styles.avatar} 
          />
          <View style={styles.cameraIconContainer}>
            <Camera color={colors.primary} size={20} />
          </View>
        </TouchableOpacity>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Display Name"
            placeholderTextColor={colors.secondary}
            editable={!isSaving}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself"
            placeholderTextColor={colors.secondary}
            multiline
            maxLength={160}
            editable={!isSaving}
          />
          <Text style={styles.charCount}>{bio.length}/160</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 50, paddingBottom: spacing.md, paddingHorizontal: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backButton: { padding: spacing.xs },
  headerTitle: { fontSize: typography.size.lg, fontWeight: 'bold', color: colors.primary },
  saveText: { color: colors.accentLight, fontSize: typography.size.md, fontWeight: 'bold' },
  content: { flex: 1, padding: spacing.xl, alignItems: 'center' },
  avatarContainer: { marginBottom: spacing.xxl, position: 'relative' },
  avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.surface },
  cameraIconContainer: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: colors.accent, padding: 8, borderRadius: 20,
    borderWidth: 3, borderColor: colors.background
  },
  inputGroup: { width: '100%', marginBottom: spacing.xl },
  label: { color: colors.secondary, fontSize: typography.size.sm, marginBottom: spacing.sm, fontWeight: 'bold' },
  input: {
    backgroundColor: colors.inputBg, color: colors.primary,
    borderRadius: radius.md, padding: spacing.md,
    fontSize: typography.size.md, borderWidth: 1, borderColor: colors.border
  },
  bioInput: { minHeight: 100, textAlignVertical: 'top' },
  charCount: { color: colors.secondary, alignSelf: 'flex-end', marginTop: spacing.xs, fontSize: typography.size.xs },
});
