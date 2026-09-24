import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, ActivityIndicator, Dimensions, Alert } from 'react-native';
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
  const [activeTab, setActiveTab] = useState<'videos' | 'saved'>('videos');

  useEffect(() => {
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

    const fetchSavedVideos = async () => {
      setLoading(true);
      try {
        const res = await api.get('/videos/user/saved');
        if (res.data.success) {
          setVideos(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching saved videos:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.username) {
      if (activeTab === 'saved') {
        fetchSavedVideos();
      } else {
        fetchUserVideos();
      }
    }
  }, [user?.username, activeTab]);

  const handleSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/settings');
  };

  const handleLongPressVideo = (video: any) => {
    if (activeTab === 'videos') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        'Delete Video',
        'Do you want to delete this video?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                const res = await api.delete(`/videos/${video._id}`);
                if (res.data.success) {
                  setVideos(prev => prev.filter(v => v._id !== video._id));
                  Alert.alert('Deleted', 'Video deleted successfully.');
                }
              } catch (err: any) {
                Alert.alert('Error', err.response?.data?.error?.message || 'Failed to delete video');
              }
            }
          }
        ]
      );
    }
  };

  const renderVideoItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.videoItem}
      onPress={() => {
        router.push(`/video/${item._id}` as any);
      }}
      onLongPress={() => handleLongPressVideo(item)}
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

      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'videos' && styles.activeTab]} 
          onPress={() => setActiveTab('videos')}
        >
          <Text style={[styles.tabText, activeTab === 'videos' && styles.activeTabText]}>My Videos</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'saved' && styles.activeTab]} 
          onPress={() => setActiveTab('saved')}
        >
          <Text style={[styles.tabText, activeTab === 'saved' && styles.activeTabText]}>Saved</Text>
        </TouchableOpacity>
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
              <Text style={styles.emptyText}>
                {activeTab === 'saved' ? "No saved videos yet" : "No videos uploaded yet"}
              </Text>
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
  tabsContainer: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    color: colors.secondary,
    fontWeight: 'bold',
    fontSize: typography.size.md,
  },
  activeTabText: {
    color: colors.primary,
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

