import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { api } from '../../services/api';
import { colors, typography, spacing, radius } from '../../theme';

export default function CloseFriendsScreen() {
  const router = useRouter();

  const [users, setUsers] = useState<any[]>([]); // This should ideally be all users you follow
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActualCloseFriends = async () => {
      try {
        const res = await api.get('/users/me/close-friends');
        if (res.data.success) {
          setUsers(res.data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchActualCloseFriends();
  }, []);

  const removeFriend = async (id: string) => {
    try {
      setUsers(users.filter(u => u._id !== id));
      await api.delete(`/users/${id}/close-friends`);
      // Update local user state if needed
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={colors.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Close Friends</Text>
        <View style={styles.backPlaceholder} />
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>We don&apos;t send notifications when you edit your close friends list.</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={<Text style={styles.emptyText}>No close friends yet.</Text>}
          renderItem={({ item }) => (
            <View style={styles.userRow}>
              <View style={styles.userInfo}>
                <Image source={{ uri: item.profileImage || 'https://via.placeholder.com/150' }} style={styles.avatar} />
                <View>
                  <Text style={styles.username}>{item.username}</Text>
                  <Text style={styles.displayName}>{item.displayName}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => removeFriend(item._id)} style={styles.removeButton}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 50, paddingBottom: spacing.md, paddingHorizontal: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface,
  },
  backButton: { padding: 4 },
  backPlaceholder: { width: 32 },
  headerTitle: { color: colors.primary, fontSize: typography.size.lg, fontWeight: 'bold' },
  infoBox: { padding: spacing.md, backgroundColor: 'rgba(29, 185, 84, 0.1)', borderBottomWidth: 1, borderBottomColor: colors.border },
  infoText: { color: '#1DB954', fontSize: typography.size.sm, textAlign: 'center' },
  userRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, marginRight: spacing.md },
  username: { color: colors.primary, fontSize: typography.size.md, fontWeight: 'bold' },
  displayName: { color: colors.secondary, fontSize: typography.size.sm },
  removeButton: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.md, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  removeText: { color: colors.primary, fontSize: typography.size.sm },
  emptyText: { color: colors.secondary, textAlign: 'center', marginTop: spacing.xl },
});
