import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { colors, typography, spacing } from '../../theme';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={colors.primary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.backPlaceholder} />
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>1. Overview</Text>
        <Text style={styles.text}>
          NEXORA (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and platform services.
        </Text>

        <Text style={styles.sectionTitle}>2. Information Collection</Text>
        <Text style={styles.text}>
          • Account Data: Username, display name, email address, password hash, and profile image.{"\n"}
          • User-Generated Content: Videos, images, comments, captions, stories, and direct messages.{"\n"}
          • Usage & Device Data: App interactions, IP address, socket connections, and device identifiers.
        </Text>

        <Text style={styles.sectionTitle}>3. Account Deletion & Data Rights</Text>
        <Text style={styles.text}>
          You have the right to request deletion of your account and associated personal data at any time through Settings or by contacting support at support@nexora.app.
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
