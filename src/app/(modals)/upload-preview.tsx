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

  // Fallback for legacy single selection or camera capture
  const mediaItems = mediaItemsStr ? JSON.parse(mediaItemsStr) : (uri ? [{ 
    uri, 
    duration: duration ? Number(duration) : 0, 
    type: type || (/\.(mp4|mov|quicktime|avi|mkv|webm)$/i.test(uri) ? 'video' : 'image') 
  }] : []);
  const firstMedia = mediaItems[0];

  const isVideo = firstMedia?.type === 'video' || (firstMedia?.uri && /\.(mp4|mov|quicktime|avi|mkv|webm)$/i.test(firstMedia.uri));
  const isImage = !!firstMedia?.uri && !isVideo;

  const player = useVideoPlayer(isVideo ? firstMedia.uri : null, player => {
    player.loop = true;
    player.play();
  });

  const handlePublish = async (target: 'feed' | 'story', audience: 'PUBLIC' | 'CLOSE_FRIENDS' = 'PUBLIC') => {
    if (mediaItems.length === 0) return;
    
    setIsUploading(true);
    try {
      const item = mediaItems[0];
      const endpoint = target === 'feed' ? '/videos' : '/stories';
      const token = useAuthStore.getState().accessToken;

      const fileExt = item.type === 'video' ? 'mp4' : (item.uri.toLowerCase().endsWith('.png') ? 'png' : 'jpg');
      const mimeType = item.type === 'video' ? 'video/mp4' : (fileExt === 'png' ? 'image/png' : 'image/jpeg');

      // Read local media file into a Web-standard Blob using React Native 0.86 native networking
      let rawBlob: Blob;
      try {
        const fileResponse = await fetch(item.uri);
        rawBlob = await fileResponse.blob();
      } catch {
        const decodedUri = decodeURIComponent(item.uri);
        const fileResponse = await fetch(decodedUri);
        rawBlob = await fileResponse.blob();
      }

      // Re-create Blob with explicit MIME type so Multer recognizes video/image MIME
      const typedBlob = new Blob([rawBlob], { type: mimeType });

      // Append Blob to FormData (React Native 0.86 supports Web-standard Blob natively)
      const formData = new FormData();
      formData.append('caption', String(caption).trim());
      formData.append('audience', String(audience));
      formData.append('duration', String(item.duration || 0));
      formData.append('media', typedBlob, `upload.${fileExt}`);

      // Native fetch automatically injects the multipart/form-data boundary when Content-Type header is omitted
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      const responseText = await response.text();
      let responseData: any = {};
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { success: false, error: { message: `Server error (${response.status})` } };
      }

      if (response.ok && responseData.success) {
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
        Alert.alert('Upload Failed', responseData.error?.message || `Upload rejected (${response.status}).`);
      }
    } catch (error: any) {
      console.error('Upload Error:', error);
      
      let errorMessage = 'Failed to upload. Please check your network connection.';
      if (error?.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Upload Failed', errorMessage);
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
          {firstMedia && firstMedia.uri ? (
            isImage ? (
              <Image 
                source={{ uri: firstMedia.uri }} 
                style={styles.video} 
                resizeMode="cover"
              />
            ) : (
              <VideoView
                style={styles.video}
                player={player}
                allowsPictureInPicture={false}
                contentFit="cover"
              />
            )
          ) : (
            <View style={styles.noMediaContainer}>
              <Text style={styles.noMediaText}>No media selected</Text>
            </View>
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
  noMediaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xs,
  },
  noMediaText: {
    color: colors.secondary,
    fontSize: typography.size.xs,
    textAlign: 'center',
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
