import { RealtimeChannel } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase/client';
import { Escrow } from '../types/database';

interface UseEscrowRealtimeOptions {
  bookingId?: string;
  escrowId?: string;
}

interface UseEscrowRealtimeReturn {
  escrow: Escrow | null;
  loading: boolean;
  error: string | null;
}

export const useEscrowRealtime = ({
  bookingId,
  escrowId,
}: UseEscrowRealtimeOptions): UseEscrowRealtimeReturn => {
  const [escrow, setEscrow] = useState<Escrow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId && !escrowId) {
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
        let query = supabase.from('escrow').select('*');

        if (escrowId) {
          query = query.eq('id', escrowId);
        } else if (bookingId) {
          query = query.eq('booking_id', bookingId);
        }

        const { data: initialData, error: fetchError } = await query.single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          throw fetchError;
        }

        if (isMounted) {
          setEscrow(initialData || null);
          setLoading(false);
        }

        // Set up real-time subscription
        const channelName = escrowId ? `escrow_${escrowId}` : `booking_escrow_${bookingId}`;

        channel = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'escrow',
              ...(escrowId && { filter: `id=eq.${escrowId}` }),
              ...(bookingId && { filter: `booking_id=eq.${bookingId}` }),
            },
            (payload) => {
              if (!isMounted) return;

              console.log('Escrow real-time update:', payload);

              if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                setEscrow(payload.new as Escrow);
              } else if (payload.eventType === 'DELETE') {
                setEscrow(null);
              }
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('Subscribed to escrow changes');
            } else if (status === 'CHANNEL_ERROR') {
              if (isMounted) {
                setError('Failed to subscribe to escrow updates');
              }
            } else if (status === 'TIMED_OUT') {
              if (isMounted) {
                setError('Escrow subscription timed out');
              }
            } else if (status === 'CLOSED') {
              console.log('Escrow subscription closed');
            }
          });

      } catch (err) {
        console.error('Error setting up escrow subscription:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load escrow');
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
  }, [bookingId, escrowId]);

  return { escrow, loading, error };
};