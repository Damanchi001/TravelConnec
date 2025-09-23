import { Platform } from 'react-native';
import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage
} from 'react-native-purchases';
import { supabase } from '../supabase/client';

export interface SubscriptionTier {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  isPopular?: boolean;
  savings?: string;
}

export interface SubscriptionStatus {
  isActive: boolean;
  tier: string | null;
  expirationDate: Date | null;
  willRenew: boolean;
  isInGracePeriod: boolean;
  isInFreeTrial: boolean;
}

class RevenueCatService {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Configure RevenueCat
      const apiKey = Platform.select({
        ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
        android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
      });

      if (!apiKey) {
        throw new Error('RevenueCat API key not found');
      }

      await Purchases.configure({
        apiKey,
      });

      // Set log level for debugging
      if (__DEV__) {
        await Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
      }

      this.initialized = true;
    } catch (error) {
      console.error('RevenueCat initialization error:', error);
      throw error;
    }
  }

  async identifyUser(userId: string, email?: string): Promise<void> {
    try {
      await Purchases.logIn(userId);
      if (email) {
        await Purchases.setEmail(email);
      }
    } catch (error) {
      console.error('Error identifying user:', error);
      throw error;
    }
  }

  async getOfferings(): Promise<PurchasesOffering[]> {
    try {
      const offerings = await Purchases.getOfferings();
      return Object.values(offerings.all);
    } catch (error) {
      console.error('Error fetching offerings:', error);
      return [];
    }
  }

  async getCurrentOffering(): Promise<PurchasesOffering | null> {
    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current;
    } catch (error) {
      console.error('Error fetching current offering:', error);
      return null;
    }
  }

  async getSubscriptionTiers(): Promise<SubscriptionTier[]> {
    try {
      const offering = await this.getCurrentOffering();
      if (!offering) return [];

      const tiers: SubscriptionTier[] = [
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
        }
      ];

      // Map RevenueCat packages to subscription tiers
      offering.availablePackages.forEach((pkg: PurchasesPackage) => {
        let tierInfo: Partial<SubscriptionTier> = {};

        switch (pkg.identifier) {
          case 'traveler_monthly':
            tierInfo = {
              id: 'traveler_monthly',
              name: 'Traveler',
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
            };
            break;

          case 'traveler_quarterly':
            tierInfo = {
              id: 'traveler_quarterly',
              name: 'Traveler',
              period: 'quarter',
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
              savings: '17% savings'
            };
            break;

          case 'traveler_annual':
            tierInfo = {
              id: 'traveler_annual',
              name: 'Traveler',
              period: 'year',
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
              savings: '25% savings',
              isPopular: true
            };
            break;

          case 'entrepreneur_monthly':
            tierInfo = {
              id: 'entrepreneur_monthly',
              name: 'Entrepreneur',
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
            };
            break;

          case 'entrepreneur_quarterly':
            tierInfo = {
              id: 'entrepreneur_quarterly',
              name: 'Entrepreneur',
              period: 'quarter',
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
              ],
              savings: '31% savings'
            };
            break;

          case 'entrepreneur_annual':
            tierInfo = {
              id: 'entrepreneur_annual',
              name: 'Entrepreneur',
              period: 'year',
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
              ],
              savings: '25% savings'
            };
            break;
        }

        if (tierInfo.id) {
          tiers.push({
            ...tierInfo,
            price: pkg.product.priceString,
          } as SubscriptionTier);
        }
      });

      return tiers;
    } catch (error) {
      console.error('Error getting subscription tiers:', error);
      return [];
    }
  }

  async purchasePackage(packageToPurchase: PurchasesPackage): Promise<boolean> {
    try {
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      
      // Update user subscription in Supabase
      await this.syncSubscriptionToSupabase(customerInfo);
      
      return true;
    } catch (error: any) {
      if (error.userCancelled) {
        console.log('User cancelled purchase');
        return false;
      }
      console.error('Purchase error:', error);
      throw error;
    }
  }

  async restorePurchases(): Promise<boolean> {
    try {
      const customerInfo = await Purchases.restorePurchases();

      // Update user subscription in Supabase
      await this.syncSubscriptionToSupabase(customerInfo);

      return Object.keys(customerInfo.entitlements.active).length > 0;
    } catch (error) {
      console.error('Restore purchases error:', error);
      throw error;
    }
  }

  async getCustomerInfo(): Promise<CustomerInfo> {
    try {
      return await Purchases.getCustomerInfo();
    } catch (error) {
      console.error('Error getting customer info:', error);
      throw error;
    }
  }

  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    try {
      const customerInfo = await this.getCustomerInfo();
      const activeEntitlements = customerInfo.entitlements.active;
      
      let tier: string | null = null;
      let expirationDate: Date | null = null;
      let willRenew = false;
      let isInGracePeriod = false;
      let isInFreeTrial = false;

      if (Object.keys(activeEntitlements).length > 0) {
        const activeEntitlement = Object.values(activeEntitlements)[0];
        tier = activeEntitlement.identifier;
        expirationDate = activeEntitlement.expirationDate ? new Date(activeEntitlement.expirationDate) : null;
        willRenew = activeEntitlement.willRenew;
        isInGracePeriod = activeEntitlement.isActive && !activeEntitlement.willRenew;
        isInFreeTrial = activeEntitlement.periodType === 'trial';
      }

      return {
        isActive: Object.keys(activeEntitlements).length > 0,
        tier,
        expirationDate,
        willRenew,
        isInGracePeriod,
        isInFreeTrial
      };
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return {
        isActive: false,
        tier: null,
        expirationDate: null,
        willRenew: false,
        isInGracePeriod: false,
        isInFreeTrial: false
      };
    }
  }

  private async syncSubscriptionToSupabase(customerInfo: CustomerInfo): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const activeEntitlements = customerInfo.entitlements.active;
      
      if (Object.keys(activeEntitlements).length > 0) {
        const entitlement = Object.values(activeEntitlements)[0];
        
        await supabase.from('subscriptions').upsert({
          user_id: user.id,
          revenue_cat_subscription_id: entitlement.productIdentifier,
          product_id: entitlement.productIdentifier,
          tier: this.mapProductToTier(entitlement.productIdentifier),
          status: 'active',
          starts_at: new Date().toISOString(),
          expires_at: entitlement.expirationDate,
          price: 0, // This would need to be fetched from the product info
          currency: 'USD',
          billing_period: entitlement.periodType === 'normal' ? 'monthly' : 'yearly',
          features: this.getFeaturesByTier(this.mapProductToTier(entitlement.productIdentifier))
        });
      }
    } catch (error) {
      console.error('Error syncing subscription to Supabase:', error);
    }
  }

  private mapProductToTier(productId: string): string {
    if (productId.includes('traveler')) return 'traveler';
    if (productId.includes('entrepreneur')) return 'entrepreneur';
    return 'social';
  }

  private getFeaturesByTier(tier: string): Record<string, boolean> {
    const features = {
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
      hasLimitedMessaging: false,
      showsAds: false,
      hasLimitedProfileVisibility: false,
    };

    switch (tier) {
      case 'traveler':
        return {
          ...features,
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
        };

      case 'entrepreneur':
        return {
          ...features,
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
        };

      default: // social
        return {
          ...features,
          // Social tier limitations
          hasLimitedMessaging: true,
          showsAds: true,
          hasLimitedProfileVisibility: true,
        };
    }
  }

  async logout(): Promise<void> {
    try {
      await Purchases.logOut();
    } catch (error) {
      console.error('Error logging out of RevenueCat:', error);
    }
  }
}

export const revenueCatService = new RevenueCatService();