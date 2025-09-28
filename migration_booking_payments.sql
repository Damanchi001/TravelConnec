-- Migration: Extend database schema for booking payments, escrow, check-in, and payouts
-- This migration adds support for Stripe Connect integration in the marketplace

-- Create payments table for detailed payment tracking
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

-- Create escrow table for fund holding
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

-- Create check_ins table for check-in records
CREATE TABLE public.check_ins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) NOT NULL UNIQUE,
  checked_in_at TIMESTAMPTZ NOT NULL,
  checked_in_by UUID REFERENCES public.user_profiles(id) NOT NULL,
  method TEXT DEFAULT 'self' CHECK (method IN ('self', 'host', 'code')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payouts table for host payouts
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

-- Add foreign key columns to bookings table
ALTER TABLE public.bookings ADD COLUMN escrow_id UUID REFERENCES public.escrow(id);
ALTER TABLE public.bookings ADD COLUMN check_in_id UUID REFERENCES public.check_ins(id);
ALTER TABLE public.bookings ADD COLUMN payout_id UUID REFERENCES public.payouts(id);

-- Create indexes for performance
CREATE INDEX idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX idx_payments_stripe_payment_intent_id ON public.payments(stripe_payment_intent_id);
CREATE INDEX idx_escrow_booking_id ON public.escrow(booking_id);
CREATE INDEX idx_check_ins_booking_id ON public.check_ins(booking_id);
CREATE INDEX idx_payouts_booking_id ON public.payouts(booking_id);
CREATE INDEX idx_payouts_host_id ON public.payouts(host_id);
CREATE INDEX idx_payouts_status ON public.payouts(status);

-- Update trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_escrow_updated_at BEFORE UPDATE ON public.escrow FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payouts_updated_at BEFORE UPDATE ON public.payouts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();