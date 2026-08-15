import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { colors, spacing, radius } from '../../theme';
import { ArrowLeft, Circle, Square } from 'lucide-react-native';

export default function CameraScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isRecording, setIsRecording] = useState(false);

  if (!permission || !micPermission) {
    return <View />;
  }

  if (!permission.granted || !micPermission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.text}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.button} onPress={async () => {
          await requestPermission();
          await requestMicPermission();
        }}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const startRecording = async () => {
    if (cameraRef.current) {
      setIsRecording(true);
      try {
        const video = await cameraRef.current.recordAsync({ maxDuration: 60 });
        setIsRecording(false);
        if (video) {
          // Navigating back to create to preview/upload 
          // (Wait, better to go directly to upload-preview, or pass back to create.tsx?)
          // Passing directly to upload-preview is easiest. 
          // We can't get exact duration easily from recordAsync result, so we will not pass duration 
          // or we pass a dummy duration and let the backend check it or let user preview it.
          router.replace({ pathname: '/(modals)/upload-preview', params: { uri: video.uri } } as any);
        }
      } catch {
        setIsRecording(false);
        Alert.alert('Error', 'Failed to record video');
      }
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} mode="video" ref={cameraRef} />

      <View style={styles.topControls}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <ArrowLeft color={colors.primary} size={28} />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomControls}>
        <TouchableOpacity 
          style={styles.recordButton} 
          onPress={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? (
            <Square color={colors.error} size={40} fill={colors.error} />
          ) : (
            <Circle color={colors.error} size={64} fill={colors.error} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  text: { color: colors.primary, marginBottom: spacing.lg },
  button: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md },
  buttonText: { color: colors.primary },
  camera: { flex: 1 },
  topControls: {
    position: 'absolute', top: 50, left: spacing.md, right: spacing.md,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  iconButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center'
  },
  bottomControls: {
    position: 'absolute', bottom: 50, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center'
  },
  recordButton: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center',
    borderWidth: 4, borderColor: colors.primary
  }
});
