# Assets Architecture for Travel Platform

## Overview
This document outlines the comprehensive assets structure for the travel platform, including organization, naming conventions, specifications, and implementation guidelines.

## Current Assets Analysis
**Existing assets:**
- App icons (Android/iOS)
- Favicon
- React branding (to be replaced)
- Basic splash screen

## Enhanced Assets Structure

```
assets/
├── brand/                           # Brand identity assets
│   ├── logo/
│   │   ├── logo-primary.png
│   │   ├── logo-primary@2x.png
│   │   ├── logo-primary@3x.png
│   │   ├── logo-white.png
│   │   ├── logo-white@2x.png
│   │   ├── logo-white@3x.png
│   │   ├── logo-icon-only.png
│   │   ├── logo-icon-only@2x.png
│   │   ├── logo-icon-only@3x.png
│   │   └── logo-horizontal.png
│   ├── wordmark/
│   │   ├── wordmark-primary.png
│   │   ├── wordmark-white.png
│   │   └── wordmark-dark.png
│   └── favicon/
│       ├── favicon.ico
│       ├── favicon-16x16.png
│       ├── favicon-32x32.png
│       └── favicon-192x192.png
│
├── icons/                           # UI and feature icons
│   ├── navigation/                  # Tab bar and navigation icons
│   │   ├── home-outline.png
│   │   ├── home-filled.png
│   │   ├── search-outline.png
│   │   ├── search-filled.png
│   │   ├── bookings-outline.png
│   │   ├── bookings-filled.png
│   │   ├── messages-outline.png
│   │   ├── messages-filled.png
│   │   ├── social-outline.png
│   │   ├── social-filled.png
│   │   ├── profile-outline.png
│   │   └── profile-filled.png
│   │
│   ├── actions/                     # Action and interaction icons
│   │   ├── heart-outline.png
│   │   ├── heart-filled.png
│   │   ├── share.png
│   │   ├── bookmark-outline.png
│   │   ├── bookmark-filled.png
│   │   ├── filter.png
│   │   ├── sort.png
│   │   ├── map-pin.png
│   │   ├── calendar.png
│   │   ├── clock.png
│   │   ├── users.png
│   │   ├── star-outline.png
│   │   ├── star-filled.png
│   │   ├── star-half.png
│   │   ├── edit.png
│   │   ├── delete.png
│   │   ├── more-horizontal.png
│   │   ├── more-vertical.png
│   │   ├── chevron-left.png
│   │   ├── chevron-right.png
│   │   ├── chevron-up.png
│   │   ├── chevron-down.png
│   │   ├── close.png
│   │   ├── check.png
│   │   ├── plus.png
│   │   ├── minus.png
│   │   └── info.png
│   │
│   ├── communication/               # Chat and communication icons
│   │   ├── message.png
│   │   ├── send.png
│   │   ├── phone.png
│   │   ├── video.png
│   │   ├── microphone.png
│   │   ├── microphone-off.png
│   │   ├── camera.png
│   │   ├── camera-off.png
│   │   ├── attachment.png
│   │   └── emoji.png
│   │
│   ├── travel/                      # Travel-specific icons
│   │   ├── accommodation.png
│   │   ├── house.png
│   │   ├── apartment.png
│   │   ├── villa.png
│   │   ├── hotel.png
│   │   ├── cabin.png
│   │   ├── experience.png
│   │   ├── activity.png
│   │   ├── tour.png
│   │   ├── food.png
│   │   ├── transport.png
│   │   ├── luggage.png
│   │   ├── passport.png
│   │   ├── plane.png
│   │   ├── car.png
│   │   └── location.png
│   │
│   ├── amenities/                   # Amenity icons
│   │   ├── wifi.png
│   │   ├── parking.png
│   │   ├── pool.png
│   │   ├── gym.png
│   │   ├── kitchen.png
│   │   ├── washer.png
│   │   ├── dryer.png
│   │   ├── air-conditioning.png
│   │   ├── heating.png
│   │   ├── tv.png
│   │   ├── pets.png
│   │   ├── smoking.png
│   │   ├── balcony.png
│   │   ├── garden.png
│   │   ├── beach.png
│   │   ├── mountain.png
│   │   ├── city.png
│   │   ├── fireplace.png
│   │   ├── hot-tub.png
│   │   └── bbq.png
│   │
│   ├── payment/                     # Payment and subscription icons
│   │   ├── credit-card.png
│   │   ├── paypal.png
│   │   ├── apple-pay.png
│   │   ├── google-pay.png
│   │   ├── wallet.png
│   │   ├── receipt.png
│   │   ├── invoice.png
│   │   ├── dollar.png
│   │   ├── subscription.png
│   │   └── premium.png
│   │
│   ├── status/                      # Status and notification icons
│   │   ├── success.png
│   │   ├── error.png
│   │   ├── warning.png
│   │   ├── pending.png
│   │   ├── confirmed.png
│   │   ├── cancelled.png
│   │   ├── notification.png
│   │   ├── bell.png
│   │   ├── badge.png
│   │   └── verified.png
│   │
│   └── social/                      # Social and user icons
│       ├── like.png
│       ├── comment.png
│       ├── follow.png
│       ├── unfollow.png
│       ├── friend.png
│       ├── mention.png
│       ├── hashtag.png
│       └── social-share.png
│
├── illustrations/                   # Illustrations and graphics
│   ├── onboarding/
│   │   ├── welcome-traveler.png
│   │   ├── welcome-host.png
│   │   ├── setup-profile.png
│   │   ├── verification.png
│   │   ├── ready-to-go.png
│   │   └── success.png
│   │
│   ├── empty-states/
│   │   ├── no-bookings.png
│   │   ├── no-messages.png
│   │   ├── no-listings.png
│   │   ├── no-reviews.png
│   │   ├── no-search-results.png
│   │   ├── no-notifications.png
│   │   ├── no-favorites.png
│   │   └── no-social-posts.png
│   │
│   ├── error-states/
│   │   ├── connection-error.png
│   │   ├── server-error.png
│   │   ├── not-found.png
│   │   ├── access-denied.png
│   │   └── maintenance.png
│   │
│   ├── success-states/
│   │   ├── booking-confirmed.png
│   │   ├── payment-success.png
│   │   ├── profile-verified.png
│   │   ├── listing-published.png
│   │   └── review-submitted.png
│   │
│   └── features/
│       ├── travel-hero.png
│       ├── host-dashboard.png
│       ├── social-community.png
│       ├── secure-payments.png
│       ├── real-time-chat.png
│       ├── premium-features.png
│       └── trust-safety.png
│
├── placeholders/                    # Placeholder images
│   ├── avatars/
│   │   ├── user-placeholder.png
│   │   ├── user-placeholder@2x.png
│   │   ├── user-placeholder@3x.png
│   │   └── user-placeholders/ (various generic avatars)
│   │       ├── avatar-1.png
│   │       ├── avatar-2.png
│   │       ├── avatar-3.png
│   │       ├── avatar-4.png
│   │       └── avatar-5.png
│   │
│   ├── listings/
│   │   ├── property-placeholder.png
│   │   ├── property-placeholder@2x.png
│   │   ├── property-placeholder@3x.png
│   │   └── property-samples/ (sample listing images)
│   │       ├── house-1.jpg
│   │       ├── house-2.jpg
│   │       ├── apartment-1.jpg
│   │       ├── apartment-2.jpg
│   │       ├── villa-1.jpg
│   │       ├── villa-2.jpg
│   │       ├── hotel-1.jpg
│   │       ├── hotel-2.jpg
│   │       ├── cabin-1.jpg
│   │       └── cabin-2.jpg
│   │
│   └── content/
│       ├── image-placeholder.png
│       ├── loading-skeleton.png
│       └── no-image.png
│
├── backgrounds/                     # Background patterns and gradients
│   ├── patterns/
│   │   ├── subtle-dots.png
│   │   ├── grid-light.png
│   │   ├── wave-pattern.png
│   │   └── geometric.png
│   │
│   ├── gradients/
│   │   ├── primary-gradient.png
│   │   ├── secondary-gradient.png
│   │   ├── hero-gradient.png
│   │   └── card-gradient.png
│   │
│   └── textures/
│       ├── paper-texture.png
│       ├── fabric-texture.png
│       └── noise-overlay.png
│
├── ui-elements/                     # UI component assets
│   ├── buttons/
│   │   ├── primary-button-bg.png
│   │   ├── secondary-button-bg.png
│   │   ├── outline-button-bg.png
│   │   └── floating-action-button.png
│   │
│   ├── inputs/
│   │   ├── text-input-bg.png
│   │   ├── search-input-bg.png
│   │   └── textarea-bg.png
│   │
│   ├── cards/
│   │   ├── card-shadow.png
│   │   ├── elevated-card.png
│   │   └── featured-card-bg.png
│   │
│   └── dividers/
│       ├── horizontal-line.png
│       ├── vertical-line.png
│       └── decorative-divider.png
│
├── maps/                           # Map-related assets
│   ├── markers/
│   │   ├── listing-marker.png
│   │   ├── user-marker.png
│   │   ├── selected-marker.png
│   │   ├── cluster-marker.png
│   │   └── custom-pin.png
│   │
│   └── overlays/
│       ├── map-overlay.png
│       └── location-circle.png
│
├── lottie/                         # Lottie animations
│   ├── loading-spinner.json
│   ├── success-checkmark.json
│   ├── error-shake.json
│   ├── heart-animation.json
│   ├── booking-confirmation.json
│   ├── search-animation.json
│   ├── chat-typing.json
│   └── onboarding-flow.json
│
└── app-icons/                      # App store icons (existing + enhanced)
    ├── ios/
    │   ├── icon-1024.png
    │   ├── icon-180.png
    │   ├── icon-167.png
    │   ├── icon-152.png
    │   ├── icon-120.png
    │   ├── icon-87.png
    │   ├── icon-80.png
    │   ├── icon-76.png
    │   ├── icon-60.png
    │   ├── icon-58.png
    │   ├── icon-40.png
    │   ├── icon-29.png
    │   └── icon-20.png
    │
    ├── android/
    │   ├── mipmap-xxxhdpi/ (192x192)
    │   ├── mipmap-xxhdpi/ (144x144)
    │   ├── mipmap-xhdpi/ (96x96)
    │   ├── mipmap-hdpi/ (72x72)
    │   ├── mipmap-mdpi/ (48x48)
    │   ├── adaptive-icon-background.png
    │   ├── adaptive-icon-foreground.png
    │   └── adaptive-icon-monochrome.png
    │
    └── web/
        ├── favicon.ico
        ├── manifest-icon-192.png
        ├── manifest-icon-512.png
        └── apple-touch-icon.png
```

