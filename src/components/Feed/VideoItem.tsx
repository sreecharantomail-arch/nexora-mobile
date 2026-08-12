import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableWithoutFeedback, TouchableOpacity, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, MessageCircle, Share2, Bookmark, AlertTriangle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import VideoPlayer from './VideoPlayer';
import CommentsSheet from './CommentsSheet';
import { colors, typography, spacing } from '../../theme';
import { api } from '../../services/api';

const { height: WINDOW_HEIGHT, width: WINDOW_WIDTH } = Dimensions.get('window');

interface VideoData {
  _id: string;
  videoUrl: string;
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
}

export default function VideoItem({ item, isActive }: VideoItemProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(item.isLiked || false);
  const [likesCount, setLikesCount] = useState(item.likesCount);
  const [isSaved, setIsSaved] = useState(item.isSaved || false);
  const [commentsCount, setCommentsCount] = useState(item.commentsCount);
  const [showComments, setShowComments] = useState(false);

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

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await Share.share({
        message: `Check out this video on NEXORA: ${item.caption}`,
        url: item.videoUrl, // iOS only, but good to have
      });
      // Optionally notify backend about share to increment counter
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback>
        <View style={styles.videoContainer}>
          <VideoPlayer url={item.videoUrl} isActive={isActive} />
        </View>
      </TouchableWithoutFeedback>

      <LinearGradient
        colors={['transparent', 'rgba(4, 0, 12, 0.8)']}
        style={styles.bottomSection}
      >
        <TouchableOpacity onPress={() => router.push(`/user/${item.userId?.username || item.user?.username}`)}>
          <Text style={styles.username}>@{item.userId?.username || item.user?.username}</Text>
        </TouchableOpacity>
        <Text style={styles.caption}>{item.caption}</Text>
      </LinearGradient>

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
        <TouchableOpacity style={styles.actionButton} onPress={handleReport}>
          <AlertTriangle color={colors.secondary} size={24} />
          <Text style={styles.actionText}>Report</Text>
        </TouchableOpacity>
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
    height: WINDOW_HEIGHT - 49, // roughly subtract bottom tab bar height (depends on safe area, can be tuned)
    backgroundColor: colors.background,
  },
  videoContainer: {
    ...StyleSheet.absoluteFill as any,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0, 
    paddingTop: 40,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingRight: 80, // leave space for right section
  },
  username: {
    color: colors.primary,
    fontSize: typography.size.md,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  caption: {
    color: colors.primary,
    fontSize: typography.size.sm,
  },
  rightSection: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.sm,
    alignItems: 'center',
    gap: spacing.lg,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    color: colors.primary,
    fontSize: typography.size.xs,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
});
