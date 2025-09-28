import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase/client';
import { Booking } from '../types/database';
import { parseBookingError } from '../utils/bookingErrorUtils';

interface UseBookingsOptions {
  userId?: string;
  userRole: 'guest' | 'host';
  status?: 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'refunded';
  sortBy?: 'check_in' | 'created_at' | 'total_amount';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export const useBookings = (options: UseBookingsOptions) => {
  const {
    userId,
    userRole,
    status = 'all',
    sortBy = 'check_in',
    sortOrder = 'desc',
    limit = 50,
    offset = 0,
  } = options;

  const query = useQuery({
    queryKey: ['bookings', userId, userRole, status, sortBy, sortOrder, limit, offset],
    queryFn: async () => {
      if (!userId) return [];

      let query = supabase
        .from('bookings')
        .select(`
          *,
          listing:listings(
            id,
            title,
            images,
            address,
            host_id
          ),
          guest:user_profiles!guest_id(
            id,
            first_name,
            last_name,
            avatar_url
          ),
          host:user_profiles!host_id(
            id,
            first_name,
            last_name,
            avatar_url
          )
        `);

      // Filter by user role
      if (userRole === 'guest') {
        query = query.eq('guest_id', userId);
      } else {
        query = query.eq('host_id', userId);
      }

      // Filter by status
      if (status !== 'all') {
        query = query.eq('status', status);
      }

      // Sort
      const sortColumn = sortBy === 'check_in' ? 'check_in' : sortBy === 'total_amount' ? 'total_amount' : 'created_at';
      query = query.order(sortColumn, { ascending: sortOrder === 'asc' });

      // Pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data as (Booking & {
        listing: any;
        guest: any;
        host: any;
      })[];
    },
    enabled: !!userId,
  });

  return {
    bookings: query.data || [],
    loading: query.isLoading,
    error: query.error ? parseBookingError(query.error) : null,
    refetch: query.refetch,
  };
};

export const useBookingDetails = (bookingId: string) => {
  const query = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          listing:listings(
            id,
            title,
            description,
            images,
            address,
            amenities,
            host_id
          ),
          guest:user_profiles!guest_id(
            id,
            first_name,
            last_name,
            avatar_url,
            phone
          ),
          host:user_profiles!host_id(
            id,
            first_name,
            last_name,
            avatar_url,
            phone
          ),
          payments(*),
          reviews(*)
        `)
        .eq('id', bookingId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    enabled: !!bookingId,
  });

  return {
    ...query,
    error: query.error ? parseBookingError(query.error) : null,
  };
};