# Component Hierarchy & Design System

## Overview
The travel platform builds upon the existing themed component system, extending it with travel-specific components while maintaining consistency and reusability.

## Current Foundation (Leveraged)
- ✅ [`ThemedText`](components/themed-text.tsx) - Typography with theme support
- ✅ [`ThemedView`](components/themed-view.tsx) - Container with theme support
- ✅ [`IconSymbol`](components/ui/icon-symbol.tsx) - Cross-platform icons
- ✅ [`ParallaxScrollView`](components/parallax-scroll-view.tsx) - Enhanced scrolling
- ✅ [`Collapsible`](components/ui/collapsible.tsx) - Expandable content
- ✅ [`HapticTab`](components/haptic-tab.tsx) - Enhanced tab interaction
- ✅ Theme system with light/dark mode support

## Component Architecture

### 1. Foundation Layer (Enhanced Existing)

#### Enhanced UI Components
```typescript
// src/components/ui/button.tsx
interface ButtonProps extends PressableProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  fullWidth?: boolean;
}

// src/components/ui/input.tsx  
interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: string;
  rightIcon?: string;
  variant: 'default' | 'outline' | 'filled';
  size: 'sm' | 'md' | 'lg';
}

// src/components/ui/card.tsx
interface CardProps extends ThemedViewProps {
  variant: 'default' | 'outline' | 'shadow' | 'elevated';
  padding: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  loading?: boolean;
}

// src/components/ui/avatar.tsx
interface AvatarProps {
  src?: string;
  fallback?: string;
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant: 'circle' | 'rounded' | 'square';
  online?: boolean;
  verified?: boolean;
}

// src/components/ui/badge.tsx
interface BadgeProps {
  variant: 'default' | 'success' | 'warning' | 'error' | 'info';
  size: 'sm' | 'md' | 'lg';
  text: string;
  icon?: string;
}
```

### 2. Form Components Layer

```typescript
// src/components/forms/form-field.tsx
interface FormFieldProps {
  name: string;
  label?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

// src/components/forms/date-picker.tsx
interface DatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  mode: 'date' | 'datetime' | 'time';
}

// src/components/forms/location-picker.tsx
interface LocationPickerProps {
  value?: LocationData;
  onChange: (location: LocationData) => void;
  placeholder?: string;
  showMap?: boolean;
  radius?: number;
}

// src/components/forms/image-picker.tsx ✅ IMPLEMENTED
interface ImagePickerProps {
  onImageSelected?: (uri: string) => void;
  onMultipleImagesSelected?: (uris: string[]) => void;
  children: React.ReactNode;
  aspect?: [number, number];
  allowsMultipleSelection?: boolean;
  quality?: number;
  storageBucket: string;
  storagePath?: string;
  disabled?: boolean;
  style?: any;
  source?: 'library' | 'camera' | 'both';
}
```

### 3. Travel-Specific Components

#### Listing Components
```typescript
// src/components/listings/listing-card.tsx
interface ListingCardProps {
  listing: Listing;
  onPress?: () => void;
  onFavorite?: () => void;
  variant: 'grid' | 'list' | 'featured';
  showHost?: boolean;
  isFavorited?: boolean;
}

// src/components/listings/listing-gallery.tsx
interface ListingGalleryProps {
  images: ListingImage[];
  onImagePress?: (index: number) => void;
  showIndicators?: boolean;
  autoPlay?: boolean;
}

// src/components/listings/listing-amenities.tsx
interface ListingAmenitiesProps {
  amenities: Amenity[];
  variant: 'grid' | 'list' | 'compact';
  showAll?: boolean;
  limit?: number;
}

// src/components/listings/listing-filters.tsx
interface ListingFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableFilters: FilterConfig[];
  showResultCount?: boolean;
}

// src/components/listings/listing-map.tsx
interface ListingMapProps {
  listings: Listing[];
  selectedListingId?: string;
  onListingSelect?: (listing: Listing) => void;
  showUserLocation?: boolean;
  initialRegion?: MapRegion;
}
```

#### Booking Components
```typescript
// src/components/booking/booking-calendar.tsx
interface BookingCalendarProps {
  availableDates: Date[];
  blockedDates: Date[];
  selectedDates: { checkIn?: Date; checkOut?: Date };
  onDatesChange: (dates: { checkIn?: Date; checkOut?: Date }) => void;
  minNights?: number;
  maxNights?: number;
}

// src/components/booking/booking-summary.tsx
interface BookingSummaryProps {
  listing: Listing;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  priceBreakdown: PriceBreakdown;
  onModify?: () => void;
}

// src/components/booking/payment-form.tsx
interface PaymentFormProps {
  amount: number;
  currency: string;
  onPaymentSuccess: (paymentIntent: PaymentIntent) => void;
  onPaymentError: (error: string) => void;
  loading?: boolean;
}

// src/components/booking/booking-status.tsx
interface BookingStatusProps {
  booking: Booking;
  userRole: 'guest' | 'host';
  onAction?: (action: BookingAction) => void;
}
```

