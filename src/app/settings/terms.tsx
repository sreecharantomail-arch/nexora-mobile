import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { colors, typography, spacing } from '../../theme';

export default function TermsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={colors.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.backPlaceholder} />
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.text}>
          By creating an account or accessing the NEXORA mobile application, you agree to comply with these Terms of Service. If you do not agree to these terms, do not use the application.
        </Text>

        <Text style={styles.sectionTitle}>2. User Content & Ownership</Text>
        <Text style={styles.text}>
          You retain full ownership of all videos, images, and text content you upload to NEXORA. By uploading content, you grant NEXORA a non-exclusive license to host, display, and stream your media to authorized viewers.
        </Text>

        <Text style={styles.sectionTitle}>3. Prohibited Conduct & Termination</Text>
        <Text style={styles.text}>
          Harassment, hate speech, illegal activities, copyright infringement, and automated spamming are strictly prohibited. NEXORA reserves the right to suspend or terminate accounts violating these terms.
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
