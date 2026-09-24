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
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Permission to access gallery is required to pick photos and videos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: false,
        allowsMultipleSelection: false,
        quality: 1,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        validateAndProceed(result.assets);
      }
    } catch (error) {
      console.error('Gallery pick error:', error);
      Alert.alert('Error', 'Failed to open gallery. Please try again.');
    }
  };

  const validateAndProceed = (assets: ImagePicker.ImagePickerAsset[]) => {
    const formattedAssets = assets.map(a => {
      const isVideo = a.type === 'video' || (a.mimeType && a.mimeType.startsWith('video')) || /\.(mp4|mov|quicktime|avi|mkv|webm)$/i.test(a.uri);
      const mediaType = isVideo ? 'video' : 'image';
      const durationSec = a.duration ? a.duration / 1000 : 0;
      return {
        uri: a.uri,
        type: mediaType,
        duration: durationSec,
      };
    });

    // Validate video duration rules
    for (const media of formattedAssets) {
      if (media.type === 'video') {
        if (media.duration > 0) {
          if (media.duration < 5) {
            Alert.alert('Error', 'The video is too short. Videos must be at least 5 seconds long.');
            return;
          }
          if (media.duration >= 60) {
            Alert.alert('Error', 'The video is too long. Videos must be under 60 seconds long.');
            return;
          }
        }
      }
    }

    // Pass selected asset to preview
    router.push({
      pathname: '/(modals)/upload-preview',
      params: {
        mediaItems: JSON.stringify(formattedAssets)
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
          <Text style={styles.buttonText}>Select Photo or Video</Text>
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
