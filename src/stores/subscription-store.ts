import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface SubscriptionTier {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  isPopular?: boolean;
  savings?: string;
  originalPrice?: string;
}

export interface SubscriptionStatus {
  isActive: boolean;
  tier: string | null;
  expirationDate: Date | null;
  willRenew: boolean;
  isInGracePeriod: boolean;
  isInFreeTrial: boolean;
}

export interface SubscriptionFeatures {
  // Social features (base)
  canCreateProfile: boolean;
  canAccessPublicContent: boolean;
  canJoinFreeGroups: boolean;
  canViewTrips: boolean;
  canPostComments: boolean;

  // Traveler features
  canAppearInTravelBuddyMatching: boolean;
  canListTrips: boolean;
  hasUnlimitedMessaging: boolean;
  hasPrioritySupport: boolean;
  hasAdvancedFilters: boolean;
  hasExclusiveDeals: boolean;
  isAdFree: boolean;
  canBookVerifiedLocals: boolean;
  canVoteDestinationOfMonth: boolean;

  // Entrepreneur features
  canCreatePaidListings: boolean;
  canReceivePayouts: boolean;
  hasCustomStorefront: boolean;
  canAppearInVerifiedLocals: boolean;
  hasAccessToWorkCampaigns: boolean;
  canHostGroupTrips: boolean;
  hasInsightsDashboard: boolean;
  hasPriorityPlacement: boolean;
  hasVoiceVideoCalling: boolean;
  canPromoteListings: boolean;
  hasB2BAccess: boolean;

  // Social limitations
  hasLimitedMessaging: boolean;
  showsAds: boolean;
  hasLimitedProfileVisibility: boolean;
}

interface SubscriptionState {
  // Subscription status
  status: SubscriptionStatus;
  features: SubscriptionFeatures;
  availableTiers: SubscriptionTier[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  showPaywall: boolean;
  selectedTier: string | null;
  
  // Purchase state
  isPurchasing: boolean;
  purchaseError: string | null;
  lastPurchaseDate: Date | null;
}

interface SubscriptionActions {
  // Status management
  updateSubscriptionStatus: (status: SubscriptionStatus) => void;
  updateFeatures: (features: SubscriptionFeatures) => void;
  setAvailableTiers: (tiers: SubscriptionTier[]) => void;
  
  // UI actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  showPaywallModal: () => void;
  hidePaywallModal: () => void;
  selectTier: (tierId: string) => void;
  
  // Purchase actions
  startPurchase: (tierId: string) => void;
  completePurchase: (success: boolean, error?: string) => void;
  restorePurchases: () => Promise<void>;
  
  // Feature checks
  hasFeature: (feature: keyof SubscriptionFeatures) => boolean;
  canAccessFeature: (feature: string) => boolean;
  requiresUpgrade: (feature: keyof SubscriptionFeatures) => boolean;
  
