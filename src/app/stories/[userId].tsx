import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableWithoutFeedback, Image, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { api } from '../../services/api';
import { colors, typography, spacing } from '../../theme';

const { width, height } = Dimensions.get('window');

export default function StoryViewerScreen() {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  
  const [stories, setStories] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchUserStories = async () => {
      try {
        const res = await api.get('/stories/feed');
        if (res.data.success) {
          const userStories = res.data.data.find((group: any) => group.user._id === userId);
          if (userStories) {
            setStories(userStories.stories);
          } else {
            router.back();
          }
        }
      } catch (error) {
        console.error(error);
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchUserStories();
  }, [userId]);

  const currentStory = stories[currentIndex];

  const player = useVideoPlayer(currentStory?.mediaUrl || null, p => {
    p.loop = false;
    if (!isPaused) p.play();
  });

  useEffect(() => {
    if (!currentStory) return;

    if (currentStory.mediaType === 'image') {
      let interval: ReturnType<typeof setInterval>;
      if (!isPaused) {
        interval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 1) {
              handleNext();
              return 0;
            }
            return prev + 0.05; // 5% every 250ms = 5 seconds total
          });
        }, 250);
      }
      return () => clearInterval(interval);
    } else {
      // For video, we'd ideally sync with video time, but expo-video currently requires refs or event listeners.
      // For simplicity in this demo, let's just let the video play and advance on end.
      // A more robust implementation would use player.status.
    }
  }, [currentIndex, isPaused, currentStory]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      router.back();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    } else {
      router.back();
    }
  };

  const handlePress = (e: any) => {
    const x = e.nativeEvent.locationX;
    if (x < width / 3) {
      handlePrev();
    } else {
      handleNext();
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!currentStory) return null;

  return (
    <View style={styles.container}>
      {/* Progress Bars */}
      <View style={styles.progressContainer}>
        {stories.map((story, i) => (
          <View key={story._id} style={styles.progressBarBg}>
            <View 
              style={[
                styles.progressBarFill, 
                { 
                  width: i === currentIndex ? `${progress * 100}%` : (i < currentIndex ? '100%' : '0%') 
                }
              ]} 
            />
          </View>
        ))}
      </View>

      {/* Header Info */}
      <View style={styles.headerInfo}>
        <Image source={{ uri: currentStory.userId.profileImage || 'https://via.placeholder.com/150' }} style={styles.avatar} />
        <Text style={styles.username}>{currentStory.userId.username}</Text>
      </View>

      {/* Media */}
      <TouchableWithoutFeedback 
        onPress={handlePress}
        onPressIn={() => {
          setIsPaused(true);
          if (currentStory.mediaType === 'video') player.pause();
        }}
        onPressOut={() => {
          setIsPaused(false);
          if (currentStory.mediaType === 'video') player.play();
        }}
      >
        <View style={styles.mediaContainer}>
          {currentStory.mediaType === 'image' ? (
            <Image source={{ uri: currentStory.mediaUrl }} style={styles.media} resizeMode="cover" />
          ) : (
            <VideoView style={styles.media} player={player} allowsPictureInPicture={false} contentFit="cover" />
          )}
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  mediaContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  media: {
    width: '100%',
    height: '100%',
  },
  progressContainer: {
    position: 'absolute',
    top: 50, // safe area
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 10,
    zIndex: 10,
    gap: 4,
  },
  progressBarBg: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#fff',
  },
  headerInfo: {
    position: 'absolute',
    top: 65,
    left: 15,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#fff',
  },
  username: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  }
});
