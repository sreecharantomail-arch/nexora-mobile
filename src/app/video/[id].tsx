import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../services/api';
import VideoItem from '../../components/Feed/VideoItem';
import { colors, spacing, typography } from '../../theme';
import { ArrowLeft } from 'lucide-react-native';

export default function StandaloneVideoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await api.get(`/videos/${id}`);
        if (res.data.success) {
          setVideo(res.data.data);
        } else {
          setError('Video not found');
        }
      } catch {
        setError('Failed to load video');
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (error || !video) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.floatingBackButton} onPress={() => router.back()}>
        <ArrowLeft color={colors.primary} size={28} />
      </TouchableOpacity>
      <VideoItem item={video} isActive={true} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  errorText: { color: colors.primary, fontSize: typography.size.md, marginBottom: spacing.md },
  backButton: { padding: spacing.md, backgroundColor: colors.surface, borderRadius: 8 },
  backButtonText: { color: colors.primary, fontWeight: 'bold' },
  floatingBackButton: {
    position: 'absolute', top: 50, left: 16, zIndex: 10,
    width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center'
  },
});
