import type { Escrow } from '../../types';
import { supabase } from '../supabase/client';

export interface CreateEscrowParams {
  bookingId: string;
  heldAmount: number;
  releaseDate?: string;
}

export interface UpdateEscrowParams {
  escrowId: string;
  updates: Partial<Escrow>;
}

export interface ReleaseEscrowParams {
  escrowId: string;
  releaseAmount?: number;
  reason?: string;
}

/**
 * Creates an escrow record for a booking
 */
export const createEscrow = async (params: CreateEscrowParams): Promise<Escrow> => {
  const { bookingId, heldAmount, releaseDate } = params;

  try {
    const { data, error } = await supabase
      .from('escrow')
      .insert({
        booking_id: bookingId,
        status: 'held',
        held_amount: heldAmount,
        released_amount: 0,
        release_date: releaseDate,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create escrow: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error creating escrow:', error);
    throw error;
  }
};

/**
 * Gets escrow by booking ID
 */
export const getEscrowByBookingId = async (bookingId: string): Promise<Escrow | null> => {
  try {
    const { data, error } = await supabase
      .from('escrow')
      .select('*')
      .eq('booking_id', bookingId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error getting escrow by booking ID:', error);
    throw error;
  }
};

/**
 * Gets escrow by ID
 */
export const getEscrowById = async (escrowId: string): Promise<Escrow> => {
  try {
    const { data, error } = await supabase
      .from('escrow')
      .select('*')
      .eq('id', escrowId)
      .single();

    if (error) {
      throw new Error(`Failed to get escrow: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error getting escrow by ID:', error);
    throw error;
  }
};

/**
 * Releases escrow funds (full or partial)
 */
export const releaseEscrow = async (params: ReleaseEscrowParams): Promise<Escrow> => {
  const { escrowId, releaseAmount, reason } = params;

  try {
    // Get current escrow
    const escrow = await getEscrowById(escrowId);

    if (escrow.status === 'released') {
      throw new Error('Escrow has already been released');
    }

    const amountToRelease = releaseAmount || escrow.held_amount;
    const newReleasedAmount = escrow.released_amount + amountToRelease;
    const remainingAmount = escrow.held_amount - newReleasedAmount;

    // Determine new status
    const newStatus = remainingAmount <= 0 ? 'released' : 'held';

    const { data, error } = await supabase
      .from('escrow')
      .update({
        status: newStatus,
        released_amount: newReleasedAmount,
        release_date: new Date().toISOString(),
      })
      .eq('id', escrowId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to release escrow: ${error.message}`);
    }

    // Call server-side function to process the actual transfer
    if (newStatus === 'released') {
      await supabase.functions.invoke('release-escrow-funds', {
        body: {
          escrowId,
          amount: amountToRelease,
          reason,
        },
      });
    }

    return data;
  } catch (error) {
    console.error('Error releasing escrow:', error);
    throw error;
  }
};

/**
 * Disputs an escrow (holds funds due to dispute)
 */
export const disputeEscrow = async (escrowId: string, reason: string): Promise<Escrow> => {
  try {
    const { data, error } = await supabase
      .from('escrow')
      .update({
        status: 'disputed',
      })
      .eq('id', escrowId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to dispute escrow: ${error.message}`);
    }

    // Notify relevant parties about the dispute
    await supabase.functions.invoke('notify-escrow-dispute', {
      body: {
        escrowId,
        reason,
      },
    });

    return data;
  } catch (error) {
    console.error('Error disputing escrow:', error);
    throw error;
  }
};

/**
 * Updates escrow information
 */
export const updateEscrow = async (params: UpdateEscrowParams): Promise<Escrow> => {
  const { escrowId, updates } = params;

  try {
    const { data, error } = await supabase
      .from('escrow')
      .update(updates)
      .eq('id', escrowId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update escrow: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error updating escrow:', error);
    throw error;
  }
};

/**
 * Gets all escrows for a user (as host or guest)
 */
export const getUserEscrows = async (userId: string): Promise<Escrow[]> => {
  try {
    const { data, error } = await supabase
      .from('escrow')
      .select(`
        *,
        bookings!inner (
          guest_id,
          host_id
        )
      `)
      .or(`guest_id.eq.${userId},host_id.eq.${userId}`);

    if (error) {
      throw new Error(`Failed to get user escrows: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error getting user escrows:', error);
    throw error;
  }
};

/**
 * Automatically releases escrow based on check-in completion
 */
export const autoReleaseEscrow = async (bookingId: string): Promise<Escrow | null> => {
  try {
    const escrow = await getEscrowByBookingId(bookingId);

    if (!escrow || escrow.status !== 'held') {
      return null;
    }

    // Check if booking is completed (check-in exists and is completed)
    const { data: checkIn } = await supabase
      .from('check_ins')
      .select('*')
      .eq('booking_id', bookingId)
      .single();

    if (!checkIn) {
      return null; // No check-in yet
    }

    // Auto-release after 24 hours of successful check-in
    const checkInTime = new Date(checkIn.checked_in_at);
    const autoReleaseTime = new Date(checkInTime.getTime() + 24 * 60 * 60 * 1000); // 24 hours later
    const now = new Date();

    if (now >= autoReleaseTime) {
      return await releaseEscrow({
        escrowId: escrow.id,
        reason: 'Automatic release after successful check-in',
      });
    }

    return null;
  } catch (error) {
    console.error('Error auto-releasing escrow:', error);
    throw error;
  }
};