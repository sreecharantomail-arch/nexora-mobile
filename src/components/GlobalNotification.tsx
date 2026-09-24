import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useNotificationStore } from '../store/notificationStore';
import { colors, typography, spacing, radius } from '../theme';

export default function GlobalNotification() {
  const { activeNotification, hideNotification } = useNotificationStore();
  // eslint-disable-next-line react-hooks/refs
  const slideAnim = useRef(new Animated.Value(-150)).current;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const closeNotification = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: -150,
      duration: 300,
      useNativeDriver: true,
    }).start(() => hideNotification());
  }, [slideAnim, hideNotification]);

  useEffect(() => {
    if (activeNotification) {
      Animated.spring(slideAnim, {
        toValue: insets.top + spacing.sm,
        useNativeDriver: true,
        speed: 12,
        bounciness: 8
      }).start();

      const timer = setTimeout(() => {
        closeNotification();
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      Animated.timing(slideAnim, {
        toValue: -150,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNotification, insets.top, closeNotification]);

  const handlePress = () => {
    if (activeNotification) {
      closeNotification();
      router.push(`/chat/${activeNotification.conversationId}?otherUserId=${activeNotification.senderId || ''}&otherUsername=${activeNotification.senderName}` as any);
    }
  };

  if (!activeNotification) return null;

  return (
    <Animated.View 
      style={[
        styles.container, 
        { transform: [{ translateY: slideAnim }] }
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity 
        style={styles.notificationCard} 
        activeOpacity={0.9} 
        onPress={handlePress}
      >
        <Image 
          source={{ uri: activeNotification.senderAvatar || 'https://via.placeholder.com/150' }} 
          style={styles.avatar} 
        />
        <View style={styles.content}>
          <Text style={styles.senderName}>{activeNotification.senderName}</Text>
          <Text style={styles.messageText} numberOfLines={1}>
            {activeNotification.messageText}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: spacing.md,
    elevation: 10,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#333',
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
  },
  senderName: {
    color: colors.primary,
    fontSize: typography.size.md,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  messageText: {
    color: colors.secondary,
    fontSize: typography.size.sm,
  }
});
