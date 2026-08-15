import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Settings, Play } from 'lucide-react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import * as Haptics from 'expo-haptics';
import { api } from '../../services/api';

const { width } = Dimensions.get('window');
const numColumns = 3;
const videoSize = (width - spacing.md * 2 - (numColumns - 1) * spacing.xs) / numColumns;

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.username) {
      fetchUserVideos();
    }
  }, [user?.username]);

  const fetchUserVideos = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users/${user?.username}/videos`);
      if (res.data.success) {
        setVideos(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching user videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/settings');
  };

  const renderVideoItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.videoItem}
      onPress={() => {
        // We could navigate to a detailed view of the video here
      }}
    >
      <Image source={{ uri: item.thumbnailUrl }} style={styles.videoThumbnail} />
      <View style={styles.viewsContainer}>
        <Play color="#fff" size={12} />
        <Text style={styles.viewsText}>{item.viewsCount || 0}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <View style={styles.header}>
        <View style={styles.headerPlaceholder} />
        <Text style={styles.headerTitle}>@{user?.username}</Text>
        <TouchableOpacity onPress={handleSettings} style={styles.settingsButton}>
          <Settings color={colors.primary} size={24} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.profileInfo}>
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: user?.profileImage || 'https://via.placeholder.com/150' }} 
            style={styles.avatar} 
          />
        </View>
        <Text style={styles.displayName}>{user?.displayName}</Text>
        <Text style={styles.bio}>{user?.bio || 'Welcome to my NEXORA profile!'}</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{user?.followingCount || 0}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{user?.followersCount || 0}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.editButton} onPress={() => router.push('/(modals)/edit-profile' as any)}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.videosTab}>
        <Text style={styles.videosTabText}>My Videos</Text>
        <View style={styles.tabIndicator} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          {renderHeader()}
          <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: spacing.xl }} />
        </View>
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(item) => item._id}
          numColumns={numColumns}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          renderItem={renderVideoItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No videos uploaded yet</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
  },
  headerContent: {
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  headerPlaceholder: {
    width: 32,
  },
  headerTitle: {
    color: colors.primary,
    fontSize: typography.size.lg,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 4,
  },
  profileInfo: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  avatarContainer: {
    padding: 4,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: colors.accentLight,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
  },
  displayName: {
    color: colors.primary,
    fontSize: typography.size.xl,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  bio: {
    color: colors.secondary,
    fontSize: typography.size.sm,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stat: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  statNumber: {
    color: colors.primary,
    fontSize: typography.size.lg,
    fontWeight: 'bold',
  },
  statLabel: {
    color: colors.secondary,
    fontSize: typography.size.xs,
    marginTop: spacing.xs,
  },
  editButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.accentLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.full,
    width: '100%',
    alignItems: 'center',
  },
  editButtonText: {
    color: colors.accentLight,
    fontWeight: 'bold',
    fontSize: typography.size.md,
  },
  videosTab: {
    alignItems: 'center',
    marginTop: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  videosTabText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: typography.size.md,
    paddingBottom: spacing.sm,
  },
  tabIndicator: {
    height: 2,
    backgroundColor: colors.primary,
    width: 60,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  columnWrapper: {
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  videoItem: {
    width: videoSize,
    height: videoSize * 1.5,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  viewsContainer: {
    position: 'absolute',
    bottom: spacing.xs,
    left: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewsText: {
    color: '#fff',
    fontSize: typography.size.xs,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  emptyText: {
    color: colors.secondary,
    fontSize: typography.size.md,
  },
});

