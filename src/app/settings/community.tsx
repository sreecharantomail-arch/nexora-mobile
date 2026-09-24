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
        <Text style={styles.sectionTitle}>1. Respect All Creators & Viewers</Text>
        <Text style={styles.text}>
          Treat every member of the NEXORA community with respect. Harassment, hate speech, bullying, and targeted abuse are strictly prohibited and result in permanent suspension.
        </Text>

        <Text style={styles.sectionTitle}>2. Safety & Authentic Content</Text>
        <Text style={styles.text}>
          Do not post content that depicts violence, dangerous acts, illegal activities, or self-harm. Impersonating other users or spreading deceptive spam is unacceptable.
        </Text>

        <Text style={styles.sectionTitle}>3. Moderation & Enforcement</Text>
        <Text style={styles.text}>
          Our moderation system reviews reported content. Content violating these guidelines will be restricted or removed, and repeat offenders will face account termination.
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
  sectionTitle: { color: colors.primary, fontSize: typography.size.md, fontWeight: 'bold', marginTop: spacing.md, marginBottom: spacing.xs },
  text: { color: colors.secondary, fontSize: typography.size.sm, lineHeight: 22 },
});
