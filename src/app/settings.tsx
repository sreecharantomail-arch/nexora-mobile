import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Shield, FileText, Info, LogOut, Users } from 'lucide-react-native';
import { colors, typography, spacing, radius } from '../theme';
import { useAuthStore } from '../store/authStore';
import * as Haptics from 'expo-haptics';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout }
    ]);
  };

  const handlePress = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={colors.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings & Privacy</Text>
        <View style={styles.backPlaceholder} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => handlePress('/settings/close-friends')}>
            <View style={styles.rowLeft}>
              <Users color="#1DB954" size={20} />
              <Text style={styles.rowText}>Close Friends</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.row} onPress={() => handlePress('/settings/privacy')}>
            <View style={styles.rowLeft}>
              <Shield color={colors.secondary} size={20} />
              <Text style={styles.rowText}>Privacy Policy</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.row} onPress={() => handlePress('/settings/terms')}>
            <View style={styles.rowLeft}>
              <FileText color={colors.secondary} size={20} />
              <Text style={styles.rowText}>Terms of Service</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />

          <TouchableOpacity style={styles.row} onPress={() => handlePress('/settings/community')}>
            <View style={styles.rowLeft}>
              <Info color={colors.secondary} size={20} />
              <Text style={styles.rowText}>Community Guidelines</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut color={colors.error} size={20} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        
        <Text style={styles.version}>NEXORA v1.0.0 (Play Store Release)</Text>
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backButton: {
    padding: 4,
  },
  backPlaceholder: {
    width: 32,
  },
  headerTitle: {
    color: colors.primary,
    fontSize: typography.size.lg,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  sectionTitle: {
    color: colors.secondary,
    fontSize: typography.size.sm,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    marginTop: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: {
    color: colors.primary,
    fontSize: typography.size.md,
    marginLeft: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.xl + spacing.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 42, 84, 0.1)',
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 42, 84, 0.3)',
  },
  logoutText: {
    color: colors.error,
    fontWeight: 'bold',
    fontSize: typography.size.md,
    marginLeft: spacing.sm,
  },
  version: {
    color: colors.secondary,
    textAlign: 'center',
    marginTop: spacing.xl,
    fontSize: typography.size.xs,
  }
});
