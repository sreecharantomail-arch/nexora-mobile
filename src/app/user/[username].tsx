import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MoreVertical } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { api } from '../../services/api';
import { colors } from '../../theme';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const THUMBNAIL_SIZE = width / COLUMN_COUNT;

export default function UserProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useRouter();
  
  const [profile, setProfile] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Fetch profile
        const profileRes = await api.get(`/users/${username}`);
        if (profileRes.data.success) {
          setProfile(profileRes.data.data);
          setFollowing(profileRes.data.data.isFollowing);
        }
        
        // Fetch videos
        const videosRes = await api.get(`/users/${username}/videos`);
        if (videosRes.data.success) {
          setVideos(videosRes.data.data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchUserData();
    }
  }, [username]);

  const toggleFollow = async () => {
    if (!profile) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const prevFollowing = following;
      setFollowing(!prevFollowing);
      
      if (prevFollowing) {
        await api.delete(`/users/${profile._id}/follow`);
        setProfile((prev: any) => ({ ...prev, followersCount: prev.followersCount - 1 }));
      } else {
        await api.post(`/users/${profile._id}/follow`);
        setProfile((prev: any) => ({ ...prev, followersCount: prev.followersCount + 1 }));
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      setFollowing(!following); // Revert on failure
    }
  };

  const handleBlockUser = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    try {
      await api.post(`/users/${profile._id}/block`);
      alert('User blocked. You will no longer see their content.');
      router.back();
    } catch {
      alert('Failed to block user.');
    }
  };

  const handleReportUser = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    try {
      await api.post('/users/report', {
        targetId: profile._id,
        targetType: 'user',
        reason: 'Inappropriate profile (User Reported)'
      });
      alert('Profile reported. Our team will review this shortly.');
    } catch {
      alert('Failed to report user.');
    }
  };

  const showOptions = () => {
    Alert.alert(
      'Profile Options',
      'What would you like to do?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Report User', onPress: handleReportUser, style: 'destructive' },
        { text: 'Block User', onPress: handleBlockUser, style: 'destructive' },
      ]
    );
  };

  const renderVideoThumbnail = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.thumbnailContainer} 
      onPress={() => router.push(`/video/${item._id}` as any)}
    >
      <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} resizeMode="cover" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>User not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{profile.username}</Text>
        <TouchableOpacity onPress={showOptions} style={styles.backButton}>
          <MoreVertical color={colors.text} size={24} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={videos}
        keyExtractor={(item) => item._id}
        numColumns={COLUMN_COUNT}
        renderItem={renderVideoThumbnail}
        ListHeaderComponent={
          <View style={styles.profileInfo}>
            {profile.profileImage ? (
              <Image source={{ uri: profile.profileImage }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.placeholderAvatar]} />
            )}
            
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{profile.followingCount || 0}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{profile.followersCount || 0}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.followButton, following && styles.followingButton]} 
              onPress={toggleFollow}
            >
              <Text style={following ? styles.followingButtonText : styles.followButtonText}>
                {following ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
            
            {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No videos yet</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 4,
  },
  backButtonPlaceholder: {
    width: 32, // to balance the title in the center
  },
  headerTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileInfo: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  placeholderAvatar: {
    backgroundColor: colors.border,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stat: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  statNumber: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: colors.secondary,
    fontSize: 14,
  },
  followButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 16,
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  followButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  followingButtonText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  bio: {
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  thumbnailContainer: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE * 1.5,
    borderWidth: 0.5,
    borderColor: colors.background,
  },
  thumbnail: {
    flex: 1,
  },
  emptyText: {
    color: colors.secondary,
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
  }
});
