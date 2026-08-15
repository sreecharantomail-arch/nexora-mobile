import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { colors, typography, spacing } from '../../theme';

export default function CommunityGuidelinesScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={colors.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community Guidelines</Text>
        <View style={styles.backPlaceholder} />
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.text}>
          Welcome to NEXORA&apos;s Community Guidelines. {"\n\n"}
          1. Respect Everyone: Treat others with respect. Harassment, hate speech, and bullying are strictly prohibited. {"\n\n"}
          2. Keep it Safe: Do not post content that is dangerous, illegal, or promotes self-harm. {"\n\n"}
          3. Be Authentic: Do not impersonate others or spread misinformation. {"\n\n"}
          (This is a placeholder for the full community guidelines.)
        </Text>
      </ScrollView>
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
  content: { flex: 1, padding: spacing.lg },
  text: { color: colors.secondary, fontSize: typography.size.md, lineHeight: 24 },
});
