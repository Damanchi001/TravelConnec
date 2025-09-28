import { createBookingError } from '../../utils/bookingErrorUtils';
import { NotificationService } from '../notifications';
import { processRefund } from '../stripe/payments';
import { supabase } from '../supabase/client';

export interface CancellationPolicy {
  id: string;
  name: string;
  description: string;
  refundPercentage: number;
  deadlineDays: number; // Days before check-in when cancellation is allowed
  conditions: string[];
}

export interface CancellationRequest {
  bookingId: string;
  reason: string;
  cancelledBy: 'guest' | 'host';
  userId: string;
}

export interface RefundCalculation {
  originalAmount: number;
  refundAmount: number;
  refundPercentage: number;
  platformFee: number;
  hostAmount: number;
  refundableAmount: number;
  policy: CancellationPolicy;
}

// Standard cancellation policies (similar to Airbnb)
export const CANCELLATION_POLICIES: Record<string, CancellationPolicy> = {
  flexible: {
    id: 'flexible',
    name: 'Flexible',
    description: 'Full refund up to 24 hours before check-in',
    refundPercentage: 100,
    deadlineDays: 1,
    conditions: [
      'Full refund if cancelled 24+ hours before check-in',
      '50% refund if cancelled within 24 hours of check-in',
      'No refund for no-shows'
    ]
  },
  moderate: {
    id: 'moderate',
    name: 'Moderate',
    description: 'Full refund up to 5 days before check-in',
    refundPercentage: 100,
    deadlineDays: 5,
    conditions: [
      'Full refund if cancelled 5+ days before check-in',
      '50% refund if cancelled 1-5 days before check-in',
      'No refund if cancelled within 24 hours of check-in'
    ]
  },
  strict: {
    id: 'strict',
    name: 'Strict',
    description: '50% refund up to 7 days before check-in',
    refundPercentage: 50,
    deadlineDays: 7,
    conditions: [
      '50% refund if cancelled 7+ days before check-in',
      'No refund if cancelled within 7 days of check-in'
    ]
  },
  no_refund: {
    id: 'no_refund',
    name: 'No Refund',
    description: 'No refunds for cancellations',
    refundPercentage: 0,
    deadlineDays: 0,
    conditions: [
      'No refunds for any cancellations'
    ]
  }
};

/**
 * Calculate refund amount based on cancellation policy and timing
 */
export const calculateRefund = async (
  bookingId: string,
  cancellationDate: Date = new Date()
): Promise<RefundCalculation> => {
  // Get booking details with payment information
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select(`
      *,
      listing:listings(*),
      payments(*)
    `)
    .eq('id', bookingId)
    .single();

  if (bookingError || !booking) {
    throw createBookingError('BOOKING_NOT_FOUND', 'Booking not found');
  }

  if (!booking.payments || booking.payments.length === 0) {
    throw createBookingError('BOOKING_NOT_FOUND', 'No payment found for booking');
  }

  const payment = booking.payments[0];
  const checkInDate = new Date(booking.check_in);
  const daysUntilCheckIn = Math.ceil((checkInDate.getTime() - cancellationDate.getTime()) / (1000 * 60 * 60 * 24));

  // Get listing's cancellation policy (default to flexible if not specified)
  const policyId = booking.listing?.cancellation_policy || 'flexible';
  const policy = CANCELLATION_POLICIES[policyId] || CANCELLATION_POLICIES.flexible;

  let refundPercentage = 0;

  // Calculate refund percentage based on policy and timing
  if (policyId === 'flexible') {
    if (daysUntilCheckIn >= 1) {
      refundPercentage = 100;
    } else if (daysUntilCheckIn >= 0) {
      refundPercentage = 50;
    }
  } else if (policyId === 'moderate') {
    if (daysUntilCheckIn >= 5) {
      refundPercentage = 100;
    } else if (daysUntilCheckIn >= 1) {
      refundPercentage = 50;
    }
  } else if (policyId === 'strict') {
    if (daysUntilCheckIn >= 7) {
      refundPercentage = 50;
    }
  }
  // no_refund policy has 0% refund

  const originalAmount = payment.amount;
  const refundAmount = Math.round((originalAmount * refundPercentage) / 100);
  const platformFee = payment.platform_fee || 0;
  const hostAmount = payment.host_amount || 0;

  // Refundable amount is the portion that was actually paid (excluding platform fees that are non-refundable)
  const refundableAmount = Math.min(refundAmount, originalAmount - platformFee);

  return {
    originalAmount,
    refundAmount,
    refundPercentage,
    platformFee,
    hostAmount,
    refundableAmount,
    policy
  };
};

