import * as Notifications from 'expo-notifications';
import { useNotificationStore } from '../../stores/notification-store';
import { AppNotification, NotificationType, PushNotificationData } from '../../types/notifications';
import { chatClient, videoClient } from '../stream/clients';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return finalStatus === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Register push token with Stream services for push notifications
   */
  static async registerPushTokenWithStream(userId: string): Promise<void> {
    try {
      const token = await Notifications.getDevicePushTokenAsync();
      console.log('[NotificationService] Got device push token:', token.data.substring(0, 20) + '...');

      // Use firebase as provider (works for both iOS and Android with Expo)
      const provider = 'firebase';

      // Register with Stream Chat
      if (chatClient) {
        await chatClient.addDevice(token.data, provider as any);
        console.log('[NotificationService] Registered push token with Stream Chat');
      }

      // Register with Stream Video
      if (videoClient) {
        await videoClient.addDevice(token.data, provider as any);
        console.log('[NotificationService] Registered push token with Stream Video');
      }
    } catch (error) {
      console.error('[NotificationService] Error registering push token with Stream:', error);
    }
  }

  /**
   * Unregister push token from Stream services
   */
  static async unregisterPushTokenFromStream(): Promise<void> {
    try {
      // Get the current token to remove
      const token = await Notifications.getDevicePushTokenAsync();

      // Unregister from Stream Chat
      if (chatClient) {
        await chatClient.removeDevice(token.data);
        console.log('[NotificationService] Unregistered push token from Stream Chat');
      }

      // Unregister from Stream Video
      if (videoClient) {
        await videoClient.removeDevice(token.data);
        console.log('[NotificationService] Unregistered push token from Stream Video');
      }
    } catch (error) {
      console.error('[NotificationService] Error unregistering push token from Stream:', error);
    }
  }

  static async schedulePushNotification(data: PushNotificationData): Promise<string | null> {
    try {
      const { settings } = useNotificationStore.getState();

      // Check if push notifications are enabled and specific type is enabled
      if (!settings.pushEnabled) return null;

      switch (data.type) {
        case 'booking_confirmation':
          if (!settings.bookingConfirmations) return null;
          break;
        case 'payment_confirmation':
          if (!settings.paymentUpdates) return null;
          break;
        case 'check_in_reminder':
          if (!settings.checkInReminders) return null;
          break;
        case 'payout_notification':
          if (!settings.payoutNotifications) return null;
          break;
        case 'message':
          if (!settings.messages) return null;
          break;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: data.title,
          body: data.body,
          data: {
            type: data.type,
            bookingId: data.bookingId,
            listingId: data.listingId,
            ...data.data,
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Send immediately
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling push notification:', error);
      return null;
    }
  }

  static async scheduleReminder(
    title: string,
    body: string,
    triggerDate: Date,
    data?: Record<string, any>
  ): Promise<string | null> {
    try {
      // For now, just schedule immediate notification
      // In a real app, you'd want to use proper scheduling
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Send immediately for now
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling reminder:', error);
      return null;
    }
  }

  static async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  // In-app notification methods
  static addInAppNotification(notification: Omit<AppNotification, 'id' | 'time' | 'read'>): void {
    const { addNotification } = useNotificationStore.getState();
    addNotification(notification);
  }

  static createBookingConfirmationNotification(bookingId: string, listingTitle: string): void {
    this.addInAppNotification({
      type: 'booking_confirmation',
      title: 'Booking Confirmed!',
      message: `Your booking for ${listingTitle} has been confirmed.`,
      data: { bookingId },
    });

    this.schedulePushNotification({
      type: 'booking_confirmation',
      bookingId,
      title: 'Booking Confirmed!',
      body: `Your booking for ${listingTitle} has been confirmed.`,
    });
  }

  static createBookingStatusChangeNotification(
    bookingId: string,
    listingTitle: string,
    oldStatus: string,
    newStatus: string
  ): void {
    const statusMessages = {
      confirmed: 'confirmed',
      cancelled: 'cancelled',
      completed: 'completed',
      refunded: 'refunded',
    };

    const statusMessage = statusMessages[newStatus as keyof typeof statusMessages] || newStatus;

    this.addInAppNotification({
      type: 'booking_status_change',
      title: 'Booking Status Updated',
      message: `Your booking for ${listingTitle} has been ${statusMessage}.`,
      data: { bookingId, oldStatus, newStatus },
    });

    this.schedulePushNotification({
      type: 'booking_status_change',
      bookingId,
      title: 'Booking Status Updated',
      body: `Your booking for ${listingTitle} has been ${statusMessage}.`,
    });
  }

  static createPaymentConfirmationNotification(
    bookingId: string,
    amount: number,
    currency: string
  ): void {
    this.addInAppNotification({
      type: 'payment_confirmation',
      title: 'Payment Confirmed',
      message: `Your payment of ${currency}${amount} has been processed successfully.`,
      data: { bookingId, amount, currency },
    });

    this.schedulePushNotification({
      type: 'payment_confirmation',
      bookingId,
      title: 'Payment Confirmed',
      body: `Your payment of ${currency}${amount} has been processed successfully.`,
    });
  }

  static createCheckInReminderNotification(
    bookingId: string,
    listingTitle: string,
    checkInDate: Date
  ): void {
    const reminderDate = new Date(checkInDate);
    reminderDate.setHours(reminderDate.getHours() - 24); // 24 hours before check-in

    this.addInAppNotification({
      type: 'check_in_reminder',
      title: 'Check-in Reminder',
      message: `Don't forget to check in to ${listingTitle} tomorrow.`,
      data: { bookingId, checkInDate },
    });

    // Schedule push notification for 24 hours before check-in
    this.scheduleReminder(
      'Check-in Reminder',
      `Don't forget to check in to ${listingTitle} tomorrow.`,
      reminderDate,
      { type: 'check_in_reminder', bookingId }
    );
  }

  static createPayoutNotification(
    payoutId: string,
    amount: number,
    currency: string,
    bookingId?: string
  ): void {
    this.addInAppNotification({
      type: 'payout_notification',
      title: 'Payout Processed',
      message: `Your payout of ${currency}${amount} has been processed.`,
      data: { payoutId, amount, currency, bookingId },
    });

    this.schedulePushNotification({
      type: 'payout_notification',
      title: 'Payout Processed',
      body: `Your payout of ${currency}${amount} has been processed.`,
      data: { payoutId, bookingId },
    });
  }

  static createCancellationNotification(
    bookingId: string,
    listingTitle: string,
    refundAmount: number,
    currency: string,
    cancelledBy: 'guest' | 'host'
  ): void {
    const isRefund = refundAmount > 0;
    const title = cancelledBy === 'guest' ? 'Booking Cancelled by Guest' : 'Booking Cancelled';
    const message = isRefund
      ? `The booking for ${listingTitle} has been cancelled. A refund of ${currency}${refundAmount} will be processed.`
      : `The booking for ${listingTitle} has been cancelled. No refund is applicable.`;

    this.addInAppNotification({
      type: 'booking_status_change',
      title,
      message,
      data: { bookingId, refundAmount, currency, cancelledBy },
    });

    this.schedulePushNotification({
      type: 'booking_status_change',
      bookingId,
      title,
      body: message,
    });
  }

  static createRefundProcessedNotification(
    bookingId: string,
    listingTitle: string,
    refundAmount: number,
    currency: string
  ): void {
    this.addInAppNotification({
      type: 'payment_confirmation',
      title: 'Refund Processed',
      message: `Your refund of ${currency}${refundAmount} for ${listingTitle} has been processed.`,
      data: { bookingId, refundAmount, currency },
    });

    this.schedulePushNotification({
      type: 'payment_confirmation',
      bookingId,
      title: 'Refund Processed',
      body: `Your refund of ${currency}${refundAmount} for ${listingTitle} has been processed.`,
    });
  }

  /**
   * Send call notification to user
   */
  static async sendCallNotification(
    userId: string,
    callData: {
      callId: string;
      callerName: string;
      callerAvatar?: string;
      type: 'voice' | 'video';
    }
  ): Promise<void> {
    try {
      const callTypeText = callData.type === 'video' ? 'video call' : 'voice call';

      // Add in-app notification
      this.addInAppNotification({
        type: 'call',
        title: `Incoming ${callTypeText}`,
        message: `${callData.callerName} is calling you`,
        data: {
          callId: callData.callId,
          callerName: callData.callerName,
          callerAvatar: callData.callerAvatar,
          type: callData.type
        },
      });

      // Schedule push notification
      await this.schedulePushNotification({
        type: 'call',
        title: `Incoming ${callTypeText}`,
        body: `${callData.callerName} is calling you`,
        data: {
          callId: callData.callId,
          callerName: callData.callerName,
          callerAvatar: callData.callerAvatar,
          type: callData.type,
          action: 'incoming_call'
        },
      });
    } catch (error) {
      console.error('Failed to send call notification:', error);
    }
  }

  /**
   * Send call response notification (accepted/rejected)
   */
  static async sendCallResponseNotification(
    userId: string,
    callId: string,
    response: 'accepted' | 'rejected'
  ): Promise<void> {
    try {
      const responseText = response === 'accepted' ? 'accepted' : 'declined';

      // Add in-app notification
      this.addInAppNotification({
        type: 'call',
        title: 'Call Response',
        message: `Your call has been ${responseText}`,
        data: { callId, response },
      });

      // Schedule push notification
      await this.schedulePushNotification({
        type: 'call',
        title: 'Call Response',
        body: `Your call has been ${responseText}`,
        data: { callId, response },
      });
    } catch (error) {
      console.error('Failed to send call response notification:', error);
    }
  }

  static getNotificationIcon(type: NotificationType): string {
    switch (type) {
      case 'booking_confirmation':
      case 'booking_status_change':
        return 'checkmark-circle-outline';
      case 'payment_confirmation':
        return 'card-outline';
      case 'check_in_reminder':
        return 'calendar-outline';
      case 'payout_notification':
        return 'cash-outline';
      case 'message':
        return 'chatbubble-outline';
      case 'call':
        return 'call-outline';
      case 'request':
        return 'document-outline';
      default:
        return 'notifications-outline';
    }
  }

  static formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString();
  }

  /**
   * Handle incoming Stream push notifications
   */
  static handleStreamPushNotification(notification: any): void {
    try {
      const data = notification.request?.trigger?.payload || notification.data || {};

      // Handle chat message notifications
      if (data.type === 'message.new' || data.sender === 'stream.chat') {
        const channelId = data.cid || data.channel_id;
        const messageText = data.message?.text || 'New message';
        const senderName = data.user?.name || data.sender_name || 'Someone';

        this.addInAppNotification({
          type: 'message',
          title: `Message from ${senderName}`,
          message: messageText,
          data: { channelId, messageId: data.message?.id },
        });

        // Schedule local push notification if app is in background
        this.schedulePushNotification({
          type: 'message',
          title: `Message from ${senderName}`,
          body: messageText,
          data: { channelId },
        });
      }

      // Handle video call notifications
      if (data.type === 'call.ring' || data.sender === 'stream.video') {
        const callId = data.call_cid || data.call_id;
        const callerName = data.user?.name || data.caller_name || 'Someone';

        this.addInAppNotification({
          type: 'call',
          title: `Incoming call from ${callerName}`,
          message: 'Tap to answer',
          data: { callId },
        });

        // Schedule local push notification for call
        this.schedulePushNotification({
          type: 'call',
          title: `Incoming call from ${callerName}`,
          body: 'Tap to answer',
          data: { callId },
        });
      }
    } catch (error) {
      console.error('[NotificationService] Error handling Stream push notification:', error);
    }
  }
}