# Database Schema Design

## Supabase PostgreSQL Schema

### Core Tables

#### 1. Users Table (Enhanced from Supabase Auth)
```sql
CREATE TYPE user_role AS ENUM ('traveler', 'host', 'both', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'pending_verification');
CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');

CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  username TEXT UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  avatar_url TEXT,
  bio TEXT,
  role user_role DEFAULT 'traveler',
  status user_status DEFAULT 'active',
  verification_status verification_status DEFAULT 'unverified',
  verification_documents JSONB,
  languages TEXT[],
  location JSONB, -- {country, state, city, coordinates}
  preferences JSONB, -- User preferences for recommendations
  social_links JSONB, -- {instagram, facebook, linkedin, website}
  revenue_cat_id TEXT, -- RevenueCat customer ID
  stream_user_token TEXT, -- Stream user token
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. Listings Table
```sql
CREATE TYPE listing_type AS ENUM ('accommodation', 'experience', 'service');
CREATE TYPE listing_status AS ENUM ('draft', 'active', 'inactive', 'suspended');
CREATE TYPE property_type AS ENUM ('house', 'apartment', 'villa', 'cabin', 'hotel_room', 'unique');

CREATE TABLE public.listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID REFERENCES public.user_profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  listing_type listing_type NOT NULL,
  property_type property_type,
  category TEXT, -- For experiences/services
  
  -- Location
  address JSONB NOT NULL, -- {street, city, state, country, postal_code}
  coordinates POINT NOT NULL, -- PostGIS point for lat/lng
  
  -- Pricing
  base_price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  price_per TEXT DEFAULT 'night', -- night, hour, person, etc.
  cleaning_fee DECIMAL(10,2) DEFAULT 0,
  service_fee DECIMAL(10,2) DEFAULT 0,
  
  -- Capacity & Rules
  max_guests INTEGER DEFAULT 1,
  min_nights INTEGER DEFAULT 1,
  max_nights INTEGER,
  instant_book BOOLEAN DEFAULT FALSE,
  
  -- Amenities & Features
  amenities TEXT[], -- Array of amenity IDs
  features JSONB, -- Detailed features object
  house_rules TEXT[],
  
  -- Availability
  available_from DATE,
  available_to DATE,
  blocked_dates DATE[],
  
  -- Images & Media
  images JSONB NOT NULL, -- Array of image objects with URLs, captions, order
  video_url TEXT,
  virtual_tour_url TEXT,
  
  -- Status & Metadata
  status listing_status DEFAULT 'draft',
  views INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_listings_host_id ON public.listings(host_id);
CREATE INDEX idx_listings_location ON public.listings USING GIST(coordinates);
CREATE INDEX idx_listings_type_status ON public.listings(listing_type, status);
CREATE INDEX idx_listings_price ON public.listings(base_price);
```

#### 3. Bookings Table
```sql
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'partially_refunded');

