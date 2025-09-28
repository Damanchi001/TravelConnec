import type { StripePaymentIntent } from '../../types';
import { supabase } from '../supabase/client';
import { STRIPE_CONFIG } from './client';

export interface CreatePaymentIntentParams {
  bookingId: string;
  amount: number;
  currency?: string;
  connectedAccountId?: string; // Host's Stripe connected account ID
  metadata?: Record<string, string>;
}

export interface ConfirmPaymentParams {
  paymentIntentId: string;
  paymentMethodId: string;
}

/**
 * Creates a payment intent for a booking with application fees for marketplace
 */
export const createPaymentIntent = async (params: CreatePaymentIntentParams): Promise<StripePaymentIntent> => {
  const { bookingId, amount, currency = STRIPE_CONFIG.currency, connectedAccountId, metadata } = params;

  try {
    // Call Supabase Edge Function to create payment intent server-side
    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: {
        bookingId,
        amount,
        currency,
        connectedAccountId,
        applicationFeePercent: STRIPE_CONFIG.applicationFeePercent,
        metadata: {
          booking_id: bookingId,
          ...metadata,
        },
      },
    });

    if (error) {
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }

    return data.paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

/**
 * Confirms a payment intent with a payment method
 */
export const confirmPaymentIntent = async (params: ConfirmPaymentParams): Promise<StripePaymentIntent> => {
  const { paymentIntentId, paymentMethodId } = params;

  try {
    // Call Supabase Edge Function to confirm payment
    const { data, error } = await supabase.functions.invoke('confirm-payment-intent', {
      body: {
        paymentIntentId,
        paymentMethodId,
      },
    });

    if (error) {
      throw new Error(`Failed to confirm payment: ${error.message}`);
    }

    return data.paymentIntent;
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};

/**
 * Retrieves payment intent status
 */
export const getPaymentIntent = async (paymentIntentId: string): Promise<StripePaymentIntent> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-payment-intent', {
      body: { paymentIntentId },
    });

    if (error) {
      throw new Error(`Failed to get payment intent: ${error.message}`);
    }

    return data.paymentIntent;
  } catch (error) {
    console.error('Error getting payment intent:', error);
    throw error;
  }
};

/**
 * Cancels a payment intent
 */
export const cancelPaymentIntent = async (paymentIntentId: string): Promise<StripePaymentIntent> => {
  try {
    const { data, error } = await supabase.functions.invoke('cancel-payment-intent', {
      body: { paymentIntentId },
    });

    if (error) {
      throw new Error(`Failed to cancel payment intent: ${error.message}`);
    }

    return data.paymentIntent;
  } catch (error) {
    console.error('Error canceling payment intent:', error);
    throw error;
  }
};

/**
 * Processes refund for a payment
 */
export const processRefund = async (
  paymentIntentId: string,
  amount?: number,
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
): Promise<any> => {
  try {
    const { data, error } = await supabase.functions.invoke('process-refund', {
      body: {
        paymentIntentId,
        amount,
        reason,
      },
    });

    if (error) {
      throw new Error(`Failed to process refund: ${error.message}`);
    }

    return data.refund;
  } catch (error) {
    console.error('Error processing refund:', error);
    throw error;
  }
};

/**
 * Calculates application fee amount
 */
export const calculateApplicationFee = (amount: number, feePercent: number = STRIPE_CONFIG.applicationFeePercent): number => {
  return Math.round(amount * (feePercent / 100));
};

/**
 * Calculates host payout amount after platform fees
 */
export const calculateHostPayout = (totalAmount: number, feePercent: number = STRIPE_CONFIG.applicationFeePercent): number => {
  const fee = calculateApplicationFee(totalAmount, feePercent);
  return totalAmount - fee;
};