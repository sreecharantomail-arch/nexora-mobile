import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Search as SearchIcon, Heart } from 'lucide-react-native';
import { api } from '../../services/api';
import { colors } from '../../theme';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [explorePosts, setExplorePosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exploreLoading, setExploreLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchExplorePosts = async () => {
      setExploreLoading(true);
      try {
        const res = await api.get('/videos/explore');
        if (res.data.success) {
          setExplorePosts(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching explore posts:', error);
      } finally {
        setExploreLoading(false);
      }
    };

    fetchExplorePosts();
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      if (query.trim() === '') {
        setUsers([]);
        return;
      }
      setLoading(true);
      try {
        const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
        if (res.data.success) {
          setUsers(res.data.data);
        }
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      searchUsers();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const renderUser = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.userRow} 
      onPress={() => router.push(`/user/${item.username}`)}
    >
      {item.profileImage ? (
        <Image source={{ uri: item.profileImage }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.placeholderAvatar]} />
      )}
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.username}</Text>
        {item.displayName && <Text style={styles.displayName}>{item.displayName}</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <SearchIcon color={colors.secondary} size={20} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          placeholderTextColor={colors.secondary}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
        />
      </View>
      
      {query.trim() !== '' ? (
        loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            key="users-list"
            data={users}
            keyExtractor={(item) => item._id}
            renderItem={renderUser}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No users found</Text>
            }
          />
        )
      ) : (
        exploreLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            key="explore-list"
            data={explorePosts}
            keyExtractor={(item) => item._id}
            numColumns={3}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.gridItem}
                onPress={() => router.push(`/video/${item._id}`)}
              >
                <Image source={{ uri: item.thumbnailUrl }} style={styles.gridImage} />
                <View style={styles.gridOverlay}>
                  <Heart color={colors.primary} fill={colors.primary} size={12} />
                  <Text style={styles.gridStatsText}>{item.likesCount || 0}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: colors.text,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  placeholderAvatar: {
    backgroundColor: colors.border,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  displayName: {
    color: colors.secondary,
    fontSize: 14,
    marginTop: 2,
  },
  emptyText: {
    color: colors.secondary,
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  gridItem: {
    flex: 1,
    aspectRatio: 1,
    margin: 1,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  gridStatsText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: 'bold',
  }
});
