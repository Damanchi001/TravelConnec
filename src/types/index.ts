export interface Participant {
  id: string;
  name: string;
  avatar: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  threadId?: string;
  isThreadReply?: boolean;
}

export interface Conversation {
  id: string;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  participants: Participant[];
  lastMessage: Message;
  recentMessages?: Message[]; // For threading preview
  unreadCount: number;
  isMuted?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
}

// Stripe Connect Types
export interface StripeConnectedAccount {
  id: string;
  userId: string;
  stripeAccountId: string;
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  onboardingComplete: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  requirements: {
    currently_due: string[];
    eventually_due: string[];
    past_due: string[];
    pending_verification: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface StripePaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded';
  applicationFeeAmount?: number;
  transferData?: {
    destination: string;
    amount: number;
  };
  metadata?: Record<string, string>;
}

export interface StripeTransfer {
  id: string;
  amount: number;
  currency: string;
  destination: string;
  description?: string;
  metadata?: Record<string, string>;
  status: 'pending' | 'paid' | 'failed' | 'canceled';
}

export interface StripeAccountLink {
  url: string;
  expiresAt: number;
}

export interface StripeOnboardingSession {
  accountLink: StripeAccountLink;
  accountId: string;
}

// Re-export database types
export type {
  Amenity, Booking, CheckIn, Database, Escrow, Listing, MessageThread, Payment, Payout,
  Review, SearchHistory, SocialPost,
  Subscription, UserFavorite, UserProfile
} from './database';

// Re-export social types
export type { LocationData, MediaAttachment, PostComposerProps, PostContent } from './social';

