-- Base Database Schema for Travel App
-- Run this first in Supabase SQL Editor before applying migrations

-- Custom Types
CREATE TYPE user_role AS ENUM ('traveler', 'host', 'both', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'pending_verification');
CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');
CREATE TYPE listing_type AS ENUM ('accommodation', 'experience', 'service');
CREATE TYPE listing_status AS ENUM ('draft', 'active', 'inactive', 'suspended');
CREATE TYPE property_type AS ENUM ('house', 'apartment', 'villa', 'cabin', 'hotel_room', 'unique');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'partially_refunded');
CREATE TYPE post_type AS ENUM ('text', 'image', 'video', 'listing_share', 'trip_update');
CREATE TYPE post_status AS ENUM ('draft', 'published', 'archived', 'reported');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'trial', 'paused');
CREATE TYPE subscription_tier AS ENUM ('basic', 'premium', 'host_pro', 'enterprise');
CREATE TYPE calendar_rule_type AS ENUM ('pricing', 'minimum_stay', 'maximum_stay', 'blocked', 'available');

-- Core Tables

-- Users Table (Enhanced from Supabase Auth)
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

-- Listings Table
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

-- Indexes for listings
CREATE INDEX idx_listings_host_id ON public.listings(host_id);
CREATE INDEX idx_listings_location ON public.listings USING GIST(coordinates);
CREATE INDEX idx_listings_type_status ON public.listings(listing_type, status);
CREATE INDEX idx_listings_price ON public.listings(base_price);

-- Bookings Table
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

  -- Payment & Process Tracking
  escrow_id UUID, -- Will add FK constraint later
  check_in_id UUID, -- Will add FK constraint later
  payout_id UUID, -- Will add FK constraint later

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

-- Payments Table
CREATE TABLE public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) NOT NULL,
  stripe_payment_intent_id TEXT NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  platform_fee DECIMAL(10,2) NOT NULL,
  host_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX idx_payments_stripe_payment_intent_id ON public.payments(stripe_payment_intent_id);

-- Escrow Table
CREATE TABLE public.escrow (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) NOT NULL UNIQUE,
  status TEXT DEFAULT 'held' CHECK (status IN ('held', 'released', 'disputed')),
  held_amount DECIMAL(10,2) NOT NULL,
  released_amount DECIMAL(10,2) DEFAULT 0,
  release_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_escrow_booking_id ON public.escrow(booking_id);

-- Check-ins Table
CREATE TABLE public.check_ins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) NOT NULL UNIQUE,
  checked_in_at TIMESTAMPTZ NOT NULL,
  checked_in_by UUID REFERENCES public.user_profiles(id) NOT NULL,
  method TEXT DEFAULT 'self' CHECK (method IN ('self', 'host', 'code')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_check_ins_booking_id ON public.check_ins(booking_id);

-- Payouts Table
CREATE TABLE public.payouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) NOT NULL UNIQUE,
  host_id UUID REFERENCES public.user_profiles(id) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  stripe_transfer_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  scheduled_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payouts_booking_id ON public.payouts(booking_id);
CREATE INDEX idx_payouts_host_id ON public.payouts(host_id);
CREATE INDEX idx_payouts_status ON public.payouts(status);

-- Reviews Table
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

-- Messages Table (Stream Integration)
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

-- Social Posts Table
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

-- Followers Table
CREATE TABLE public.followers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES public.user_profiles(id) NOT NULL,
  following_id UUID REFERENCES public.user_profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure a user can't follow themselves
  CHECK (follower_id != following_id),

  -- Ensure unique follow relationships
  UNIQUE(follower_id, following_id)
);

-- Indexes for performance
CREATE INDEX idx_followers_follower_id ON public.followers(follower_id);
CREATE INDEX idx_followers_following_id ON public.followers(following_id);
CREATE INDEX idx_followers_created_at ON public.followers(created_at DESC);

-- Function to get followers count for a user
CREATE OR REPLACE FUNCTION get_followers_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.followers
    WHERE following_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get following count for a user
CREATE OR REPLACE FUNCTION get_following_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM public.followers
    WHERE follower_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql;

-- Function to check if user A follows user B
CREATE OR REPLACE FUNCTION is_following(follower_uuid UUID, following_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.followers
    WHERE follower_id = follower_uuid AND following_id = following_uuid
  );
END;
$$ LANGUAGE plpgsql;

-- Subscriptions Table (RevenueCat Integration)
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

-- Supporting Tables

