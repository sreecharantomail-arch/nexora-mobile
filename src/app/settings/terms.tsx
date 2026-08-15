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
        <Text style={styles.text}>
          Welcome to NEXORA&apos;s Terms of Service. {"\n\n"}
          1. Acceptance of Terms: By accessing or using our services, you agree to be bound by these terms. {"\n\n"}
          2. User Content: You retain your rights to any content you submit, post or display on or through the services. {"\n\n"}
          3. Prohibited Conduct: You agree not to violate any laws, contract, intellectual property or other third-party right or commit a tort. {"\n\n"}
          (This is a placeholder for the full terms of service.)
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
