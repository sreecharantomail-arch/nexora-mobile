import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { X, Send } from 'lucide-react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { api } from '../../services/api';

interface CommentsSheetProps {
  videoId: string;
  visible: boolean;
  onClose: () => void;
  onCommentsCountChange: (newCount: number) => void;
}

export default function CommentsSheet({ videoId, visible, onClose, onCommentsCountChange }: CommentsSheetProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/videos/${videoId}/comments`);
      if (res.data.success) {
        setComments(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, videoId]);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const res = await api.post(`/videos/${videoId}/comments`, { text: newComment.trim() });
      if (res.data.success) {
        setComments(prev => [res.data.data, ...prev]);
        setNewComment('');
        onCommentsCountChange(comments.length + 1);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView 
        style={styles.modalContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        
        <View style={styles.sheetContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{comments.length} comments</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X color={colors.primary} size={24} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.accent} />
            </View>
          ) : (
            <FlatList
              data={comments}
              keyExtractor={item => item._id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <Text style={styles.commentUsername}>@{item.userId?.username}</Text>
                  <Text style={styles.commentText}>{item.text}</Text>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Be the first to comment!</Text>
              }
            />
          )}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Add comment..."
              placeholderTextColor="#999"
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]} 
              onPress={handlePostComment}
              disabled={!newComment.trim() || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Send color={colors.primary} size={20} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill as any,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheetContent: {
    backgroundColor: '#222',
    height: '60%',
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    color: colors.primary,
    fontSize: typography.size.md,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    right: spacing.md,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.md,
  },
  commentItem: {
    marginBottom: spacing.md,
  },
  commentUsername: {
    color: '#aaa',
    fontSize: typography.size.sm,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  commentText: {
    color: colors.primary,
    fontSize: typography.size.md,
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#222',
  },
  input: {
    flex: 1,
    backgroundColor: '#333',
    color: colors.primary,
    borderRadius: radius.round,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: spacing.sm,
    backgroundColor: colors.accent,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#555',
  }
});
