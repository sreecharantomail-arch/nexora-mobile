import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { colors, typography, spacing, radius } from '../../theme';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function LoginScreen() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    if (!emailOrUsername || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', { emailOrUsername, password });
      if (res.data.success) {
        const { _id, username, displayName, email, profileImage, accessToken, refreshToken } = res.data.data;
        await login({ _id, username, displayName, email, profileImage }, accessToken, refreshToken);
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      Alert.alert('Login Failed', error.response?.data?.error?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NEXORA</Text>
      <Text style={styles.subtitle}>Welcome back</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email or Username"
          placeholderTextColor={colors.secondary}
          value={emailOrUsername}
          onChangeText={setEmailOrUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.secondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={styles.buttonText}>Log In</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Don&apos;t have an account? </Text>
        <Link href="/(auth)/register" asChild>
          <TouchableOpacity>
            <Text style={styles.link}>Sign Up</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.size.xxl,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.size.md,
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  form: {
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.inputBg,
    color: colors.primary,
    padding: spacing.md,
    borderRadius: radius.md,
    fontSize: typography.size.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  button: {
    backgroundColor: colors.accent,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonText: {
    color: colors.primary,
    fontSize: typography.size.md,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    color: colors.secondary,
    fontSize: typography.size.md,
  },
  link: {
    color: colors.accent,
    fontSize: typography.size.md,
    fontWeight: 'bold',
  },
});
