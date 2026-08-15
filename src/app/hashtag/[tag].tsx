import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Dimensions, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../services/api';
import { colors, typography, spacing } from '../../theme';
import { ArrowLeft, Hash } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width / 3;

export default function HashtagScreen() {
  const { tag } = useLocalSearchParams<{ tag: string }>();
  const router = useRouter();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHashtagFeed = async () => {
      try {
        const res = await api.get(`/videos/hashtag/${tag}`);
        if (res.data.success) {
          setVideos(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching hashtag feed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHashtagFeed();
  }, [tag]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color={colors.primary} size={28} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Hash color={colors.primary} size={20} />
          <Text style={styles.headerTitle}>{tag}</Text>
        </View>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : videos.length > 0 ? (
        <FlatList
          data={videos}
          numColumns={3}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.gridItem} onPress={() => router.push(`/video/${item._id}` as any)}>
              <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No posts found for #{tag}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerTitle: {
    fontSize: typography.size.lg,
    fontWeight: 'bold',
    color: colors.primary,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.secondary,
    fontSize: typography.size.md,
  },
  gridItem: {
    width: COLUMN_WIDTH,
    height: COLUMN_WIDTH * 1.5,
    padding: 1,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#222',
  },
});
