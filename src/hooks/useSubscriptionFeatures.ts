import { useCallback } from 'react';
import { SubscriptionFeatures, useSubscriptionStore } from '../stores/subscription-store';
import { usePurchaseFlow } from './usePurchaseFlow';

interface UseSubscriptionFeaturesReturn {
  // Feature access checks
  canCreateProfile: boolean;
  canAccessPublicContent: boolean;
  canJoinFreeGroups: boolean;
  canViewTrips: boolean;
  canPostComments: boolean;
  canAppearInTravelBuddyMatching: boolean;
  canListTrips: boolean;
  hasUnlimitedMessaging: boolean;
  hasPrioritySupport: boolean;
  hasAdvancedFilters: boolean;
  hasExclusiveDeals: boolean;
  isAdFree: boolean;
  canBookVerifiedLocals: boolean;
  canVoteDestinationOfMonth: boolean;
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

  // Utility functions
  hasFeature: (feature: keyof SubscriptionFeatures) => boolean;
  requiresUpgrade: (feature: string) => boolean;
  showUpgradePrompt: (feature: string, requiredTier: string) => void;

  // Tier information
  currentTier: string | null;
  isActive: boolean;
  isInTrial: boolean;
}

export function useSubscriptionFeatures(): UseSubscriptionFeaturesReturn {
  const { features, status, canAccessFeature, requiresUpgrade: storeRequiresUpgrade } = useSubscriptionStore();
  const { showUpgradePrompt: showPurchasePrompt } = usePurchaseFlow();

  const showUpgradePrompt = useCallback((feature: string, requiredTier: string) => {
    showPurchasePrompt(feature, requiredTier);
  }, [showPurchasePrompt]);

  const hasFeature = useCallback((feature: keyof SubscriptionFeatures) => {
    return features[feature];
  }, [features]);

  const requiresUpgrade = useCallback((feature: string) => {
    return storeRequiresUpgrade(feature as keyof SubscriptionFeatures);
  }, [storeRequiresUpgrade]);

  return {
    // Feature access checks - spread the features object
    ...features,

    // Utility functions
    hasFeature,
    requiresUpgrade,
    showUpgradePrompt,

    // Tier information
    currentTier: status.tier,
    isActive: status.isActive,
    isInTrial: status.isInFreeTrial,
  };
}