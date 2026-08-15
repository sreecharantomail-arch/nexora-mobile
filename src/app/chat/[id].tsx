import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Send } from 'lucide-react-native';
import { api } from '../../services/api';
import { initSocket, getSocket } from '../../services/socket';
import { colors, typography, spacing, radius } from '../../theme';
import { useAuthStore } from '../../store/authStore';

export default function ChatScreen() {
  const { id: conversationId, otherUserId, otherUsername } = useLocalSearchParams<{ id: string, otherUserId: string, otherUsername: string }>();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const router = useRouter();
  const { user } = useAuthStore();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const setupChat = async () => {
      // Fetch existing messages
      try {
        const res = await api.get(`/chat/messages/${conversationId}`);
        if (res.data.success) {
          setMessages(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }

      // Initialize socket
      const socket = await initSocket();
      if (socket) {
        socket.emit('join_chat', conversationId);

        const handleReceiveMessage = (newMessage: any) => {
          setMessages(prev => [...prev, newMessage]);
        };

        socket.on('receive_message', handleReceiveMessage);

        return () => {
          socket.off('receive_message', handleReceiveMessage);
          socket.emit('leave_chat', conversationId);
        };
      }
    };

    setupChat();
  }, [conversationId]);

  const handleSend = () => {
    if (inputText.trim() === '') return;
    
    const socket = getSocket();
    if (socket) {
      socket.emit('send_message', {
        conversationId,
        text: inputText.trim()
      });
      setInputText('');
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.senderId?._id === user?._id || item.senderId === user?._id;
    return (
      <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
        <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color={colors.primary} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{otherUsername || 'Chat'}</Text>
        <View style={{ width: 28 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Message..."
          placeholderTextColor={colors.secondary}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Send color={inputText.trim() ? colors.accent : colors.secondary} size={24} />
        </TouchableOpacity>
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
  headerTitle: {
    fontSize: typography.size.lg,
    fontWeight: 'bold',
    color: colors.primary,
  },
  messagesContainer: {
    padding: spacing.md,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: 20,
    marginBottom: spacing.sm,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.accent,
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: typography.size.md,
  },
  myMessageText: {
    color: '#000',
  },
  theirMessageText: {
    color: colors.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    color: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    maxHeight: 100,
    minHeight: 40,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    padding: spacing.sm,
    marginLeft: spacing.xs,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
