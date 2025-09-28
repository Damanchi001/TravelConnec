import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NotificationService } from '../services/notifications';

export const setupNotifications = async () => {
  // Request permissions
  const hasPermission = await NotificationService.requestPermissions();

  if (!hasPermission) {
    console.warn('Notification permissions not granted');
    return false;
  }

  // Set up notification categories for iOS
  if (Platform.OS === 'ios') {
    await Notifications.setNotificationCategoryAsync('booking', [
      {
        identifier: 'view',
        buttonTitle: 'View Booking',
        options: {
          opensAppToForeground: true,
        },
      },
    ]);
  }

  // Set up notification response handler
  const subscription = Notifications.addNotificationResponseReceivedListener(response => {
    const { notification } = response;
    const data = notification.request.content.data;

    // Handle notification tap
    if (data?.type === 'booking_confirmation' || data?.type === 'booking_status_change') {
      // Navigate to booking details
      // This would be handled by the navigation system
    }
  });

  return true;
};

// Call this in App.tsx or _layout.tsx
export const initializeNotifications = async (): Promise<void> => {
  try {
    await setupNotifications();
  } catch (error) {
    console.error('Failed to initialize notifications:', error);
  }
};