#### Chat Components (Stream Integration)
```typescript
// src/components/chat/message-list.tsx
interface MessageListProps {
  channelId: string;
  onMessagePress?: (message: MessageType) => void;
  showTypingIndicator?: boolean;
  loadMoreThreshold?: number;
}

// src/components/chat/message-input.tsx
interface MessageInputProps {
  channelId: string;
  onSend?: (message: string) => void;
  placeholder?: string;
  showAttachments?: boolean;
  maxLength?: number;
}

// src/components/chat/call-controls.tsx
interface CallControlsProps {
  callId: string;
  isVideo?: boolean;
  isMuted?: boolean;
  isVideoEnabled?: boolean;
  onMuteToggle: () => void;
  onVideoToggle: () => void;
  onEndCall: () => void;
}

// src/components/chat/channel-preview.tsx
interface ChannelPreviewProps {
  channel: Channel;
  onPress?: () => void;
  showLastMessage?: boolean;
  showUnreadCount?: boolean;
}
```

#### Social Components
```typescript
// src/components/social/post-card.tsx
interface PostCardProps {
  post: SocialPost;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onUserPress?: (userId: string) => void;
  showActions?: boolean;
}

// src/components/social/activity-feed.tsx
interface ActivityFeedProps {
  activities: Activity[];
  onActivityPress?: (activity: Activity) => void;
  onLoadMore?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
}

// src/components/social/user-interactions.tsx
interface UserInteractionsProps {
  interactions: UserInteraction[];
  onInteractionPress?: (interaction: UserInteraction) => void;
  groupBy?: 'date' | 'type';
}

// src/components/social/post-composer.tsx
interface PostComposerProps {
  onPost: (content: PostContent) => void;
  placeholder?: string;
  maxLength?: number;
  allowMedia?: boolean;
  allowLocation?: boolean;
}
```

### 4. Navigation & Layout Components

```typescript
// src/components/layout/screen-wrapper.tsx
interface ScreenWrapperProps {
  children: React.ReactNode;
  showHeader?: boolean;
  headerTitle?: string;
  headerLeft?: React.ReactNode;
  headerRight?: React.ReactNode;
  scrollable?: boolean;
  refreshable?: boolean;
  onRefresh?: () => void;
  loading?: boolean;
}

// src/components/layout/bottom-sheet.tsx
interface BottomSheetProps {
  children: React.ReactNode;
  visible: boolean;
  onClose: () => void;
  height?: 'auto' | 'half' | 'full' | number;
  title?: string;
  showHandle?: boolean;
}

// src/components/layout/search-header.tsx
interface SearchHeaderProps {
  value: string;
  onChangeText: (text: string) => void;
  onFocus?: () => void;
  onSubmit?: () => void;
  placeholder?: string;
  showFilters?: boolean;
  onFiltersPress?: () => void;
}

// src/components/layout/tab-bar.tsx (Enhanced)
interface CustomTabBarProps {
  state: TabNavigationState;
  descriptors: any;
  navigation: any;
  userRole: UserRole;
  unreadCounts?: Record<string, number>;
}
```

### 5. Feature-Specific Components

#### Profile Components
```typescript
// src/components/profile/profile-header.tsx
interface ProfileHeaderProps {
  user: UserProfile;
  isOwnProfile?: boolean;
  onEditPress?: () => void;
  onMessagePress?: () => void;
  onCallPress?: () => void;
  showVerificationBadge?: boolean;
}

// src/components/profile/profile-stats.tsx
interface ProfileStatsProps {
  stats: UserStats;
  userRole: UserRole;
  variant: 'compact' | 'detailed';
}

// src/components/profile/profile-reviews.tsx
interface ProfileReviewsProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  onReviewPress?: (review: Review) => void;
  showAll?: boolean;
}
```

#### Host Dashboard Components
```typescript
// src/components/host/dashboard-stats.tsx
interface DashboardStatsProps {
  stats: HostStats;
  period: 'week' | 'month' | 'year';
  onPeriodChange: (period: string) => void;
}

// src/components/host/listing-performance.tsx
interface ListingPerformanceProps {
  listings: ListingWithStats[];
  sortBy: 'views' | 'bookings' | 'revenue';
  onSortChange: (sort: string) => void;
  onListingPress: (listing: Listing) => void;
}

// src/components/host/booking-requests.tsx
interface BookingRequestsProps {
  requests: BookingRequest[];
  onApprove: (requestId: string) => void;
  onDecline: (requestId: string) => void;
  onViewDetails: (request: BookingRequest) => void;
}
```

## Component Hierarchy Tree

