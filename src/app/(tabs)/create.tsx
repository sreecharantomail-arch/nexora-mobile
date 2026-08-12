import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useCameraPermissions, useMicrophonePermissions } from 'expo-camera';

import { colors, typography, spacing, radius } from '../../theme';
import { Video } from 'lucide-react-native';

export default function CreateScreen() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  const handlePickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: true,
      quality: 1,
      videoMaxDuration: 60, // approximate, we will validate explicitly
    });

    if (!result.canceled) {
      const video = result.assets[0];
      validateAndProceed(video.uri, video.duration);
    }
  };

  const validateAndProceed = (uri: string, durationMillis?: number | null) => {
    if (!durationMillis) {
      Alert.alert('Error', 'Unable to read video information.');
      return;
    }
    
    const durationSeconds = durationMillis / 1000;
    
    if (durationSeconds < 30) {
      Alert.alert('Error', 'This video is too short. Videos must be at least 30 seconds.');
      return;
    }
    
    if (durationSeconds >= 60) {
      Alert.alert('Error', 'This video is too long. Videos must be under 1 minute.');
      return;
    }

    // Pass to preview/upload screen (we can navigate to a preview modal)
    // router.push({ pathname: '/(modals)/upload-preview', params: { uri } });
    Alert.alert('Success', `Video is valid (${durationSeconds.toFixed(1)}s). Ready to publish!`);
  };

  const requestPermissions = async () => {
    if (!cameraPermission?.granted) await requestCameraPermission();
    if (!micPermission?.granted) await requestMicPermission();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Video</Text>
      
      <View style={styles.options}>
        <TouchableOpacity style={styles.button} onPress={handlePickFromGallery}>
          <Video color={colors.primary} size={32} />
          <Text style={styles.buttonText}>Choose From Gallery</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={async () => {
          await requestPermissions();
          Alert.alert('Info', 'Camera integration would open here.');
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
