import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../services/supabase/client';

export interface Listing {
  id: string;
  host_id: string;
  title: string;
  description?: string;
  listing_type: 'experience' | 'service';
  category?: string;
  address: {
    street?: string;
    city: string;
    state?: string;
    country: string;
    postal_code?: string;
  };
  coordinates: string; // PostGIS POINT format like '(longitude,latitude)'
  base_price: number;
  currency: string;
  price_per: string;
  max_guests: number;
  images: Array<{
    url: string;
    caption: string;
    order: number;
  }>; // JSONB format as per schema
  status: 'active' | 'draft' | 'inactive';
  available_from: string;
  available_to?: string;
  features?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const useHostListings = (hostId: string) => {
  return useQuery({
    queryKey: ['host-listings', hostId],
    queryFn: async (): Promise<Listing[]> => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('host_id', hostId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Listing[];
    },
    enabled: !!hostId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useListingById = (listingId: string) => {
  return useQuery({
    queryKey: ['listing', listingId],
    queryFn: async (): Promise<Listing> => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .single();

      if (error) throw error;
      return data as Listing;
    },
    enabled: !!listingId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};