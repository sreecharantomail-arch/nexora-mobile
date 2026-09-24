import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Send } from 'lucide-react-native';
import { api } from '../../services/api';
import { initSocket } from '../../services/socket';
import { colors, typography, spacing, radius } from '../../theme';
import { useAuthStore } from '../../store/authStore';

export default function ChatScreen() {
  const { conversationId, otherUserId, otherUsername } = useLocalSearchParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const router = useRouter();
  const currentUser = useAuthStore(state => state.user);
  
  const socketRef = useRef<any>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    let activeSocket: any = null;

    const handleReceiveMessage = (newMessage: any) => {
      setMessages(prev => [newMessage, ...prev]);
    };

    const handleTypingStart = (data: any) => {
      if (data.userId === otherUserId) setIsTyping(true);
    };

    const handleTypingEnd = (data: any) => {
      if (data.userId === otherUserId) setIsTyping(false);
    };

    const setupChat = async () => {
      try {
        // Fetch historical messages
        const res = await api.get(`/chat/messages/${conversationId}`);
        if (res.data.success) {
          setMessages(res.data.data.reverse()); // Reverse for inverted FlatList
        }

        // Initialize Socket
        const socket = await initSocket();
        socketRef.current = socket;
        activeSocket = socket;

        if (socket) {
          socket.emit('join_chat', conversationId);
          socket.on('receive_message', handleReceiveMessage);
          socket.on('receive_typing_start', handleTypingStart);
          socket.on('receive_typing_end', handleTypingEnd);
        }
      } catch (error) {
        console.error('Error setting up chat:', error);
      } finally {
        setLoading(false);
      }
    };

    setupChat();

    return () => {
      if (activeSocket) {
        activeSocket.emit('leave_chat', conversationId);
        activeSocket.off('receive_message', handleReceiveMessage);
        activeSocket.off('receive_typing_start', handleTypingStart);
        activeSocket.off('receive_typing_end', handleTypingEnd);
      }
    };
  }, [conversationId, otherUserId]);

  const handleSend = () => {
    if (!inputText.trim() || !socketRef.current) return;

    socketRef.current.emit('send_message', {
      conversationId,
      text: inputText.trim()
    });
    
    // Stop typing indicator instantly
    socketRef.current.emit('typing_end', conversationId);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    setInputText('');
  };

  const handleTextChange = (text: string) => {
    setInputText(text);

    if (socketRef.current) {
      socketRef.current.emit('typing_start', conversationId);
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit('typing_end', conversationId);
      }, 2000);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.senderId._id === currentUser?._id;
    return (
      <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft color={colors.primary} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>@{otherUsername}</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={colors.accent} /></View>
      ) : (
        <KeyboardAvoidingView 
          style={styles.chatContainer} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            inverted
            keyExtractor={item => item._id || Math.random().toString()}
            renderItem={renderMessage}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
          />
          
          {isTyping && (
            <View style={styles.typingIndicator}>
              <Text style={styles.typingText}>{otherUsername} is typing...</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Message..."
              placeholderTextColor="#888"
              value={inputText}
              onChangeText={handleTextChange}
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendBtn, !inputText.trim() && { opacity: 0.5 }]} 
              onPress={handleSend}
              disabled={!inputText.trim()}
            >
              <Send color={colors.accent} size={24} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  chatContainer: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: spacing.xs },
  headerTitle: { color: colors.primary, fontSize: typography.size.md, fontWeight: 'bold' },
  messageList: { paddingHorizontal: spacing.md, paddingVertical: spacing.lg },
  messageBubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: radius.md,
    marginVertical: spacing.xs,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.accent,
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#333',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: colors.primary,
    fontSize: typography.size.md,
  },
  typingIndicator: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
  },
  typingText: {
    color: colors.secondary,
    fontSize: typography.size.sm,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    color: colors.primary,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingTop: 12,
    paddingBottom: 12,
    maxHeight: 100,
    fontSize: typography.size.md,
  },
  sendBtn: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
