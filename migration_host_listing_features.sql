-- Migration: Add tables for host listing features - analytics, earnings summary, and calendar rules
-- This migration adds support for advanced host dashboard functionality

-- Create listing_analytics table for pre-calculated analytics data
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

-- Create host_earnings_summary table for aggregated earnings data
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

-- Create calendar_rules table for advanced calendar management
CREATE TYPE calendar_rule_type AS ENUM ('pricing', 'minimum_stay', 'maximum_stay', 'blocked', 'available');

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

  -- Ensure date ranges don't overlap for the same rule type and listing
  EXCLUDE (listing_id WITH =, rule_type WITH =, daterange(start_date, end_date, '[]') WITH &&)
  WHERE (is_recurring = FALSE)
);

-- Indexes for performance
CREATE INDEX idx_listing_analytics_listing_id ON public.listing_analytics(listing_id);
CREATE INDEX idx_listing_analytics_date ON public.listing_analytics(date);
CREATE INDEX idx_listing_analytics_listing_date ON public.listing_analytics(listing_id, date DESC);

CREATE INDEX idx_host_earnings_host_id ON public.host_earnings_summary(host_id);
CREATE INDEX idx_host_earnings_period ON public.host_earnings_summary(period_start, period_end);
CREATE INDEX idx_host_earnings_host_period ON public.host_earnings_summary(host_id, period_type, period_end DESC);

CREATE INDEX idx_calendar_rules_listing_id ON public.calendar_rules(listing_id);
CREATE INDEX idx_calendar_rules_dates ON public.calendar_rules(start_date, end_date);
CREATE INDEX idx_calendar_rules_type ON public.calendar_rules(rule_type);
CREATE INDEX idx_calendar_rules_listing_type ON public.calendar_rules(listing_id, rule_type);

-- Update triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_listing_analytics_updated_at BEFORE UPDATE ON public.listing_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_host_earnings_updated_at BEFORE UPDATE ON public.host_earnings_summary FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_calendar_rules_updated_at BEFORE UPDATE ON public.calendar_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE public.listing_analytics IS 'Pre-calculated analytics data for listings to improve dashboard performance';
COMMENT ON TABLE public.host_earnings_summary IS 'Aggregated earnings data for hosts by time periods';
COMMENT ON TABLE public.calendar_rules IS 'Advanced calendar rules for pricing, availability, and stay restrictions';

COMMENT ON COLUMN public.calendar_rules.value IS 'Flexible JSON storage for rule values: {price: 150} for pricing, {min_stay: 3} for minimum stay, etc.';
COMMENT ON COLUMN public.calendar_rules.recurrence_pattern IS 'Pattern for recurring rules: weekly, monthly, yearly';