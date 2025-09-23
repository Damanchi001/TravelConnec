# Travel Connec Subscription Architecture

## Overview
Travel Connec offers a 3-tier subscription model designed to serve different user types: casual travelers, active travelers, and travel entrepreneurs.

## Subscription Tiers

### 1. Social (Free Plan) - $0
**Target Audience**: Casual users, budget travelers, first-time app users exploring before committing

**Features & Benefits**:
- ✅ Create user profile
- ✅ Access public content (posts, trip feeds, Explore page)
- ✅ Join free travel groups
- ✅ Discover verified locals (limited view only)
- ✅ Post and comment on destination pages
- ✅ 1:1 text messaging with friends and group members
- ✅ View other travelers' trips (read-only)

**Limitations**:
- ❌ Cannot create paid listings or offer services
- ❌ Cannot create paid travel groups
- ❌ Limited profile visibility in search results
- ❌ No access to verified local bookings
- ❌ No monetization features
- ❌ Cannot appear in Travel Buddy matching
- ❌ Ads may be shown
- ❌ Limited messaging (5 messages/day with new users)

### 2. Traveler (Paid Plan)
**Pricing**: 
- Monthly: $9.99
- Quarterly: $24.99 (17% savings vs monthly)
- Annual: $89.99 (25% savings vs monthly)

**Target Audience**: Frequent travelers, solo travelers seeking buddies, digital nomads, culturally curious people

**Features & Benefits**:
- ✅ All Social features, plus:
- ✅ Appear in Travel Buddy matching
- ✅ List past, present, and upcoming trips
- ✅ Unlimited direct messages
- ✅ Priority support
- ✅ Advanced filters in Explore
- ✅ Access exclusive deals, events, and travel promos
- ✅ Ad-free experience
- ✅ Can book verified locals
- ✅ Voting access for destination-of-the-month campaigns

**Limitations**:
- ❌ Cannot create service listings (host experiences or tours)
- ❌ Cannot receive payouts
- ❌ No storefront/profile for selling services

### 3. Entrepreneur/Business (Premium Plan)
**Pricing**: 
- Monthly: $19.99
- Quarterly: $54.99 (31% savings vs monthly)
- Annual: $179.99 (25% savings vs monthly)

**Target Audience**: Local guides, travel vendors, cultural entrepreneurs, small businesses, locals offering paid services

**Features & Benefits**:
- ✅ All Traveler features, plus:
- ✅ Create paid listings (services, tours, experiences)
- ✅ Bookings & instant payouts (via Stripe)
- ✅ Custom storefront/profile
- ✅ Appear in Verified Locals section
- ✅ Access to "Work with Us" campaigns
- ✅ Host TravelConnec-branded group trips
- ✅ Insights Dashboard (listings, bookings, verifications, earnings)
- ✅ Priority placement in country/destination feeds
- ✅ Optional voice/video calling (paid extra or add-on)
- ✅ Promote listings with boosts
- ✅ Access to B2B directory (collab with travel groups)

**Limitations**:
- ⚠️ Listing review/approval required (quality control)
- ⚠️ Commission fee on transactions (e.g., 10%)
- ⚠️ Limited to travel-related services (no off-topic businesses)

## Feature Flag Mapping

### Core Features (All Tiers)
```typescript
interface CoreFeatures {
  canCreateProfile: boolean;           // true for all
  canAccessPublicContent: boolean;     // true for all
  canJoinFreeGroups: boolean;          // true for all
  canViewTrips: boolean;               // true for all
  canPostComments: boolean;            // true for all
}
```

### Social Tier Features
```typescript
interface SocialFeatures extends CoreFeatures {
  hasLimitedMessaging: boolean;        // 5 messages/day with new users
  showsAds: boolean;                   // true
  hasLimitedProfileVisibility: boolean; // true
  canDiscoverLocals: boolean;          // view only, no booking
}
```

### Traveler Tier Features
```typescript
interface TravelerFeatures extends CoreFeatures {
  canAppearInTravelBuddyMatching: boolean;    // true
  canListTrips: boolean;                      // true
  hasUnlimitedMessaging: boolean;             // true
  hasPrioritySupport: boolean;                // true
  hasAdvancedFilters: boolean;                // true
  hasExclusiveDeals: boolean;                 // true
  isAdFree: boolean;                          // true
  canBookVerifiedLocals: boolean;             // true
  canVoteDestinationOfMonth: boolean;         // true
}
```

### Entrepreneur Tier Features
```typescript
interface EntrepreneurFeatures extends TravelerFeatures {
  canCreatePaidListings: boolean;             // true
  canReceivePayouts: boolean;                 // true
  hasCustomStorefront: boolean;               // true
  canAppearInVerifiedLocals: boolean;         // true
  hasAccessToWorkCampaigns: boolean;          // true
  canHostGroupTrips: boolean;                 // true
  hasInsightsDashboard: boolean;              // true
  hasPriorityPlacement: boolean;              // true
  hasVoiceVideoCalling: boolean;              // true (paid add-on)
  canPromoteListings: boolean;                // true
  hasB2BAccess: boolean;                      // true
}
```

## RevenueCat Product Identifiers

### iOS/Android Product IDs
```
Social Tier: FREE (no purchase required)

Traveler Tier:
- traveler_monthly: $9.99/month
- traveler_quarterly: $24.99/3 months
- traveler_annual: $89.99/year

Entrepreneur Tier:
- entrepreneur_monthly: $19.99/month
- entrepreneur_quarterly: $54.99/3 months  
- entrepreneur_annual: $179.99/year
```

## Database Schema Updates

### Subscriptions Table
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier VARCHAR NOT NULL CHECK (tier IN ('social', 'traveler', 'entrepreneur')),
  billing_cycle VARCHAR NOT NULL CHECK (billing_cycle IN ('monthly', 'quarterly', 'annual')),
  status VARCHAR NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')),
  price_cents INTEGER NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  starts_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ,
  features JSONB NOT NULL DEFAULT '{}',
  revenue_cat_subscription_id VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## UI/UX Considerations

### Plan Comparison Table
- Clear feature differentiation between tiers
- Highlight popular plan (Traveler tier)
- Show savings percentages for quarterly/annual plans
- Progressive disclosure of features

### Purchase Flow
1. Plan selection with feature comparison
2. Billing cycle selection (monthly/quarterly/annual)
3. RevenueCat purchase processing
4. Success confirmation with welcome message
5. Feature activation and sync with backend

### Feature Restrictions
- Graceful degradation for free users
- Clear upgrade prompts with specific benefit messaging
- Usage limits indicators (e.g., "4/5 messages today")
- Premium feature previews with upgrade calls-to-action

## Integration Points

### RevenueCat Integration
- Initialize with proper product identifiers
- Handle purchase restoration
- Sync subscription status with Supabase
- Manage subscription lifecycle events

### Stripe Integration (for Entrepreneur tier)
- Handle payout processing
- Manage commission calculations
- Process booking transactions
- Generate financial reports

### Feature Flag System
- Real-time feature access checking
- Subscription status caching
- Graceful fallbacks for offline scenarios
- A/B testing capabilities for pricing experiments

## Implementation Priority

1. **Phase 1**: Basic tier structure and RevenueCat integration
2. **Phase 2**: Feature flag system and restriction enforcement
3. **Phase 3**: Advanced entrepreneur features (payouts, insights)
4. **Phase 4**: Optimization and analytics integration