## Asset Specifications

### Image Resolution Standards

#### Mobile Density Guidelines
```yaml
@1x (mdpi):    1x resolution (baseline)
@2x (xhdpi):   2x resolution (retina/high-DPI)
@3x (xxhdpi):  3x resolution (extra high-DPI)
```

#### Icon Specifications
```yaml
Navigation Icons:
  - Size: 24x24 dp
  - Format: PNG with transparency
  - Resolutions: @1x (24px), @2x (48px), @3x (72px)

Action Icons:
  - Size: 20x20 dp  
  - Format: PNG with transparency
  - Resolutions: @1x (20px), @2x (40px), @3x (60px)

Feature Icons:
  - Size: 32x32 dp
  - Format: PNG with transparency
  - Resolutions: @1x (32px), @2x (64px), @3x (96px)

Amenity Icons:
  - Size: 28x28 dp
  - Format: PNG with transparency
  - Resolutions: @1x (28px), @2x (56px), @3x (84px)
```

#### Illustration Specifications
```yaml
Hero Illustrations:
  - Size: 375x200 dp (iPhone viewport width)
  - Format: PNG or WebP
  - Resolutions: @1x, @2x, @3x

Empty State Illustrations:
  - Size: 200x200 dp
  - Format: PNG with transparency
  - Resolutions: @1x, @2x, @3x

Onboarding Illustrations:
  - Size: 300x300 dp
  - Format: PNG or WebP
  - Resolutions: @1x, @2x, @3x
```

