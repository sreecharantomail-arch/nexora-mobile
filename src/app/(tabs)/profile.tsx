import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Settings } from 'lucide-react-native';
import { colors, typography, spacing, radius } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import * as Haptics from 'expo-haptics';

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const router = useRouter();

  const handleSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/settings');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerPlaceholder} />
        <Text style={styles.headerTitle}>@{user?.username}</Text>
        <TouchableOpacity onPress={handleSettings} style={styles.settingsButton}>
          <Settings color={colors.primary} size={24} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.profileInfo}>
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: user?.profileImage || 'https://via.placeholder.com/150' }} 
            style={styles.avatar} 
          />
        </View>
        <Text style={styles.displayName}>{user?.displayName}</Text>
        <Text style={styles.bio}>{user?.bio || 'Welcome to my NEXORA profile!'}</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{user?.followingCount || 0}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{user?.followersCount || 0}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  headerPlaceholder: {
    width: 32,
  },
  headerTitle: {
    color: colors.primary,
    fontSize: typography.size.lg,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 4,
  },
  profileInfo: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  avatarContainer: {
    padding: 4,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: colors.accentLight,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
  },
  displayName: {
    color: colors.primary,
    fontSize: typography.size.xl,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  bio: {
    color: colors.secondary,
    fontSize: typography.size.sm,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stat: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  statNumber: {
    color: colors.primary,
    fontSize: typography.size.lg,
    fontWeight: 'bold',
  },
  statLabel: {
    color: colors.secondary,
    fontSize: typography.size.xs,
    marginTop: spacing.xs,
  },
  editButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.accentLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.full,
    width: '100%',
    alignItems: 'center',
  },
  editButtonText: {
    color: colors.accentLight,
    fontWeight: 'bold',
    fontSize: typography.size.md,
  },
});