  // Utility
  reset: () => void;
  getFeaturesByTier: (tier: string) => SubscriptionFeatures;
}

type SubscriptionStore = SubscriptionState & SubscriptionActions;

const initialState: SubscriptionState = {
  status: {
    isActive: false,
    tier: null,
    expirationDate: null,
    willRenew: false,
    isInGracePeriod: false,
    isInFreeTrial: false,
  },
  features: {
    // Social features (base)
    canCreateProfile: true,
    canAccessPublicContent: true,
    canJoinFreeGroups: true,
    canViewTrips: true,
    canPostComments: true,

    // Traveler features
    canAppearInTravelBuddyMatching: false,
    canListTrips: false,
    hasUnlimitedMessaging: false,
    hasPrioritySupport: false,
    hasAdvancedFilters: false,
    hasExclusiveDeals: false,
    isAdFree: false,
    canBookVerifiedLocals: false,
    canVoteDestinationOfMonth: false,

    // Entrepreneur features
    canCreatePaidListings: false,
    canReceivePayouts: false,
    hasCustomStorefront: false,
    canAppearInVerifiedLocals: false,
    hasAccessToWorkCampaigns: false,
    canHostGroupTrips: false,
    hasInsightsDashboard: false,
    hasPriorityPlacement: false,
    hasVoiceVideoCalling: false,
    canPromoteListings: false,
    hasB2BAccess: false,

    // Social limitations
    hasLimitedMessaging: true,
    showsAds: true,
    hasLimitedProfileVisibility: true,
  },
  availableTiers: [
    {
      id: 'social',
      name: 'Social',
      price: '$0',
      period: 'forever',
      features: [
        'Create user profile',
        'Access public content (posts, trip feeds, Explore page)',
        'Join free travel groups',
        'Discover verified locals (limited)',
        'Post and comment on destination pages',
        '1:1 text messaging with friends and group members',
        'View other travelers\' trips (read-only)'
      ]
    },
    {
      id: 'traveler_monthly',
      name: 'Traveler',
      price: '$9.99',
      period: 'month',
      features: [
        'All Social features',
        'Appear in Travel Buddy matching',
        'List past, present, and upcoming trips',
        'Unlimited direct messages',
        'Priority support',
        'Advanced filters in Explore',
        'Access exclusive deals, events, and travel promos',
        'Ad-free experience',
        'Can book verified locals',
        'Voting access for destination-of-the-month campaigns'
      ]
    },
    {
      id: 'traveler_quarterly',
      name: 'Traveler',
      price: '$24.99',
      period: 'quarter',
      originalPrice: '$29.97',
      savings: '17% savings',
      features: [
        'All Social features',
        'Appear in Travel Buddy matching',
        'List past, present, and upcoming trips',
        'Unlimited direct messages',
        'Priority support',
        'Advanced filters in Explore',
        'Access exclusive deals, events, and travel promos',
        'Ad-free experience',
        'Can book verified locals',
        'Voting access for destination-of-the-month campaigns'
      ]
    },
    {
      id: 'traveler_annual',
      name: 'Traveler',
      price: '$89.99',
      period: 'year',
      originalPrice: '$119.88',
      savings: '25% savings',
      features: [
        'All Social features',
        'Appear in Travel Buddy matching',
        'List past, present, and upcoming trips',
        'Unlimited direct messages',
        'Priority support',
        'Advanced filters in Explore',
        'Access exclusive deals, events, and travel promos',
        'Ad-free experience',
        'Can book verified locals',
        'Voting access for destination-of-the-month campaigns'
      ],
      isPopular: true
    },
    {
      id: 'entrepreneur_monthly',
      name: 'Entrepreneur',
      price: '$19.99',
      period: 'month',
      features: [
        'All Traveler features',
        'Create paid listings (services, tours, experiences)',
        'Bookings & instant payouts (via Stripe)',
        'Custom storefront/profile',
        'Appear in Verified Locals section',
        'Access to "Work with Us" campaigns',
        'Host TravelConnec-branded group trips',
        'Insights Dashboard (listings, bookings, verifications, earnings)',
        'Priority placement in country/destination feeds',
        'Optional voice/video calling (paid extra or add-on)',
        'Promote listings with boosts',
        'Access to B2B directory (collab with travel groups)'
      ]
    },
    {
      id: 'entrepreneur_quarterly',
      name: 'Entrepreneur',
      price: '$54.99',
      period: 'quarter',
      originalPrice: '$59.97',
      savings: '31% savings',
      features: [
        'All Traveler features',
        'Create paid listings (services, tours, experiences)',
        'Bookings & instant payouts (via Stripe)',
        'Custom storefront/profile',
        'Appear in Verified Locals section',
        'Access to "Work with Us" campaigns',
        'Host TravelConnec-branded group trips',
        'Insights Dashboard (listings, bookings, verifications, earnings)',
        'Priority placement in country/destination feeds',
        'Optional voice/video calling (paid extra or add-on)',
        'Promote listings with boosts',
        'Access to B2B directory (collab with travel groups)'
      ]
    },
    {
      id: 'entrepreneur_annual',
      name: 'Entrepreneur',
      price: '$179.99',
      period: 'year',
      originalPrice: '$239.88',
      savings: '25% savings',
      features: [
        'All Traveler features',
        'Create paid listings (services, tours, experiences)',
        'Bookings & instant payouts (via Stripe)',
        'Custom storefront/profile',
        'Appear in Verified Locals section',
        'Access to "Work with Us" campaigns',
        'Host TravelConnec-branded group trips',
        'Insights Dashboard (listings, bookings, verifications, earnings)',
        'Priority placement in country/destination feeds',
        'Optional voice/video calling (paid extra or add-on)',
        'Promote listings with boosts',
        'Access to B2B directory (collab with travel groups)'
      ]
    }
  ],
  isLoading: false,
  error: null,
  showPaywall: false,
  selectedTier: null,
  isPurchasing: false,
  purchaseError: null,
  lastPurchaseDate: null,
};

export const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Status management
      updateSubscriptionStatus: (status) => {
        set({ status });
        
        // Update features based on tier
        const features = get().getFeaturesByTier(status.tier || 'free');
        set({ features });
      },

      updateFeatures: (features) => set({ features }),

      setAvailableTiers: (availableTiers) => set({ availableTiers }),

      // UI actions
      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      showPaywallModal: () => set({ showPaywall: true }),

      hidePaywallModal: () => set({ showPaywall: false, selectedTier: null }),

      selectTier: (selectedTier) => set({ selectedTier }),

      // Purchase actions
      startPurchase: (tierId) => {
        set({ 
          isPurchasing: true, 
          purchaseError: null,
          selectedTier: tierId 
        });
      },

      completePurchase: (success, error) => {
        set({ 
          isPurchasing: false,
          purchaseError: error || null,
          lastPurchaseDate: success ? new Date() : get().lastPurchaseDate
        });
        
        if (success) {
          set({ showPaywall: false, selectedTier: null });
        }
      },

