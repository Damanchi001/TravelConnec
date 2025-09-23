import { useCallback } from 'react';
import { SubscriptionFeatures } from '../stores/subscription-store';
import { usePurchaseFlow } from './usePurchaseFlow';
import { useSubscriptionFeatures } from './useSubscriptionFeatures';

interface UseFeatureAccessReturn {
  checkFeatureAccess: (feature: string, requiredTier: string) => boolean;
  requireFeature: (feature: string, requiredTier: string) => Promise<boolean>;
  showUpgradePrompt: (feature: string, requiredTier: string) => void;
  canAccessFeature: (feature: string) => boolean;
}

export function useFeatureAccess(): UseFeatureAccessReturn {
  const { hasFeature } = useSubscriptionFeatures();
  const { showUpgradePrompt: showPurchasePrompt } = usePurchaseFlow();

  const showUpgradePrompt = useCallback((feature: string, requiredTier: string) => {
    showPurchasePrompt(feature, requiredTier);
  }, [showPurchasePrompt]);

  const canAccessFeature = useCallback((feature: string): boolean => {
    // Map feature strings to feature flags
    const featureMap: Record<string, keyof SubscriptionFeatures> = {
      'travel_buddy_matching': 'canAppearInTravelBuddyMatching',
      'list_trips': 'canListTrips',
      'unlimited_messaging': 'hasUnlimitedMessaging',
      'priority_support': 'hasPrioritySupport',
      'advanced_filters': 'hasAdvancedFilters',
      'exclusive_deals': 'hasExclusiveDeals',
      'ad_free': 'isAdFree',
      'book_verified_locals': 'canBookVerifiedLocals',
      'vote_destination_month': 'canVoteDestinationOfMonth',
      'create_paid_listings': 'canCreatePaidListings',
      'receive_payouts': 'canReceivePayouts',
      'custom_storefront': 'hasCustomStorefront',
      'verified_locals_section': 'canAppearInVerifiedLocals',
      'work_campaigns': 'hasAccessToWorkCampaigns',
      'host_group_trips': 'canHostGroupTrips',
      'insights_dashboard': 'hasInsightsDashboard',
      'priority_placement': 'hasPriorityPlacement',
      'voice_video_calling': 'hasVoiceVideoCalling',
      'promote_listings': 'canPromoteListings',
      'b2b_access': 'hasB2BAccess',
    };

    const featureFlag = featureMap[feature];
    return featureFlag ? hasFeature(featureFlag) : false;
  }, [hasFeature]);

  const checkFeatureAccess = useCallback((feature: string, requiredTier: string): boolean => {
    // If user has access to the feature, allow it
    if (canAccessFeature(feature)) {
      return true;
    }

    // Show upgrade prompt for restricted features
    showUpgradePrompt(feature, requiredTier);
    return false;
  }, [canAccessFeature, showUpgradePrompt]);

  const requireFeature = useCallback(async (feature: string, requiredTier: string): Promise<boolean> => {
    // If user has access to the feature, allow it
    if (canAccessFeature(feature)) {
      return true;
    }

    // Show upgrade prompt and return false (access denied)
    showUpgradePrompt(feature, requiredTier);
    return false;
  }, [canAccessFeature, showUpgradePrompt]);

  return {
    checkFeatureAccess,
    requireFeature,
    showUpgradePrompt,
    canAccessFeature,
  };
}