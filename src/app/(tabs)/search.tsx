import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Search as SearchIcon } from 'lucide-react-native';
import { api } from '../../services/api';
import { colors } from '../../theme';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
      
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          renderItem={renderUser}
          ListEmptyComponent={
            query.trim() !== '' ? (
              <Text style={styles.emptyText}>No users found</Text>
            ) : (
              <Text style={styles.emptyText}>Search for users to see their profile</Text>
            )
          }
        />
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
  }
});
