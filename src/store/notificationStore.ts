import { create } from 'zustand';

export interface NotificationData {
  id: string;
  conversationId: string;
  senderId?: string;
  senderName: string;
  senderAvatar: string;
  messageText: string;
}

interface NotificationState {
  activeNotification: NotificationData | null;
  showNotification: (data: Omit<NotificationData, 'id'>) => void;
  hideNotification: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  activeNotification: null,
  showNotification: (data) => set({ activeNotification: { ...data, id: Date.now().toString() } }),
  hideNotification: () => set({ activeNotification: null }),
}));
