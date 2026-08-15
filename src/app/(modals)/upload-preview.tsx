import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useAuthStore } from '../../store/authStore';
import { BASE_URL } from '../../services/api';
import { colors, typography, spacing, radius } from '../../theme';
import { ArrowLeft } from 'lucide-react-native';

export default function UploadPreviewScreen() {
  const { mediaItems: mediaItemsStr, uri, duration, type } = useLocalSearchParams<{ mediaItems?: string, uri?: string, duration?: string, type?: string }>();
  const router = useRouter();
  
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Fallback for legacy single selection
  const mediaItems = mediaItemsStr ? JSON.parse(mediaItemsStr) : (uri ? [{ uri, duration: duration ? Number(duration) : 0, type }] : []);
  const firstMedia = mediaItems[0];

  const player = useVideoPlayer(firstMedia?.uri || '', player => {
    player.loop = true;
    player.play();
  });

  const handlePublish = async (target: 'feed' | 'story', audience: 'PUBLIC' | 'CLOSE_FRIENDS' = 'PUBLIC') => {
    if (mediaItems.length === 0) return;
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      const endpoint = target === 'feed' ? '/videos' : '/stories';
      const formDataField = target === 'feed' ? 'media' : 'media'; // upload.array('media') and upload.single('media')

      for (let i = 0; i < mediaItems.length; i++) {
        const item = mediaItems[i];
        
        // In modern React Native (0.74+) and Web, fetch() supports Blob uploads universally
        const uriToFetch = Platform.OS === 'android' ? String(item.uri) : String(item.uri).replace('file://', '');
        const localResponse = await fetch(uriToFetch);
        const blob = await localResponse.blob();
        
        const fileName = item.type === 'image' ? `upload_${i}.jpg` : `upload_${i}.mp4`;
        const fileType = item.type === 'image' ? 'image/jpeg' : 'video/mp4';
        
        // Append as a standard Blob (fetch backend compliant)
        formData.append(formDataField, blob, fileName);
        
        if (item.duration) formData.append('duration', String(item.duration));
      }
      
      formData.append('caption', String(caption).trim());
      formData.append('audience', String(audience));

      const token = useAuthStore.getState().accessToken;
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });
      
      const responseData = await res.json();

      if (responseData.success) {
        Alert.alert('Success', 'Your post has been published!', [
          {
            text: 'OK',
            onPress: () => {
              router.dismissAll();
              router.replace('/(tabs)');
            }
          }
        ]);
      } else {
        Alert.alert('Upload Failed', responseData.error?.message || 'Something went wrong.');
      }
    } catch (error: any) {
      console.error('Upload Error:', error);
      Alert.alert('Upload Failed', error.response?.data?.error?.message || 'Failed to upload video.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} disabled={isUploading}>
          <ArrowLeft color={colors.primary} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Post</Text>
        <View style={styles.backButtonPlaceholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.previewContainer}>
          {firstMedia ? (
            firstMedia.type === 'image' ? (
              <Image source={{ uri: firstMedia.uri }} style={styles.video} resizeMode="cover" />
            ) : (
              <VideoView
                style={styles.video}
                player={player}
                allowsPictureInPicture={false}
                contentFit="cover"
              />
            )
          ) : (
            <Text style={{ color: colors.primary }}>No media selected</Text>
          )}
          {mediaItems.length > 1 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>+{mediaItems.length - 1}</Text>
            </View>
          )}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Write a caption..."
          placeholderTextColor="#8E7EB1"
          multiline
          maxLength={150}
          value={caption}
          onChangeText={setCaption}
          editable={!isUploading}
        />
        <Text style={styles.charCount}>{caption.length}/150</Text>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.publishButton, styles.feedButton, isUploading && styles.publishButtonDisabled]} 
            onPress={() => handlePublish('feed')}
            disabled={isUploading}
          >
            {isUploading ? <ActivityIndicator color={colors.background} /> : <Text style={styles.publishButtonText}>Feed</Text>}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.publishButton, styles.storyButton, isUploading && styles.publishButtonDisabled]} 
            onPress={() => handlePublish('story')}
            disabled={isUploading}
          >
            {isUploading ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.storyButtonText}>Story</Text>}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.publishButton, styles.closeFriendsButton, isUploading && styles.publishButtonDisabled]} 
            onPress={() => handlePublish('story', 'CLOSE_FRIENDS')}
            disabled={isUploading}
          >
            {isUploading ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.closeFriendsText}>Close Friends</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  backButtonPlaceholder: {
    width: 32,
  },
  headerTitle: {
    fontSize: typography.size.lg,
    fontWeight: 'bold',
    color: colors.primary,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  previewContainer: {
    width: 120,
    height: 160,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    alignSelf: 'center',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  input: {
    backgroundColor: colors.inputBg,
    color: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: typography.size.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  charCount: {
    color: colors.secondary,
    alignSelf: 'flex-end',
    marginTop: spacing.xs,
    fontSize: typography.size.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: 'auto',
    marginBottom: spacing.xxl,
  },
  publishButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  feedButton: {
    backgroundColor: colors.accent,
  },
  storyButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeFriendsButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#1DB954',
  },
  publishButtonDisabled: {
    opacity: 0.7,
  },
  publishButtonText: {
    color: colors.primary,
    fontSize: typography.size.md,
    fontWeight: 'bold',
  },
  storyButtonText: {
    color: colors.primary,
    fontSize: typography.size.md,
    fontWeight: 'bold',
  },
  closeFriendsText: {
    color: '#1DB954',
    fontSize: typography.size.md,
    fontWeight: 'bold',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  }
});