/**
 * Cancel a booking with refund processing
 */
export const cancelBooking = async (request: CancellationRequest): Promise<{
  success: boolean;
  refundAmount?: number;
  refundId?: string;
  error?: string;
}> => {
  const { bookingId, reason, cancelledBy, userId } = request;

  try {
    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        listing:listings(title, host_id),
        guest:user_profiles!guest_id(first_name, last_name, email),
        host:user_profiles!host_id(first_name, last_name, email),
        payments(*)
      `)
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      throw createBookingError('BOOKING_NOT_FOUND', 'Booking not found');
    }

    // Verify user has permission to cancel
    if (cancelledBy === 'guest' && booking.guest_id !== userId) {
      throw createBookingError('FORBIDDEN', 'Only the guest can cancel this booking');
    }
    if (cancelledBy === 'host' && booking.host_id !== userId) {
      throw createBookingError('FORBIDDEN', 'Only the host can cancel this booking');
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      throw createBookingError('BOOKING_CANNOT_CANCEL', 'Booking cannot be cancelled');
    }

    // Calculate refund
    const refundCalculation = await calculateRefund(bookingId);

    // Start transaction
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
        cancelled_by: userId,
        cancelled_at: new Date().toISOString(),
        refunded_amount: refundCalculation.refundableAmount
      })
      .eq('id', bookingId);

    if (updateError) {
      throw new Error(`Failed to update booking: ${updateError.message}`);
    }

    let refundId: string | undefined;

    // Process refund if applicable
    if (refundCalculation.refundableAmount > 0 && booking.payments?.[0]) {
      try {
        const payment = booking.payments[0];
        const refund = await processRefund(
          payment.stripe_payment_intent_id,
          refundCalculation.refundableAmount,
          'requested_by_customer'
        );
        refundId = refund.id;

        // Update payment status
        await supabase
          .from('payments')
          .update({
            status: refundCalculation.refundableAmount === payment.amount ? 'refunded' : 'partially_refunded'
          })
          .eq('id', payment.id);

      } catch (refundError) {
        console.error('Refund processing failed:', refundError);
        // Don't fail the cancellation if refund fails, but log it
      }
    }

    // Update escrow status if exists
    if (booking.escrow_id) {
      await supabase
        .from('escrow')
        .update({ status: 'released' })
        .eq('id', booking.escrow_id);
    }

    // Send notifications
    const listingTitle = booking.listing?.title || 'Property';

    // Notify both parties about the cancellation
    NotificationService.createCancellationNotification(
      bookingId,
      listingTitle,
      refundCalculation.refundableAmount,
      booking.currency,
      cancelledBy
    );

    // If refund was processed, send additional refund notification
    if (refundCalculation.refundableAmount > 0) {
      // Notify the party receiving the refund
      if (cancelledBy === 'guest') {
        NotificationService.createRefundProcessedNotification(
          bookingId,
          listingTitle,
          refundCalculation.refundableAmount,
          booking.currency
        );
      }
    }

    return {
      success: true,
      refundAmount: refundCalculation.refundableAmount,
      refundId
    };

  } catch (error) {
    console.error('Error cancelling booking:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Get cancellation policy for a listing
 */
export const getCancellationPolicy = (policyId: string): CancellationPolicy => {
  return CANCELLATION_POLICIES[policyId] || CANCELLATION_POLICIES.flexible;
};

/**
 * Check if booking can be cancelled
 */
export const canCancelBooking = (booking: any, userId: string, userRole: 'guest' | 'host'): boolean => {
  if (booking.status === 'cancelled' || booking.status === 'completed') {
    return false;
  }

  if (userRole === 'guest' && booking.guest_id !== userId) {
    return false;
  }

  if (userRole === 'host' && booking.host_id !== userId) {
    return false;
  }

  return true;
};