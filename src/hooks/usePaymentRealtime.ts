import { RealtimeChannel } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase/client';
import { Payment } from '../types/database';

interface UsePaymentRealtimeOptions {
  bookingId?: string;
  paymentId?: string;
}

interface UsePaymentRealtimeReturn {
  payment: Payment | null;
  payments: Payment[];
  loading: boolean;
  error: string | null;
}

export const usePaymentRealtime = ({
  bookingId,
  paymentId,
}: UsePaymentRealtimeOptions): UsePaymentRealtimeReturn => {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId && !paymentId) {
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
        let query = supabase.from('payments').select('*');

        if (paymentId) {
          query = query.eq('id', paymentId);
        } else if (bookingId) {
          query = query.eq('booking_id', bookingId);
        }

        const { data: initialData, error: fetchError } = await query;

        if (fetchError) {
          throw fetchError;
        }

        if (isMounted) {
          if (paymentId && initialData && initialData.length > 0) {
            setPayment(initialData[0]);
          } else {
            setPayments(initialData || []);
          }
          setLoading(false);
        }

        // Set up real-time subscription
        const channelName = paymentId ? `payment_${paymentId}` : `booking_payments_${bookingId}`;

        channel = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'payments',
              ...(paymentId && { filter: `id=eq.${paymentId}` }),
              ...(bookingId && { filter: `booking_id=eq.${bookingId}` }),
            },
            (payload) => {
              if (!isMounted) return;

              console.log('Payment real-time update:', payload);

              if (payload.eventType === 'INSERT') {
                if (paymentId) {
                  setPayment(payload.new as Payment);
                } else {
                  setPayments(prev => [...prev, payload.new as Payment]);
                }
              } else if (payload.eventType === 'UPDATE') {
                if (paymentId) {
                  setPayment(payload.new as Payment);
                } else {
                  setPayments(prev =>
                    prev.map(p => p.id === payload.new.id ? payload.new as Payment : p)
                  );
                }
              } else if (payload.eventType === 'DELETE') {
                if (paymentId) {
                  setPayment(null);
                } else {
                  setPayments(prev => prev.filter(p => p.id !== payload.old.id));
                }
              }
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('Subscribed to payment changes');
            } else if (status === 'CHANNEL_ERROR') {
              if (isMounted) {
                setError('Failed to subscribe to payment updates');
              }
            } else if (status === 'TIMED_OUT') {
              if (isMounted) {
                setError('Payment subscription timed out');
              }
            } else if (status === 'CLOSED') {
              console.log('Payment subscription closed');
            }
          });

      } catch (err) {
        console.error('Error setting up payment subscription:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load payment');
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
  }, [bookingId, paymentId]);

  return { payment, payments, loading, error };
};