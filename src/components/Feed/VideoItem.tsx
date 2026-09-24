import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableWithoutFeedback, TouchableOpacity, Share, Animated, Image, FlatList, Alert } from 'react-native';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { Heart, MessageCircle, Share2, Bookmark, AlertTriangle, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import VideoPlayer from './VideoPlayer';
import CommentsSheet from './CommentsSheet';
import { colors, typography, spacing, radius } from '../../theme';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const { width: WINDOW_WIDTH } = Dimensions.get('window');

interface VideoData {
  _id: string;
  videoUrl?: string; // Used for image URL too when mediaType === 'image'
  mediaType?: 'image' | 'video';
  media?: { url: string; type: 'video' | 'image' }[];
  caption: string;
  userId?: {
    username: string;
  };
  user?: {
    username: string;
  };
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
}

interface VideoItemProps {
  item: VideoData;
  isActive: boolean;
  height?: number;
}

export default function VideoItem({ item, isActive, height }: VideoItemProps) {
  const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);
  const effectiveHeight = height || measuredHeight || undefined;
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(item.isLiked || false);
  const [likesCount, setLikesCount] = useState(item.likesCount);
  const [isSaved, setIsSaved] = useState(item.isSaved || false);
  const [commentsCount, setCommentsCount] = useState(item.commentsCount);
  const [showComments, setShowComments] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [showHeart, setShowHeart] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [heartScale] = useState(() => new Animated.Value(0));

  const handleVideoTap = () => {
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (now - lastTap < DOUBLE_PRESS_DELAY) {
      handleDoubleTap();
    } else {
      setLastTap(now);
    }
  };

  const handleDoubleTap = () => {
    if (!isLiked) {
      handleLike();
    }
    setShowHeart(true);
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true, friction: 3 }),
      Animated.timing(heartScale, { toValue: 0, duration: 200, delay: 400, useNativeDriver: true })
    ]).start(() => setShowHeart(false));
  };

  const handleLike = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikesCount(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1));

    try {
      if (newIsLiked) {
        await api.post(`/videos/${item._id}/like`);
      } else {
        await api.delete(`/videos/${item._id}/like`);
      }
    } catch (error) {
      console.error('Like error:', error);
      setIsLiked(!newIsLiked);
      setLikesCount(prev => !newIsLiked ? prev + 1 : Math.max(0, prev - 1));
    }
  };

  const handleSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newIsSaved = !isSaved;
    setIsSaved(newIsSaved);

    try {
      if (newIsSaved) {
        await api.post(`/videos/${item._id}/save`);
      } else {
        await api.delete(`/videos/${item._id}/save`);
      }
    } catch (error) {
      console.error('Save error:', error);
      setIsSaved(!newIsSaved);
    }
  };

  const handleReport = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    // Ideally this would show an ActionSheet or Alert to confirm/select reason
    // For now, we will fire the report directly to meet UGC requirements
    try {
      await api.post('/users/report', {
        targetId: item._id,
        targetType: 'video',
        reason: 'Inappropriate content (User Reported)'
      });
      alert('Content reported. Our team will review this shortly.');
    } catch {
      alert('Failed to report content. Please try again later.');
    }
  };

  const currentUser = useAuthStore(state => state.user);
  const isOwner = currentUser?._id && (
    (item.userId as any)?._id === currentUser._id || 
    (item.user as any)?._id === currentUser._id || 
    (item.userId as any)?.username === currentUser.username ||
    (item.user as any)?.username === currentUser.username
  );

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Delete Video',
      'Are you sure you want to delete this video? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await api.delete(`/videos/${item._id}`);
              if (res.data.success) {
                Alert.alert('Deleted', 'Your video was deleted successfully.');
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/(tabs)/profile');
                }
              }
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.error?.message || 'Failed to delete video');
            }
          }
        }
      ]
    );
  };

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const shareUrl = Linking.createURL(`video/${item._id}`);
      await Share.share({
        message: `Check out this video on NEXORA: ${item.caption}\n${shareUrl}`,
        url: shareUrl, // iOS only
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderCaption = (text: string) => {
    if (!text) return null;
    // Split by hashtag or mention
    const parts = text.split(/([#@]\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        const tag = part.substring(1).toLowerCase();
        return (
          <Text 
            key={index} 
            style={styles.hashtag} 
            onPress={() => router.push(`/hashtag/${tag}` as any)}
          >
            {part}
          </Text>
        );
      } else if (part.startsWith('@')) {
        const username = part.substring(1);
        return (
          <Text 
            key={index} 
            style={styles.mention} 
            onPress={() => router.push(`/user/${username}` as any)}
          >
            {part}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  const hasMediaArray = item.media && item.media.length > 0;
  const mediaItems = hasMediaArray ? item.media! : [{ url: item.videoUrl!, type: item.mediaType || 'video' }];

  const renderMediaItem = ({ item: m, index }: { item: any, index: number }) => (
    <TouchableWithoutFeedback onPress={handleVideoTap}>
      <View style={[styles.carouselItem, effectiveHeight ? { height: effectiveHeight } : { flex: 1 }]}>
        {m.type === 'image' ? (
          <Image source={{ uri: m.url }} style={styles.videoPlayerImage} resizeMode="cover" />
        ) : (
          <VideoPlayer url={m.url} isActive={isActive && currentMediaIndex === index} />
        )}
      </View>
    </TouchableWithoutFeedback>
  );

  return (
    <View 
      style={[styles.container, effectiveHeight ? { height: effectiveHeight } : { flex: 1 }]}
      onLayout={(e) => {
        if (!height) {
          setMeasuredHeight(e.nativeEvent.layout.height);
        }
      }}
    >
      <View style={styles.videoContainer}>
        {mediaItems.length > 1 ? (
          <FlatList
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            data={mediaItems}
            keyExtractor={(_, idx) => `${item._id}-${idx}`}
            renderItem={renderMediaItem}
            onMomentumScrollEnd={(e: any) => {
              const newIndex = Math.round(e.nativeEvent.contentOffset.x / WINDOW_WIDTH);
              setCurrentMediaIndex(newIndex);
            }}
          />
        ) : (
          renderMediaItem({ item: mediaItems[0], index: 0 })
        )}
        
        {showHeart && (
          <Animated.View style={[styles.giantHeartContainer, { transform: [{ scale: heartScale }] }]}>
            <Heart color={colors.error} fill={colors.error} size={100} />
          </Animated.View>
        )}
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity onPress={() => router.push(`/user/${item.userId?.username || item.user?.username}`)}>
          <Text style={styles.username}>@{item.userId?.username || item.user?.username}</Text>
        </TouchableOpacity>
        <Text style={styles.caption}>{renderCaption(item.caption)}</Text>
      </View>

      {mediaItems.length > 1 && (
        <View style={styles.paginationContainer}>
          {mediaItems.map((_, idx) => (
            <View 
              key={idx} 
              style={[
                styles.paginationDot, 
                idx === currentMediaIndex ? styles.paginationDotActive : styles.paginationDotInactive
              ]} 
            />
          ))}
        </View>
      )}

      <View style={styles.rightSection}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Heart 
            color={isLiked ? colors.error : colors.primary} 
            fill={isLiked ? colors.error : 'transparent'} 
            size={32} 
          />
          <Text style={styles.actionText}>{likesCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => setShowComments(true)}>
          <MessageCircle color={colors.primary} size={32} />
          <Text style={styles.actionText}>{commentsCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
          <Bookmark 
            color={colors.accentLight} 
            fill={isSaved ? colors.accentLight : 'transparent'} 
            size={32} 
          />
          <Text style={styles.actionText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Share2 color={colors.primary} size={32} />
          <Text style={styles.actionText}>{item.sharesCount}</Text>
        </TouchableOpacity>
        {isOwner ? (
          <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
            <Trash2 color={colors.error} size={26} />
            <Text style={[styles.actionText, { color: colors.error }]}>Delete</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.actionButton} onPress={handleReport}>
            <AlertTriangle color={colors.secondary} size={24} />
            <Text style={styles.actionText}>Report</Text>
          </TouchableOpacity>
        )}
      </View>

      <CommentsSheet 
        videoId={item._id} 
        visible={showComments} 
        onClose={() => setShowComments(false)} 
        onCommentsCountChange={setCommentsCount}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: WINDOW_WIDTH,
    backgroundColor: colors.background,
  },
  videoContainer: {
    ...StyleSheet.absoluteFill as any,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselItem: {
    width: WINDOW_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayerImage: {
    width: '100%',
    height: '100%',
  },
  giantHeartContainer: {
    position: 'absolute',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  bottomSection: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.md,
    right: 70, // leave space for right section
    backgroundColor: 'rgba(18, 10, 33, 0.65)',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  username: {
    color: colors.primary,
    fontSize: typography.size.md,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  caption: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: typography.size.sm,
    lineHeight: 20,
  },
  hashtag: {
    color: colors.accentLight,
    fontWeight: 'bold',
  },
  mention: {
    color: colors.neonBlue,
    fontWeight: 'bold',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: spacing.lg,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
    paddingRight: 80, // avoid right section
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  paginationDotActive: {
    backgroundColor: colors.primary,
    width: 16, // elongated dot for active
    height: 6,
    borderRadius: 3,
  },
  paginationDotInactive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  rightSection: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.sm,
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: 'rgba(18, 10, 33, 0.4)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    color: colors.primary,
    fontSize: typography.size.xs,
    marginTop: 4,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