#### Photo Specifications
```yaml
Listing Thumbnails:
  - Size: 150x100 dp
  - Format: WebP or JPEG
  - Quality: 80%

Listing Hero Images:
  - Size: 375x250 dp
  - Format: WebP or JPEG
  - Quality: 85%

Avatar Images:
  - Sizes: 40x40, 60x60, 80x80 dp
  - Format: WebP or JPEG
  - Resolutions: @1x, @2x, @3x
```

### Color Guidelines

#### Brand Colors
```yaml
Primary: #0A7EA4    # Teal blue (existing tint color)
Secondary: #FF6B6B  # Coral red for accents
Success: #4ECDC4    # Mint green
Warning: #FFE66D    # Sunny yellow
Error: #FF6B6B      # Coral red
Info: #74B9FF       # Light blue

Neutrals:
  - White: #FFFFFF
  - Light Gray: #F8F9FA
  - Medium Gray: #6C757D
  - Dark Gray: #343A40
  - Black: #000000
```

#### Icon Color Usage
```yaml
Navigation Icons:
  - Active: Brand Primary (#0A7EA4)
  - Inactive: Medium Gray (#6C757D)

Action Icons:
  - Default: Dark Gray (#343A40)
  - Accent: Brand Primary (#0A7EA4)
  - Destructive: Error Red (#FF6B6B)

Status Icons:
  - Success: Success Green (#4ECDC4)
  - Warning: Warning Yellow (#FFE66D)
  - Error: Error Red (#FF6B6B)
```

