-- Migration: Add cancellation policy to listings table
-- This migration adds support for different cancellation policies per listing

-- Add cancellation_policy column to listings table
ALTER TABLE public.listings
ADD COLUMN cancellation_policy TEXT DEFAULT 'flexible'
CHECK (cancellation_policy IN ('flexible', 'moderate', 'strict', 'no_refund'));

-- Add comment for documentation
COMMENT ON COLUMN public.listings.cancellation_policy IS 'Cancellation policy for the listing: flexible, moderate, strict, or no_refund';

-- Create index for performance if needed
CREATE INDEX IF NOT EXISTS idx_listings_cancellation_policy ON public.listings(cancellation_policy);