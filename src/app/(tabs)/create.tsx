import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { useRouter } from 'expo-router';

import { colors, typography, spacing, radius } from '../../theme';
import { Video, Image as ImageIcon } from 'lucide-react-native';

export default function CreateScreen() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const router = useRouter();

  const handlePickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: false, // editing not supported with multiple selection
      allowsMultipleSelection: true,
      selectionLimit: 10,
      quality: 1,
      videoMaxDuration: 60,
    });

    if (!result.canceled && result.assets.length > 0) {
      validateAndProceed(result.assets);
    }
  };

  const validateAndProceed = (assets: ImagePicker.ImagePickerAsset[]) => {
    // Basic validation for videos
    for (const media of assets) {
      if (media.type === 'video') {
        if (!media.duration) {
          Alert.alert('Error', 'Unable to read video information.');
          return;
        }
        const durationSeconds = media.duration / 1000;
        if (durationSeconds < 5) {
          Alert.alert('Error', 'One of the videos is too short. Videos must be at least 30 seconds.');
          return;
        }
        if (durationSeconds >= 60) {
          Alert.alert('Error', 'One of the videos is too long. Videos must be under 1 minute.');
          return;
        }
      }
    }

    // Pass assets to preview
    router.push({
      pathname: '/(modals)/upload-preview',
      params: {
        mediaItems: JSON.stringify(assets.map(a => ({
          uri: a.uri,
          type: a.type,
          duration: a.duration ? a.duration / 1000 : 0
        })))
      }
    } as any);
  };

  const requestPermissions = async () => {
    if (!cameraPermission?.granted) await requestCameraPermission();
    if (!micPermission?.granted) await requestMicPermission();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Post</Text>

      <View style={styles.options}>
        <TouchableOpacity style={styles.button} onPress={handlePickFromGallery}>
          <ImageIcon color={colors.primary} size={32} />
          <Text style={styles.buttonText}>Photo / Video from Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={async () => {
          await requestPermissions();
          router.push('/(modals)/camera' as any);
        }}>
          <Video color={colors.primary} size={32} />
          <Text style={styles.buttonText}>Record Video</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  options: {
    gap: spacing.lg,
  },
  button: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radius.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: {
    color: colors.primary,
    fontSize: typography.size.lg,
    fontWeight: '600',
  },
});
