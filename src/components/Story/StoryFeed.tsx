import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { api } from '../../services/api';
import { colors, spacing } from '../../theme';
import { useAuthStore } from '../../store/authStore';

export default function StoryFeed() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await api.get('/stories/feed');
        if (res.data.success) {
          setStories(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching stories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, []);

  const hasMyStory = stories.length > 0 && stories[0].user?._id === user?._id;

  const renderItem = ({ item, index }: { item: any, index: number }) => {
    const isMe = item.user._id === user?._id;
    const userStories = item.stories ?? [];
    const hasCloseFriendsStory = userStories.some((s: any) => s.audience === 'CLOSE_FRIENDS');
    const allViewed = userStories.length > 0 && userStories.every((s: any) => s.viewed);
    
    let ringStyle = styles.unviewedRing;
    if (allViewed) {
      ringStyle = styles.viewedRing;
    } else if (hasCloseFriendsStory) {
      ringStyle = styles.closeFriendsRing;
    }

    return (
      <TouchableOpacity 
        style={styles.storyContainer}
        onPress={() => router.push(`/stories/${item.user._id}` as any)}
      >
        <View style={[styles.avatarRing, ringStyle]}>
          <Image source={{ uri: item.user.profileImage || 'https://via.placeholder.com/150' }} style={styles.avatar} />
        </View>
        <Text style={styles.username} numberOfLines={1}>
          {isMe ? 'Your Story' : item.user.username}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ margin: spacing.lg }} />
      ) : (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          data={stories}
          keyExtractor={(item) => item.user._id}
          renderItem={renderItem}
          ListHeaderComponent={
            !hasMyStory ? (
              <TouchableOpacity 
                style={styles.storyContainer}
                onPress={() => router.push('/(tabs)/create' as any)}
              >
                <View style={styles.myStoryAddContainer}>
                  <Image source={{ uri: user?.profileImage || 'https://via.placeholder.com/150' }} style={styles.avatar} />
                  <View style={styles.addIconContainer}>
                    <Plus color="#fff" size={12} />
                  </View>
                </View>
                <Text style={styles.username}>Your Story</Text>
              </TouchableOpacity>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 100,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  listContainer: {
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },
  storyContainer: {
    alignItems: 'center',
    marginHorizontal: 6,
    width: 72,
  },
  avatarRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  unviewedRing: {
    borderColor: colors.accent, // Instagram style gradient would be better, but sticking to theme
  },
  viewedRing: {
    borderColor: colors.border,
  },
  closeFriendsRing: {
    borderColor: '#1DB954', // Green color for close friends
  },
  myStoryAddContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface,
  },
  addIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.accent,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  username: {
    color: colors.primary,
    fontSize: 11,
    textAlign: 'center',
  }
});
