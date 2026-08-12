import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { api } from '../../../services/api';
import { colors, typography, spacing, radius } from '../../../theme';
import { Image } from 'expo-image';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = width / 3;

export default function UserProfileScreen() {
  const { username } = useLocalSearchParams();
  const [profile, setProfile] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, videosRes] = await Promise.all([
        api.get(`/users/${username}`),
        api.get(`/users/${username}/videos`)
      ]);
      if (profileRes.data.success) setProfile(profileRes.data.data);
      if (videosRes.data.success) setVideos(videosRes.data.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      const isCurrentlyFollowing = profile.isFollowing;
      
      // Optimistic UI
      setProfile({
        ...profile,
        isFollowing: !isCurrentlyFollowing,
        followersCount: isCurrentlyFollowing ? profile.followersCount - 1 : profile.followersCount + 1
      });

      if (isCurrentlyFollowing) {
        await api.delete(`/users/${profile._id}/follow`);
      } else {
        await api.post(`/users/${profile._id}/follow`);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      fetchData(); // Revert
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={colors.accent} /></View>;
  }

  if (!profile) {
    return <View style={styles.center}><Text style={styles.text}>User not found</Text></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.username}>@{profile.username}</Text>
        <Text style={styles.displayName}>{profile.displayName}</Text>
        
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile.followingCount}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile.followersCount}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.followBtn, profile.isFollowing && styles.followingBtn]} 
          onPress={handleFollow}
        >
          <Text style={styles.followBtnText}>{profile.isFollowing ? 'Following' : 'Follow'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={videos}
        numColumns={3}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.gridItem}>
            <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  text: { color: colors.primary },
  header: { padding: spacing.xl, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#222' },
  username: { color: colors.primary, fontSize: typography.size.lg, fontWeight: 'bold' },
  displayName: { color: '#888', marginTop: 4 },
  stats: { flexDirection: 'row', gap: spacing.xxl, marginVertical: spacing.lg },
  statItem: { alignItems: 'center' },
  statNumber: { color: colors.primary, fontSize: typography.size.md, fontWeight: 'bold' },
  statLabel: { color: '#888', fontSize: typography.size.sm },
  followBtn: { backgroundColor: colors.accent, paddingHorizontal: 40, paddingVertical: 10, borderRadius: radius.sm },
  followingBtn: { backgroundColor: '#333' },
  followBtnText: { color: colors.primary, fontWeight: 'bold' },
  gridItem: { width: COLUMN_WIDTH, height: COLUMN_WIDTH * 1.5, padding: 1 },
  thumbnail: { width: '100%', height: '100%', backgroundColor: '#222' }
});
