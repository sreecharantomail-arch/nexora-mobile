import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageCircle } from 'lucide-react-native';
import { colors, spacing } from '../../theme';
import FeedList from '../../components/Feed/FeedList';
import { api } from '../../services/api';

export default function HomeScreen() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'foryou' | 'following'>('foryou');
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'following' ? '/videos/feed/following' : '/videos/feed';
      const res = await api.get(endpoint);
      if (res.data.success) {
        setVideos(res.data.data.videos);
        setNextCursor(res.data.data.nextCursor);
      }
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMore = async () => {
    if (!nextCursor || loadingMore) return;
    
    setLoadingMore(true);
    try {
      const endpoint = activeTab === 'following' 
        ? `/videos/feed/following?cursor=${nextCursor}` 
        : `/videos/feed?cursor=${nextCursor}`;
      
      const res = await api.get(endpoint);
      if (res.data.success) {
        setVideos(prev => [...prev, ...res.data.data.videos]);
        setNextCursor(res.data.data.nextCursor);
      }
    } catch (error) {
      console.error('Error fetching more videos:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useFocusEffect(
    useCallback(() => {
      // Optional: Refresh feed when returning to tab
      // fetchFeed();
    }, [])
  );

  return (
    <View style={styles.container}>
      <View style={[styles.topNav, { paddingTop: Math.max(insets.top, 20) + spacing.xs }]}>
        <View style={styles.navTabs}>
          <TouchableOpacity onPress={() => setActiveTab('following')}>
            <Text style={[styles.navText, activeTab === 'following' && styles.activeNavText]}>Following</Text>
          </TouchableOpacity>
          <View style={styles.navDivider} />
          <TouchableOpacity onPress={() => setActiveTab('foryou')}>
            <Text style={[styles.navText, activeTab === 'foryou' && styles.activeNavText]}>For You</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.inboxButton} onPress={() => router.push('/inbox')}>
          <MessageCircle color="#fff" size={28} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : videos.length > 0 ? (
        <FeedList data={videos} onEndReached={fetchMore} loadingMore={loadingMore} />
      ) : (
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            {activeTab === 'following' ? "Follow some users to see their videos!" : "No videos in feed yet. Upload one!"}
          </Text>
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
  topNav: {
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    paddingHorizontal: 16,
  },
  navTabs: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inboxButton: {
    position: 'absolute',
    right: 16,
  },
  navText: {
    color: colors.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
  activeNavText: {
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  navDivider: {
    width: 1,
    height: 14,
    backgroundColor: colors.secondary,
    marginHorizontal: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: colors.primary,
    fontSize: 16,
  }
});