```
src/components/
├── ui/                           # Foundation components
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── avatar.tsx
│   ├── badge.tsx
│   ├── modal.tsx
│   ├── loading.tsx
│   └── error-boundary.tsx
│
├── forms/                        # Form-specific components
│   ├── form-field.tsx
│   ├── date-picker.tsx
│   ├── location-picker.tsx
│   ├── image-picker.tsx
│   ├── rating-input.tsx
│   └── validation-message.tsx
│
├── explore/                      # Explore & discovery components
│   ├── city-card.tsx
│   ├── country-card.tsx
│   ├── category-item-card.tsx
│   └── search-bar.tsx
│
├── layout/                       # Layout & navigation
│   ├── screen-wrapper.tsx
│   ├── bottom-sheet.tsx
│   ├── search-header.tsx
│   ├── tab-bar.tsx
│   ├── drawer-content.tsx
│   └── safe-area-wrapper.tsx
│
├── listings/                     # Listing-related components
│   ├── listing-card.tsx
│   ├── listing-gallery.tsx
│   ├── listing-amenities.tsx
│   ├── listing-filters.tsx
│   ├── listing-map.tsx
│   ├── listing-grid.tsx
│   └── listing-search-results.tsx
│
├── booking/                      # Booking flow components
│   ├── booking-calendar.tsx
│   ├── booking-summary.tsx
│   ├── payment-form.tsx
│   ├── booking-status.tsx
│   ├── guest-info-form.tsx
│   └── booking-confirmation.tsx
│
├── chat/                         # Stream Chat components
│   ├── message-list.tsx
│   ├── message-input.tsx
│   ├── call-controls.tsx
│   ├── channel-preview.tsx
│   ├── video-call-overlay.tsx
│   └── typing-indicator.tsx
│
├── social/                       # Social features
│   ├── post-card.tsx
│   ├── activity-feed.tsx
│   ├── user-interactions.tsx
│   ├── post-composer.tsx
│   ├── comment-thread.tsx
│   └── user-mention.tsx
│
├── profile/                      # Profile & user components
│   ├── profile-header.tsx
│   ├── profile-stats.tsx
│   ├── profile-reviews.tsx
│   ├── profile-edit-form.tsx
│   ├── verification-status.tsx
│   └── user-card.tsx
│
├── host/                         # Host-specific components
│   ├── dashboard-stats.tsx
│   ├── listing-performance.tsx
│   ├── booking-requests.tsx
│   ├── earnings-chart.tsx
│   ├── calendar-management.tsx
│   └── analytics-overview.tsx
│
├── subscription/                 # RevenueCat integration
│   ├── subscription-plans.tsx
│   ├── paywall.tsx
│   ├── feature-gate.tsx
│   ├── billing-info.tsx
│   └── subscription-status.tsx
│
└── shared/                       # Shared utility components
    ├── empty-state.tsx
    ├── loading-skeleton.tsx
    ├── pull-to-refresh.tsx
    ├── infinite-scroll.tsx
    ├── search-suggestions.tsx
    └── notification-banner.tsx
```

## Design System Tokens

### Enhanced Theme System
```typescript
// constants/theme.ts (Enhanced)
export const Theme = {
  colors: {
    // Enhanced from existing Colors
    primary: {
      50: '#eff6ff',
      500: '#0a7ea4', // Existing tint color
      900: '#1e3a8a',
    },
    secondary: {
      50: '#f8fafc',
      500: '#64748b',
      900: '#0f172a',
    },
    success: {
      50: '#f0fdf4',
      500: '#22c55e',
      900: '#14532d',
    },
    warning: {
      50: '#fffbeb',
      500: '#f59e0b',
      900: '#78350f',
    },
    error: {
      50: '#fef2f2',
      500: '#ef4444',
      900: '#7f1d1d',
    },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },
  
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    full: 9999,
  },
  
  shadows: {
    sm: {
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  
  // Keep existing Fonts
  fonts: Fonts,
};
```

### Component Styling Patterns
```typescript
// Consistent styling patterns
const createVariantStyles = <T extends Record<string, any>>(variants: T) => variants;

const buttonVariants = createVariantStyles({
  primary: {
    backgroundColor: Theme.colors.primary[500],
    borderColor: Theme.colors.primary[500],
  },
  secondary: {
    backgroundColor: Theme.colors.secondary[500],
    borderColor: Theme.colors.secondary[500],
  },
  // ... other variants
});

const sizeVariants = createVariantStyles({
  sm: { paddingHorizontal: Theme.spacing.sm, height: 32 },
  md: { paddingHorizontal: Theme.spacing.md, height: 44 },
  lg: { paddingHorizontal: Theme.spacing.lg, height: 56 },
});
```

This component hierarchy provides:
- **Consistent Design Language**: Building on existing theme system
- **Modular Architecture**: Clear separation of concerns
- **Reusable Components**: Travel-specific components built for reuse
- **Type Safety**: Full TypeScript interfaces for all components
- **Performance Optimized**: Proper memoization and lazy loading
- **Accessibility**: Built-in accessibility features
- **Cross-Platform**: Works seamlessly on iOS, Android, and web

The system maintains backward compatibility with existing components while providing a clear path for building the comprehensive travel platform features.