### File Naming Conventions

#### Pattern
```
[category]-[name]-[state][@resolution].[extension]

Examples:
- nav-home-outline@2x.png
- action-heart-filled@3x.png
- illustration-welcome-traveler@2x.png
- placeholder-avatar-default.png
- bg-gradient-primary.png
```

#### State Suffixes
```yaml
Icon States:
  - outline: Line/outline version
  - filled: Solid/filled version
  - active: Active state
  - inactive: Inactive state
  - disabled: Disabled state

Illustration States:
  - light: Light theme version
  - dark: Dark theme version
  - default: Universal version
```

## Asset Implementation

### Asset Import System
```typescript
// src/assets/index.ts
export const Assets = {
  brand: {
    logo: {
      primary: require('./brand/logo/logo-primary.png'),
      white: require('./brand/logo/logo-white.png'),
      iconOnly: require('./brand/logo/logo-icon-only.png'),
    },
  },
  
  icons: {
    navigation: {
      home: {
        outline: require('./icons/navigation/home-outline.png'),
        filled: require('./icons/navigation/home-filled.png'),
      },
      search: {
        outline: require('./icons/navigation/search-outline.png'),
        filled: require('./icons/navigation/search-filled.png'),
      },
      // ... other navigation icons
    },
    
    actions: {
      heart: {
        outline: require('./icons/actions/heart-outline.png'),
        filled: require('./icons/actions/heart-filled.png'),
      },
      share: require('./icons/actions/share.png'),
      bookmark: {
        outline: require('./icons/actions/bookmark-outline.png'),
        filled: require('./icons/actions/bookmark-filled.png'),
      },
      // ... other action icons
    },
    
    amenities: {
      wifi: require('./icons/amenities/wifi.png'),
      parking: require('./icons/amenities/parking.png'),
      pool: require('./icons/amenities/pool.png'),
      // ... other amenity icons
    },
  },
  
  illustrations: {
    onboarding: {
      welcomeTraveler: require('./illustrations/onboarding/welcome-traveler.png'),
      welcomeHost: require('./illustrations/onboarding/welcome-host.png'),
      setupProfile: require('./illustrations/onboarding/setup-profile.png'),
      // ... other onboarding illustrations
    },
    
    emptyStates: {
      noBookings: require('./illustrations/empty-states/no-bookings.png'),
      noMessages: require('./illustrations/empty-states/no-messages.png'),
      noListings: require('./illustrations/empty-states/no-listings.png'),
      // ... other empty state illustrations
    },
  },
  
  placeholders: {
    avatar: require('./placeholders/avatars/user-placeholder.png'),
    listing: require('./placeholders/listings/property-placeholder.png'),
    image: require('./placeholders/content/image-placeholder.png'),
    
    samples: {
      avatars: [
        require('./placeholders/avatars/user-placeholders/avatar-1.png'),
        require('./placeholders/avatars/user-placeholders/avatar-2.png'),
        require('./placeholders/avatars/user-placeholders/avatar-3.png'),
        // ... more sample avatars
      ],
      listings: [
        require('./placeholders/listings/property-samples/house-1.jpg'),
        require('./placeholders/listings/property-samples/house-2.jpg'),
        require('./placeholders/listings/property-samples/apartment-1.jpg'),
        // ... more sample listings
      ],
    },
  },
};

export default Assets;
```

