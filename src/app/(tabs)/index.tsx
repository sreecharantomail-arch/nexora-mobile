import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Platform, StatusBar as RNStatusBar, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { colors } from '../../theme';
import FeedList from '../../components/Feed/FeedList';
import { api } from '../../services/api';

export default function HomeScreen() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'foryou' | 'following'>('foryou');

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'following' ? '/videos/feed/following' : '/videos/feed';
      const res = await api.get(endpoint);
      if (res.data.success) {
        setVideos(res.data.data.videos);
      }
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
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
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => setActiveTab('following')}>
          <Text style={[styles.navText, activeTab === 'following' && styles.activeNavText]}>Following</Text>
        </TouchableOpacity>
        <View style={styles.navDivider} />
        <TouchableOpacity onPress={() => setActiveTab('foryou')}>
          <Text style={[styles.navText, activeTab === 'foryou' && styles.activeNavText]}>For You</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : videos.length > 0 ? (
        <FeedList data={videos} />
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
    // Avoid top notch overlapping the feed if not using safe area
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  topNav: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) + 20 : 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
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