-- Amenities Table
CREATE TABLE public.amenities (
  id TEXT PRIMARY KEY, -- wifi, pool, parking, etc.
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- basic, comfort, safety, etc.
  icon TEXT, -- Icon identifier
  description TEXT,
  listing_types TEXT[] -- Which listing types can have this amenity
);

-- User Favorites Table
CREATE TABLE public.user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) NOT NULL,
  listing_id UUID REFERENCES public.listings(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, listing_id)
);

-- Search History Table
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

-- Listing Analytics Table
CREATE TABLE public.listing_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES public.listings(id) NOT NULL,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  bookings INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  occupancy_rate DECIMAL(5,2) DEFAULT 0, -- Percentage of available nights booked
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(listing_id, date)
);

-- Indexes for listing analytics
CREATE INDEX idx_listing_analytics_listing_id ON public.listing_analytics(listing_id);
CREATE INDEX idx_listing_analytics_date ON public.listing_analytics(date);
CREATE INDEX idx_listing_analytics_listing_date ON public.listing_analytics(listing_id, date DESC);

-- Call Logs Table
CREATE TABLE public.call_logs (
  id TEXT PRIMARY KEY,
  caller_id UUID REFERENCES public.user_profiles(id) NOT NULL,
  callee_id UUID REFERENCES public.user_profiles(id) NOT NULL,
  type TEXT DEFAULT 'voice' CHECK (type IN ('voice', 'video')),
  status TEXT DEFAULT 'ended' CHECK (status IN ('ringing', 'accepted', 'rejected', 'ended', 'missed')),
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  duration INTEGER, -- Duration in seconds
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure calls are between different users
  CHECK (caller_id != callee_id)
);

-- Indexes for call logs
CREATE INDEX idx_call_logs_caller_id ON public.call_logs(caller_id);
CREATE INDEX idx_call_logs_callee_id ON public.call_logs(callee_id);
CREATE INDEX idx_call_logs_created_at ON public.call_logs(created_at DESC);
CREATE INDEX idx_call_logs_status ON public.call_logs(status);

-- Host Earnings Summary Table
CREATE TABLE public.host_earnings_summary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID REFERENCES public.user_profiles(id) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_type TEXT DEFAULT 'monthly' CHECK (period_type IN ('daily', 'weekly', 'monthly', 'yearly')),
  total_bookings INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  total_payouts DECIMAL(10,2) DEFAULT 0,
  pending_payouts DECIMAL(10,2) DEFAULT 0,
  platform_fees DECIMAL(10,2) DEFAULT 0,
  net_earnings DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(host_id, period_start, period_end, period_type)
);

-- Indexes for host earnings
CREATE INDEX idx_host_earnings_host_id ON public.host_earnings_summary(host_id);
CREATE INDEX idx_host_earnings_period ON public.host_earnings_summary(period_start, period_end);
CREATE INDEX idx_host_earnings_host_period ON public.host_earnings_summary(host_id, period_type, period_end DESC);

-- Calendar Rules Table
CREATE TABLE public.calendar_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES public.listings(id) NOT NULL,
  rule_type calendar_rule_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  value JSONB, -- Flexible storage for rule values (price, min_stay, etc.)
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern TEXT, -- 'weekly', 'monthly', 'yearly'
  recurrence_end_date DATE,
  notes TEXT,
  created_by UUID REFERENCES public.user_profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Note: Exclusion constraint for date ranges removed due to operator class limitations
  -- Consider adding application-level validation instead
);

-- Indexes for calendar rules
CREATE INDEX idx_calendar_rules_listing_id ON public.calendar_rules(listing_id);
CREATE INDEX idx_calendar_rules_dates ON public.calendar_rules(start_date, end_date);
CREATE INDEX idx_calendar_rules_type ON public.calendar_rules(rule_type);
CREATE INDEX idx_calendar_rules_listing_type ON public.calendar_rules(listing_id, rule_type);

-- Add foreign key constraints that were deferred
ALTER TABLE public.bookings ADD CONSTRAINT fk_bookings_escrow_id FOREIGN KEY (escrow_id) REFERENCES public.escrow(id);
ALTER TABLE public.bookings ADD CONSTRAINT fk_bookings_check_in_id FOREIGN KEY (check_in_id) REFERENCES public.check_ins(id);
ALTER TABLE public.bookings ADD CONSTRAINT fk_bookings_payout_id FOREIGN KEY (payout_id) REFERENCES public.payouts(id);