### Asset Usage Examples
```typescript
// In components
import { Assets } from '@/assets';
import { Image } from 'expo-image';

// Navigation icon usage
<Image 
  source={Assets.icons.navigation.home.outline} 
  style={{ width: 24, height: 24, tintColor: '#6C757D' }}
/>

// Illustration usage
<Image 
  source={Assets.illustrations.onboarding.welcomeTraveler} 
  style={{ width: 300, height: 300 }}
  contentFit="contain"
/>

// Placeholder usage with fallback
<Image 
  source={{ uri: user.avatar || Assets.placeholders.avatar }}
  style={{ width: 60, height: 60, borderRadius: 30 }}
/>
```

### Dynamic Asset Helper
```typescript
// src/utils/asset-helpers.ts
export const getNavigationIcon = (name: string, filled: boolean = false) => {
  const iconSet = Assets.icons.navigation[name];
  return iconSet ? (filled ? iconSet.filled : iconSet.outline) : null;
};

export const getAmenityIcon = (amenityId: string) => {
  return Assets.icons.amenities[amenityId] || null;
};

export const getRandomPlaceholder = (type: 'avatar' | 'listing') => {
  const samples = Assets.placeholders.samples[type === 'avatar' ? 'avatars' : 'listings'];
  return samples[Math.floor(Math.random() * samples.length)];
};

export const getEmptyStateIllustration = (screen: string) => {
  const illustrationMap = {
    bookings: Assets.illustrations.emptyStates.noBookings,
    messages: Assets.illustrations.emptyStates.noMessages,
    listings: Assets.illustrations.emptyStates.noListings,
    reviews: Assets.illustrations.emptyStates.noReviews,
    search: Assets.illustrations.emptyStates.noSearchResults,
    favorites: Assets.illustrations.emptyStates.noFavorites,
  };
  
  return illustrationMap[screen] || Assets.illustrations.emptyStates.noBookings;
};
```

## Asset Creation Guidelines

### Design Principles
1. **Consistency**: Maintain visual consistency across all assets
2. **Scalability**: Design for multiple resolutions and sizes
3. **Accessibility**: Ensure sufficient contrast and clarity
4. **Brand Alignment**: Follow brand guidelines and visual identity
5. **Performance**: Optimize file sizes without compromising quality

### Icon Design Guidelines
- Use a 2px stroke width for outline icons
- Maintain consistent visual weight across icon sets
- Use rounded corners (2px radius) for a friendly appearance
- Ensure icons work on both light and dark backgrounds
- Follow platform-specific design guidelines (iOS/Android)

### Illustration Style Guide
- Use a modern, friendly illustration style
- Incorporate brand colors consistently
- Maintain consistent character proportions
- Use subtle shadows and depth for dimensionality
- Ensure illustrations work across different screen sizes

### Photography Guidelines
- Use high-quality, professional photography
- Maintain consistent lighting and color grading
- Include diverse representation in people photography
- Optimize images for web and mobile performance
- Provide multiple aspect ratios when needed

## Asset Optimization

### File Size Optimization
```yaml
Icons:
  - Format: PNG-8 for simple icons
  - Compression: TinyPNG or similar
  - Target: <5KB per icon

Illustrations:
  - Format: PNG-24 or WebP
  - Compression: Moderate (85% quality)
  - Target: <50KB per illustration

Photos:
  - Format: WebP (with JPEG fallback)
  - Quality: 80-85%
  - Target: <100KB for thumbnails, <300KB for hero images

Animations:
  - Format: Lottie JSON
  - Optimization: Remove unused keyframes
  - Target: <20KB per animation
```

### Performance Considerations
- Use progressive JPEG for larger images
- Implement lazy loading for non-critical images
- Provide WebP with JPEG fallback
- Use vector graphics (SVG) where appropriate
- Cache images efficiently using Expo Image

This comprehensive assets architecture provides a solid foundation for your travel platform's visual identity while ensuring scalability, performance, and maintainability.