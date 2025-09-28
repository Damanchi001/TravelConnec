import { create } from 'zustand';
import { AppNotification, NotificationSettings } from '../types/notifications';

interface NotificationState {
  notifications: AppNotification[];
  settings: NotificationSettings;
  unreadCount: number;
}

interface NotificationActions {
  addNotification: (notification: Omit<AppNotification, 'id' | 'time' | 'read'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  getUnreadCount: () => number;
}

type NotificationStore = NotificationState & NotificationActions;

let AsyncStorage;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  console.warn('AsyncStorage not available, notifications will not persist');
  AsyncStorage = null;
}

const defaultSettings: NotificationSettings = {
  pushEnabled: true,
  bookingConfirmations: true,
  paymentUpdates: true,
  checkInReminders: true,
  payoutNotifications: true,
  messages: true,
  marketing: false,
};

const storeConfig = (set: any, get: any) => ({
  // Initial state
  notifications: [],
  settings: defaultSettings,
  unreadCount: 0,

  // Actions
  addNotification: (notificationData: any) => {
    const newNotification: AppNotification = {
      ...notificationData,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      time: new Date(),
      read: false,
    };

    set((state: any) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: (notificationId: string) => {
    set((state: any) => {
      const updatedNotifications = state.notifications.map((notification: any) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      );
      const newUnreadCount = updatedNotifications.filter((n: any) => !n.read).length;

      return {
        notifications: updatedNotifications,
        unreadCount: newUnreadCount,
      };
    });
  },

  markAllAsRead: () => {
    set((state: any) => ({
      notifications: state.notifications.map((notification: any) => ({
        ...notification,
        read: true,
      })),
      unreadCount: 0,
    }));
  },

  removeNotification: (notificationId: string) => {
    set((state: any) => {
      const notificationToRemove = state.notifications.find((n: any) => n.id === notificationId);
      const updatedNotifications = state.notifications.filter((n: any) => n.id !== notificationId);
      const newUnreadCount = notificationToRemove?.read
        ? state.unreadCount
        : state.unreadCount - 1;

      return {
        notifications: updatedNotifications,
        unreadCount: Math.max(0, newUnreadCount),
      };
    });
  },

  clearAllNotifications: () => {
    set({
      notifications: [],
      unreadCount: 0,
    });
  },

  updateSettings: (newSettings: any) => {
    set((state: any) => ({
      settings: { ...state.settings, ...newSettings },
    }));
  },

  getUnreadCount: () => {
    return get().unreadCount;
  },
});

export const useNotificationStore = create<NotificationStore>()(storeConfig);