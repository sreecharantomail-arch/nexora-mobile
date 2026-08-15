import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { ChevronLeft } from 'lucide-react-native';
import { api } from '../services/api';
import { colors, typography, spacing } from '../theme';
import { useAuthStore } from '../store/authStore';

export default function InboxScreen() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const currentUser = useAuthStore(state => state.user);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/chat');
      if (res.data.success) {
        setConversations(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    // Find the other participant
    const otherUser = item.participants.find((p: any) => p._id !== currentUser?._id);
    if (!otherUser) return null;

    return (
      <TouchableOpacity 
        style={styles.chatRow}
        onPress={() => router.push(`/chat/${item._id}?otherUserId=${otherUser._id}&otherUsername=${otherUser.username}` as any)}
      >
        <Image 
          source={{ uri: otherUser.profileImage || 'https://via.placeholder.com/150' }} 
          style={styles.avatar} 
        />
        <View style={styles.chatInfo}>
          <Text style={styles.username}>{otherUser.displayName || otherUser.username}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage ? item.lastMessage.text : 'No messages yet...'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft color={colors.primary} size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Direct Messages</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No messages yet.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: spacing.xs,
  },
  headerTitle: {
    color: colors.primary,
    fontSize: typography.size.lg,
    fontWeight: 'bold',
  },
  chatRow: {
    flexDirection: 'row',
    padding: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333',
  },
  chatInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  username: {
    color: colors.primary,
    fontSize: typography.size.md,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  lastMessage: {
    color: colors.secondary,
    fontSize: typography.size.sm,
  },
  emptyText: {
    color: colors.secondary,
    fontSize: typography.size.md,
    marginTop: 50,
  }
});
