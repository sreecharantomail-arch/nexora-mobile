import { useEffect } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../store/authStore';
import { getToken } from '../utils/secureStore';
import { api } from '../services/api';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '../theme';

const queryClient = new QueryClient();

function InitialLayout() {
  const { accessToken, isLoading, login, logout, setLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getToken('accessToken');
        const refreshToken = await getToken('refreshToken');
        
        if (token && refreshToken) {
          try {
            const res = await api.get('/users/me', {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
              login(res.data.data, token, refreshToken);
            } else {
              logout();
            }
          } catch {
            logout();
          }
        } else {
          logout();
        }
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!rootNavigationState?.key) return; // Wait for navigation container to be ready

    const inAuthGroup = segments[0] === '(auth)';

    if (!accessToken && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (accessToken && inAuthGroup) {
      router.replace('/(tabs)');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, isLoading, segments, rootNavigationState?.key]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <InitialLayout />
    </QueryClientProvider>
  );
}
