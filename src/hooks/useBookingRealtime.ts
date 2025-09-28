import { RealtimeChannel } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase/client';
import { Booking } from '../types/database';

interface UseBookingRealtimeOptions {
  bookingId?: string;
  userId?: string;
  userRole?: 'guest' | 'host';
}

interface UseBookingRealtimeReturn {
  booking: Booking | null;
  loading: boolean;
  error: string | null;
}

export const useBookingRealtime = ({
  bookingId,
  userId,
  userRole,
}: UseBookingRealtimeOptions): UseBookingRealtimeReturn => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId && !userId) {
      setLoading(false);
      return;
    }

    let channel: RealtimeChannel;
    let isMounted = true;

    const setupSubscription = async () => {
      try {
        setLoading(true);
        setError(null);

        // First, fetch the initial data
        let query = supabase.from('bookings').select('*');

        if (bookingId) {
          query = query.eq('id', bookingId);
        } else if (userId && userRole) {
          query = query.eq(userRole === 'guest' ? 'guest_id' : 'host_id', userId);
        }

        const { data: initialData, error: fetchError } = await query.single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          throw fetchError;
        }

        if (isMounted) {
          setBooking(initialData || null);
          setLoading(false);
        }

        // Set up real-time subscription
        const channelName = bookingId ? `booking_${bookingId}` : `user_bookings_${userId}_${userRole}`;

        channel = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'bookings',
              ...(bookingId && { filter: `id=eq.${bookingId}` }),
              ...(userId && userRole && {
                filter: `${userRole === 'guest' ? 'guest_id' : 'host_id'}=eq.${userId}`
              }),
            },
            (payload) => {
              if (!isMounted) return;

              console.log('Booking real-time update:', payload);

              if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                setBooking(payload.new as Booking);
              } else if (payload.eventType === 'DELETE') {
                setBooking(null);
              }
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('Subscribed to booking changes');
            } else if (status === 'CHANNEL_ERROR') {
              if (isMounted) {
                setError('Failed to subscribe to booking updates');
              }
            } else if (status === 'TIMED_OUT') {
              if (isMounted) {
                setError('Subscription timed out');
              }
            } else if (status === 'CLOSED') {
              console.log('Booking subscription closed');
            }
          });

      } catch (err) {
        console.error('Error setting up booking subscription:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load booking');
          setLoading(false);
        }
      }
    };

    setupSubscription();

    // Cleanup function
    return () => {
      isMounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [bookingId, userId, userRole]);

  return { booking, loading, error };
};