import type { Payout } from '../../types';
import { supabase } from '../supabase/client';

export interface CreatePayoutParams {
  bookingId: string;
  hostId: string;
  amount: number;
  currency?: string;
  description?: string;
}

export interface ProcessPayoutParams {
  payoutId: string;
  force?: boolean; // Force payout even if requirements not met
}

/**
 * Creates a payout record for a booking
 */
export const createPayout = async (params: CreatePayoutParams): Promise<Payout> => {
  const { bookingId, hostId, amount, currency = 'usd', description } = params;

  try {
    const { data, error } = await supabase
      .from('payouts')
      .insert({
        booking_id: bookingId,
        host_id: hostId,
        amount,
        currency,
        status: 'pending',
        scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Schedule for tomorrow
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create payout: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error creating payout:', error);
    throw error;
  }
};

/**
 * Processes a scheduled payout
 */
export const processPayout = async (params: ProcessPayoutParams): Promise<Payout> => {
  const { payoutId, force = false } = params;

  try {
    // Get payout details
    const { data: payout, error: fetchError } = await supabase
      .from('payouts')
      .select(`
        *,
        bookings (
          host_id,
          stripe_connected_accounts (
            stripe_account_id,
            charges_enabled,
            payouts_enabled
          )
        )
      `)
      .eq('id', payoutId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch payout: ${fetchError.message}`);
    }

    if (payout.status !== 'pending') {
      throw new Error('Payout is not in pending status');
    }

    // Check if host's connected account is ready for payouts
    const connectedAccount = payout.bookings?.stripe_connected_accounts;
    if (!connectedAccount || !connectedAccount.charges_enabled || !connectedAccount.payouts_enabled) {
      if (!force) {
        throw new Error('Host connected account is not ready for payouts');
      }
    }

    // Call server-side function to process the transfer
    const { data, error } = await supabase.functions.invoke('process-payout', {
      body: {
        payoutId,
        stripeAccountId: connectedAccount.stripe_account_id,
        amount: payout.amount,
        currency: payout.currency,
      },
    });

    if (error) {
      // Update payout status to failed
      await supabase
        .from('payouts')
        .update({ status: 'failed' })
        .eq('id', payoutId);

      throw new Error(`Failed to process payout: ${error.message}`);
    }

    // Update payout with transfer ID and status
    const { data: updatedPayout, error: updateError } = await supabase
      .from('payouts')
      .update({
        stripe_transfer_id: data.transfer.id,
        status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('id', payoutId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update payout: ${updateError.message}`);
    }

    return updatedPayout;
  } catch (error) {
    console.error('Error processing payout:', error);
    throw error;
  }
};

/**
 * Gets payout by ID
 */
export const getPayoutById = async (payoutId: string): Promise<Payout> => {
  try {
    const { data, error } = await supabase
      .from('payouts')
      .select('*')
      .eq('id', payoutId)
      .single();

    if (error) {
      throw new Error(`Failed to get payout: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error getting payout by ID:', error);
    throw error;
  }
};

/**
 * Gets payouts for a host
 */
export const getHostPayouts = async (hostId: string): Promise<Payout[]> => {
  try {
    const { data, error } = await supabase
      .from('payouts')
      .select('*')
      .eq('host_id', hostId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get host payouts: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error getting host payouts:', error);
    throw error;
  }
};

/**
 * Gets pending payouts that are ready to be processed
 */
export const getPendingPayouts = async (): Promise<Payout[]> => {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('payouts')
      .select(`
        *,
        bookings (
          host_id,
          stripe_connected_accounts (
            stripe_account_id,
            charges_enabled,
            payouts_enabled
          )
        )
      `)
      .eq('status', 'pending')
      .lte('scheduled_at', now);

    if (error) {
      throw new Error(`Failed to get pending payouts: ${error.message}`);
    }

    // Filter payouts where host account is ready
    return (data || []).filter(payout =>
      payout.bookings?.stripe_connected_accounts?.charges_enabled &&
      payout.bookings?.stripe_connected_accounts?.payouts_enabled
    );
  } catch (error) {
    console.error('Error getting pending payouts:', error);
    throw error;
  }
};

/**
 * Cancels a pending payout
 */
export const cancelPayout = async (payoutId: string): Promise<Payout> => {
  try {
    const { data, error } = await supabase
      .from('payouts')
      .update({ status: 'failed' })
      .eq('id', payoutId)
      .eq('status', 'pending')
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to cancel payout: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error canceling payout:', error);
    throw error;
  }
};

/**
 * Processes all pending payouts (for cron job)
 */
export const processAllPendingPayouts = async (): Promise<{ processed: number; failed: number }> => {
  try {
    const pendingPayouts = await getPendingPayouts();
    let processed = 0;
    let failed = 0;

    for (const payout of pendingPayouts) {
      try {
        await processPayout({ payoutId: payout.id });
        processed++;
      } catch (error) {
        console.error(`Failed to process payout ${payout.id}:`, error);
        failed++;
      }
    }

    return { processed, failed };
  } catch (error) {
    console.error('Error processing all pending payouts:', error);
    throw error;
  }
};

/**
 * Gets payout statistics for a host
 */
export const getHostPayoutStats = async (hostId: string): Promise<{
  totalEarned: number;
  totalPaid: number;
  pendingAmount: number;
  nextPayoutDate?: string;
}> => {
  try {
    const payouts = await getHostPayouts(hostId);

    const stats = payouts.reduce(
      (acc, payout) => {
        if (payout.status === 'paid') {
          acc.totalPaid += payout.amount;
        } else if (payout.status === 'pending') {
          acc.pendingAmount += payout.amount;
          if (payout.scheduled_at && (!acc.nextPayoutDate || payout.scheduled_at < acc.nextPayoutDate)) {
            acc.nextPayoutDate = payout.scheduled_at;
          }
        }
        acc.totalEarned += payout.amount;
        return acc;
      },
      {
        totalEarned: 0,
        totalPaid: 0,
        pendingAmount: 0,
        nextPayoutDate: undefined as string | undefined,
      }
    );

    return stats;
  } catch (error) {
    console.error('Error getting host payout stats:', error);
    throw error;
  }
};