      restorePurchases: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // This would integrate with RevenueCat
          // For now, just simulate the call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // TODO: Implement actual restore logic with RevenueCat
          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to restore purchases' 
          });
        }
      },

      // Feature checks
      hasFeature: (feature) => {
        const { features } = get();
        return features[feature];
      },

      canAccessFeature: (feature) => {
        const { status, features } = get();

        // Check if user has active subscription
        if (!status.isActive) return false;

        // Map feature strings to feature flags
        switch (feature) {
          case 'travel_buddy_matching':
            return features.canAppearInTravelBuddyMatching;
          case 'list_trips':
            return features.canListTrips;
          case 'unlimited_messaging':
            return features.hasUnlimitedMessaging;
          case 'priority_support':
            return features.hasPrioritySupport;
          case 'advanced_filters':
            return features.hasAdvancedFilters;
          case 'exclusive_deals':
            return features.hasExclusiveDeals;
          case 'ad_free':
            return features.isAdFree;
          case 'book_verified_locals':
            return features.canBookVerifiedLocals;
          case 'vote_destination_month':
            return features.canVoteDestinationOfMonth;
          case 'create_paid_listings':
            return features.canCreatePaidListings;
          case 'receive_payouts':
            return features.canReceivePayouts;
          case 'custom_storefront':
            return features.hasCustomStorefront;
          case 'verified_locals_section':
            return features.canAppearInVerifiedLocals;
          case 'work_campaigns':
            return features.hasAccessToWorkCampaigns;
          case 'host_group_trips':
            return features.canHostGroupTrips;
          case 'insights_dashboard':
            return features.hasInsightsDashboard;
          case 'priority_placement':
            return features.hasPriorityPlacement;
          case 'voice_video_calling':
            return features.hasVoiceVideoCalling;
          case 'promote_listings':
            return features.canPromoteListings;
          case 'b2b_access':
            return features.hasB2BAccess;
          default:
            return false;
        }
      },

      requiresUpgrade: (feature) => {
        const { features } = get();
        return !features[feature];
      },

      // Helper function to get features by tier
      getFeaturesByTier: (tier: string): SubscriptionFeatures => {
        const baseFeatures: SubscriptionFeatures = {
          // Social features (base)
          canCreateProfile: true,
          canAccessPublicContent: true,
          canJoinFreeGroups: true,
          canViewTrips: true,
          canPostComments: true,

          // Traveler features
          canAppearInTravelBuddyMatching: false,
          canListTrips: false,
          hasUnlimitedMessaging: false,
          hasPrioritySupport: false,
          hasAdvancedFilters: false,
          hasExclusiveDeals: false,
          isAdFree: false,
          canBookVerifiedLocals: false,
          canVoteDestinationOfMonth: false,

          // Entrepreneur features
          canCreatePaidListings: false,
          canReceivePayouts: false,
          hasCustomStorefront: false,
          canAppearInVerifiedLocals: false,
          hasAccessToWorkCampaigns: false,
          canHostGroupTrips: false,
          hasInsightsDashboard: false,
          hasPriorityPlacement: false,
          hasVoiceVideoCalling: false,
          canPromoteListings: false,
          hasB2BAccess: false,

          // Social limitations
          hasLimitedMessaging: true,
          showsAds: true,
          hasLimitedProfileVisibility: true,
        };

        switch (tier) {
          case 'traveler':
            return {
              ...baseFeatures,
              // Traveler gets all social features plus these
              canAppearInTravelBuddyMatching: true,
              canListTrips: true,
              hasUnlimitedMessaging: true,
              hasPrioritySupport: true,
              hasAdvancedFilters: true,
              hasExclusiveDeals: true,
              isAdFree: true,
              canBookVerifiedLocals: true,
              canVoteDestinationOfMonth: true,
              // Remove social limitations
              hasLimitedMessaging: false,
              showsAds: false,
              hasLimitedProfileVisibility: false,
            };

          case 'entrepreneur':
            return {
              ...baseFeatures,
              // Entrepreneur gets all traveler features plus these
              canAppearInTravelBuddyMatching: true,
              canListTrips: true,
              hasUnlimitedMessaging: true,
              hasPrioritySupport: true,
              hasAdvancedFilters: true,
              hasExclusiveDeals: true,
              isAdFree: true,
              canBookVerifiedLocals: true,
              canVoteDestinationOfMonth: true,
              canCreatePaidListings: true,
              canReceivePayouts: true,
              hasCustomStorefront: true,
              canAppearInVerifiedLocals: true,
              hasAccessToWorkCampaigns: true,
              canHostGroupTrips: true,
              hasInsightsDashboard: true,
              hasPriorityPlacement: true,
              hasVoiceVideoCalling: true,
              canPromoteListings: true,
              hasB2BAccess: true,
              // Remove social limitations
              hasLimitedMessaging: false,
              showsAds: false,
              hasLimitedProfileVisibility: false,
            };

          default: // social
            return baseFeatures;
        }
      },

      reset: () => set(initialState),
    }),
    {
      name: 'subscription-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        status: state.status,
        features: state.features,
        lastPurchaseDate: state.lastPurchaseDate,
      }),
    }
  )
);