import { useEffect } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../store/authStore';
import { getToken } from '../utils/secureStore';
import { api } from '../services/api';
import { View, ActivityIndicator } from 'react-native';
import { colors } from '../theme';
import GlobalNotification from '../components/GlobalNotification';
import { initSocket } from '../services/socket';
import { useNotificationStore } from '../store/notificationStore';

const queryClient = new QueryClient();

function InitialLayout() {
  const { accessToken, isLoading, login, logout, setLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const { showNotification } = useNotificationStore();

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
          } catch (error: any) {
            // Only logout if token is explicitly invalid (401/403)
            if (error?.response?.status === 401 || error?.response?.status === 403) {
              logout();
            } else {
              // Network error or server down, but token exists. Allow offline/cache entry!
              // Pass null for user so it can be fetched later
              login(null as any, token, refreshToken);
            }
          }
        } else {
          logout();
        }
      } catch {
        // Fallback for secure store errors
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

    const segList = segments as string[];
    const inAuthGroup = segList[0] === '(auth)';
    const isRoot = segList.length === 0 || segList[0] === 'index';

    if (!accessToken && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (accessToken && (inAuthGroup || isRoot)) {
      router.replace('/(tabs)');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, isLoading, segments, rootNavigationState?.key]);

  // Global socket listener
  useEffect(() => {
    let socketInstance: any = null;

    const setupGlobalSocket = async () => {
      if (accessToken) {
        socketInstance = await initSocket();
        if (socketInstance) {
          socketInstance.on('global_new_message', (data: any) => {
            const { conversationId, message } = data;
            
            // Check if we are currently in this chat screen
            // segments[1] is the conversationId (or it might be segment[2] depending on path)
            // A safer way is to just let it show, but optionally we can filter
            // Let's just show it, GlobalNotification can decide to auto-hide or the user will see it.
            
            showNotification({
              conversationId,
              senderId: message.senderId._id,
              senderName: message.senderId.displayName || message.senderId.username,
              senderAvatar: message.senderId.profileImage,
              messageText: message.text,
            });
          });
        }
      }
    };

    setupGlobalSocket();

    return () => {
      if (socketInstance) {
        socketInstance.off('global_new_message');
      }
    };
  }, [accessToken, showNotification]);


  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(modals)" options={{ presentation: 'modal', headerShown: false }} />
      </Stack>
      <GlobalNotification />
    </>
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
