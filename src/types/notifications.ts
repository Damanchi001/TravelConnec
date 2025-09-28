export type NotificationType =
  | 'booking_confirmation'
  | 'booking_status_change'
  | 'payment_confirmation'
  | 'check_in_reminder'
  | 'payout_notification'
  | 'message'
  | 'call'
  | 'request';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: Date;
  read: boolean;
  data?: {
    bookingId?: string;
    listingId?: string;
    amount?: number;
    currency?: string;
    checkInDate?: Date;
    payoutId?: string;
    userId?: string;
    [key: string]: any;
  };
  avatar?: string;
}

export interface PushNotificationData {
  type: NotificationType;
  bookingId?: string;
  listingId?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export interface NotificationSettings {
  pushEnabled: boolean;
  bookingConfirmations: boolean;
  paymentUpdates: boolean;
  checkInReminders: boolean;
  payoutNotifications: boolean;
  messages: boolean;
  marketing: boolean;
}