CREATE TABLE public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES public.listings(id) NOT NULL,
  guest_id UUID REFERENCES public.user_profiles(id) NOT NULL,
  host_id UUID REFERENCES public.user_profiles(id) NOT NULL,
  
  -- Booking Details
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INTEGER NOT NULL,
  nights INTEGER NOT NULL,
  
  -- Pricing Breakdown
  base_amount DECIMAL(10,2) NOT NULL,
  cleaning_fee DECIMAL(10,2) DEFAULT 0,
  service_fee DECIMAL(10,2) DEFAULT 0,
  taxes DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  
  -- Payment Information
  payment_status payment_status DEFAULT 'pending',
  payment_intent_id TEXT, -- Stripe/RevenueCat payment ID
  paid_amount DECIMAL(10,2) DEFAULT 0,
  refunded_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Booking Status
  status booking_status DEFAULT 'pending',
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES public.user_profiles(id),
  cancelled_at TIMESTAMPTZ,
  
  -- Communication
  special_requests TEXT,
  host_notes TEXT,
  guest_notes TEXT,
  
  -- Metadata
  booking_code TEXT UNIQUE NOT NULL, -- Human readable booking reference
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generate booking code function
CREATE OR REPLACE FUNCTION generate_booking_code() RETURNS TEXT AS $$
BEGIN
  RETURN 'BK' || UPPER(SUBSTRING(CAST(gen_random_uuid() AS TEXT) FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate booking code
CREATE OR REPLACE FUNCTION set_booking_code() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.booking_code IS NULL THEN
    NEW.booking_code := generate_booking_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_booking_code 
  BEFORE INSERT ON public.bookings 
  FOR EACH ROW EXECUTE FUNCTION set_booking_code();
```

#### 4. Reviews Table
```sql
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) NOT NULL,
  listing_id UUID REFERENCES public.listings(id) NOT NULL,
  reviewer_id UUID REFERENCES public.user_profiles(id) NOT NULL,
  reviewee_id UUID REFERENCES public.user_profiles(id) NOT NULL,
  
  -- Review Content
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  title TEXT,
  comment TEXT,
  
  -- Category Ratings (for listings)
  cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  location_rating INTEGER CHECK (location_rating >= 1 AND location_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  
  -- Status
  is_public BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE, -- Only after completed booking
  
  -- Response
  host_response TEXT,
  host_responded_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure one review per booking per reviewer
CREATE UNIQUE INDEX idx_reviews_unique_booking_reviewer 
ON public.reviews(booking_id, reviewer_id);
```

#### 5. Messages Table (Stream Integration)
```sql
-- Simplified message logging for analytics, main chat handled by Stream
CREATE TABLE public.message_threads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id),
  listing_id UUID REFERENCES public.listings(id),
  participants UUID[] NOT NULL, -- Array of user IDs
  stream_channel_id TEXT NOT NULL, -- Stream channel ID
  stream_channel_type TEXT DEFAULT 'messaging',
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 6. Social Posts Table
```sql
CREATE TYPE post_type AS ENUM ('text', 'image', 'video', 'listing_share', 'trip_update');
CREATE TYPE post_status AS ENUM ('draft', 'published', 'archived', 'reported');

CREATE TABLE public.social_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES public.user_profiles(id) NOT NULL,
  
  -- Content
  content TEXT,
  post_type post_type DEFAULT 'text',
  media_urls JSONB, -- Array of media URLs
  
  -- Associated Content
  listing_id UUID REFERENCES public.listings(id), -- If sharing a listing
  booking_id UUID REFERENCES public.bookings(id), -- If trip update
  location JSONB, -- Location data if relevant
  
  -- Engagement
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  
  -- Stream Integration
  stream_activity_id TEXT, -- Stream activity ID for real-time updates
  
  -- Status
  status post_status DEFAULT 'published',
  visibility TEXT DEFAULT 'public', -- public, followers, private
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 7. Subscriptions Table (RevenueCat Integration)
```sql
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'trial', 'paused');
CREATE TYPE subscription_tier AS ENUM ('basic', 'premium', 'host_pro', 'enterprise');

CREATE TABLE public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) NOT NULL,
  
  -- RevenueCat Data
  revenue_cat_subscription_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  
  -- Subscription Details
  tier subscription_tier NOT NULL,
  status subscription_status NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  -- Billing
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  billing_period TEXT, -- monthly, yearly, etc.
  
  -- Features
  features JSONB, -- Available features for this subscription
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure one active subscription per user per product
CREATE UNIQUE INDEX idx_subscriptions_unique_active 
ON public.subscriptions(user_id, product_id) 
WHERE status = 'active';
```

### Supporting Tables

#### 8. Amenities Table
```sql
CREATE TABLE public.amenities (
  id TEXT PRIMARY KEY, -- wifi, pool, parking, etc.
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- basic, comfort, safety, etc.
  icon TEXT, -- Icon identifier
  description TEXT,
  listing_types TEXT[] -- Which listing types can have this amenity
);
```

#### 9. User Favorites Table
```sql
CREATE TABLE public.user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) NOT NULL,
  listing_id UUID REFERENCES public.listings(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, listing_id)
);
```

#### 10. Search History Table
```sql
CREATE TABLE public.search_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id),
  session_id TEXT, -- For anonymous users
  
  -- Search Parameters
  query TEXT,
  location TEXT,
  check_in DATE,
  check_out DATE,
  guests INTEGER,
  filters JSONB,
  
  -- Results
  results_count INTEGER DEFAULT 0,
  clicked_listings UUID[], -- Array of listing IDs clicked
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## TypeScript Types Generation

The schema will generate TypeScript types using Supabase CLI:

```bash
supabase gen types typescript --project-id <project-id> > src/types/database.ts
```

## Key Schema Features

### 1. **Multi-User Support**
- Single user table with role-based permissions
- Flexible user types (traveler, host, both)
- Comprehensive profile management

### 2. **Flexible Listing System**
- Supports accommodations, experiences, and services
- Rich location data with PostGIS
- Comprehensive pricing structure
- Advanced availability management

### 3. **Robust Booking System**
- Complete booking lifecycle management
- Detailed payment tracking
- Cancellation and refund support
- Communication thread linking

### 4. **Review & Rating System**
- Comprehensive review categories
- Verified reviews (post-stay)
- Host response capability
- Public/private review options

### 5. **Social Features Integration**
- Stream integration for real-time features
- Social posts with various content types
- Engagement tracking
- Activity feeds

### 6. **Subscription Management**
- RevenueCat integration
- Flexible subscription tiers
- Feature-based access control
- Billing period management

### 7. **Performance Optimization**
- Strategic indexes for common queries
- PostGIS for location-based searches
- JSONB for flexible data storage
- Optimized foreign key relationships

This schema provides a solid foundation for a comprehensive travel platform while maintaining flexibility for future enhancements.