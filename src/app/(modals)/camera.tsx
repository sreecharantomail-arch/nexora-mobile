import React, { useState, useRef, useEffect } from 'react';
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
  const [cameraMode, setCameraMode] = useState<'picture' | 'video'>('video');
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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
    if (cameraRef.current && cameraMode === 'video') {
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      try {
        const video = await cameraRef.current.recordAsync({ maxDuration: 60 });
        if (timerRef.current) clearInterval(timerRef.current);
        setIsRecording(false);
        if (video) {
          router.replace({ pathname: '/(modals)/upload-preview', params: { uri: video.uri, type: 'video' } } as any);
        }
      } catch {
        if (timerRef.current) clearInterval(timerRef.current);
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

  const takePicture = async () => {
    if (cameraRef.current && cameraMode === 'picture') {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo) {
          router.replace({ pathname: '/(modals)/upload-preview', params: { uri: photo.uri, type: 'image' } } as any);
        }
      } catch {
        Alert.alert('Error', 'Failed to take photo');
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} mode={cameraMode} ref={cameraRef} />

      <View style={styles.topControls}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <ArrowLeft color={colors.primary} size={28} />
        </TouchableOpacity>
        
        {isRecording && (
          <View style={styles.timerContainer}>
            <View style={styles.recordingDot} />
            <Text style={styles.timerText}>{formatTime(recordingTime)}</Text>
          </View>
        )}
        
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.modeContainer}>
        {!isRecording && (
          <View style={styles.modeToggle}>
            <TouchableOpacity 
              style={[styles.modeButton, cameraMode === 'picture' && styles.modeButtonActive]}
              onPress={() => setCameraMode('picture')}
            >
              <Text style={[styles.modeText, cameraMode === 'picture' && styles.modeTextActive]}>Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modeButton, cameraMode === 'video' && styles.modeButtonActive]}
              onPress={() => setCameraMode('video')}
            >
              <Text style={[styles.modeText, cameraMode === 'video' && styles.modeTextActive]}>Video</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.bottomControls}>
        <TouchableOpacity 
          style={[styles.recordButton, cameraMode === 'picture' && styles.pictureButton]} 
          onPress={cameraMode === 'video' ? (isRecording ? stopRecording : startRecording) : takePicture}
        >
          {cameraMode === 'video' ? (
            isRecording ? (
              <Square color={colors.error} size={40} fill={colors.error} />
            ) : (
              <Circle color={colors.error} size={64} fill={colors.error} />
            )
          ) : (
            <Circle color={colors.primary} size={64} fill={colors.primary} />
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
  },
  pictureButton: {
    borderColor: '#ccc'
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    gap: spacing.sm
  },
  recordingDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: colors.error
  },
  timerText: {
    color: colors.primary, fontWeight: 'bold', fontSize: 16
  },
  modeContainer: {
    position: 'absolute', bottom: 150, left: 0, right: 0,
    alignItems: 'center'
  },
  modeToggle: {
    flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: radius.full, padding: 4
  },
  modeButton: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.full
  },
  modeButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.2)'
  },
  modeText: {
    color: 'rgba(255,255,255,0.7)', fontWeight: 'bold'
  },
  modeTextActive: {
    color: '#fff'
  }
});
