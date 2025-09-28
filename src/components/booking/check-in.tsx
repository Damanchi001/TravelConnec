import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../../../components/themed-text';
import { ThemedView } from '../../../components/themed-view';
import { Colors } from '../../../constants/colors';
import { releaseEscrow } from '../../services/stripe/escrow';
import { supabase } from '../../services/supabase/client';
import { useAuthStore } from '../../stores/auth-store';

interface CheckInProps {
  booking: {
    id: string;
    check_in: string;
    guest_id: string;
    host_id: string;
    escrow_id?: string;
  };
  onCheckInComplete?: () => void;
}

export const CheckIn: React.FC<CheckInProps> = ({ booking, onCheckInComplete }) => {
  const { user } = useAuthStore();
  const [isChecked, setIsChecked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  const checkAvailability = useCallback(() => {
    const checkInDate = new Date(booking.check_in);
    const now = new Date();

    // Check if current date is on or after check-in date
    const isDateValid = now.toDateString() >= checkInDate.toDateString();

    // Check if check-in is between 2 PM and 11 PM (assuming check-in time is after 2 PM)
    const currentHour = now.getHours();
    const isTimeValid = currentHour >= 14 && currentHour <= 23; // 2 PM to 11 PM

    setIsAvailable(isDateValid && isTimeValid);
  }, [booking.check_in]);

  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  const handleCheckIn = async () => {
    if (!isChecked || !user) return;

    setIsProcessing(true);

    try {
      // Create check-in record
      const { data: checkInData, error: checkInError } = await supabase
        .from('check_ins')
        .insert({
          booking_id: booking.id,
          checked_in_at: new Date().toISOString(),
          checked_in_by: user.id,
          method: 'self',
          notes: 'Checked in via app',
        })
        .select()
        .single();

      if (checkInError) {
        throw new Error(`Failed to create check-in record: ${checkInError.message}`);
      }

      // Update booking with check-in ID
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({
          check_in_id: checkInData.id,
          status: 'completed', // Mark booking as completed
        })
        .eq('id', booking.id);

      if (bookingError) {
        throw new Error(`Failed to update booking: ${bookingError.message}`);
      }

      // Release escrow if exists
      if (booking.escrow_id) {
        await releaseEscrow({
          escrowId: booking.escrow_id,
          reason: 'Guest checked in successfully',
        });
      }

      // Create delayed payout (24 hours after check-in)
      try {
        // Get payment details to determine host amount
        const { data: payment, error: paymentError } = await supabase
          .from('payments')
          .select('host_amount, currency')
          .eq('booking_id', booking.id)
          .single();

        if (payment && !paymentError) {
          await createPayout({
            bookingId: booking.id,
            hostId: booking.host_id,
            amount: payment.host_amount,
            currency: payment.currency,
            description: `Payout for booking ${booking.id} - delayed 24 hours after check-in`,
          });
        }
      } catch (payoutError) {
        console.error('Failed to create payout:', payoutError);
        // Don't fail the check-in if payout creation fails
      }

      setIsCompleted(true);
      Alert.alert('Success', 'Check-in completed successfully! Funds will be transferred to the host in 24 hours.');

      if (onCheckInComplete) {
        onCheckInComplete();
      }

    } catch (error) {
      console.error('Check-in error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to complete check-in');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isCompleted) {
    return (
      <ThemedView style={[styles.container, styles.completedContainer]}>
        <View style={styles.completedHeader}>
          <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
          <ThemedText style={styles.completedTitle}>Check-in Completed</ThemedText>
        </View>
        <ThemedText style={styles.completedText}>
          You have successfully checked in. The host has been notified and funds have been released.
        </ThemedText>
      </ThemedView>
    );
  }

  if (!isAvailable) {
    return (
      <ThemedView style={[styles.container, styles.unavailableContainer]}>
        <View style={styles.unavailableHeader}>
          <Ionicons name="time-outline" size={24} color={Colors.textSecondary} />
          <ThemedText style={styles.unavailableTitle}>Check-in Not Available</ThemedText>
        </View>
        <ThemedText style={styles.unavailableText}>
          Check-in will be available on your check-in date after 2:00 PM.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="key-outline" size={24} color={Colors.primary} />
        <ThemedText style={styles.title}>Check-in</ThemedText>
      </View>

      <View style={styles.content}>
        <ThemedText style={styles.description}>
          Please confirm your arrival by checking the box below. This will complete your check-in process and release funds to the host.
        </ThemedText>

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setIsChecked(!isChecked)}
          disabled={isProcessing}
        >
          <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
            {isChecked && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <ThemedText style={styles.checkboxLabel}>
            I confirm that I have arrived at the property and successfully checked in
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.checkInButton, (!isChecked || isProcessing) && styles.checkInButtonDisabled]}
          onPress={handleCheckIn}
          disabled={!isChecked || isProcessing}
        >
          <ThemedText style={[styles.checkInButtonText, (!isChecked || isProcessing) && styles.checkInButtonTextDisabled]}>
            {isProcessing ? 'Processing...' : 'Complete Check-in'}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
};

const styles = {
  container: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 12,
  },
  content: {
    gap: 16,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  checkInButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkInButtonDisabled: {
    backgroundColor: Colors.border,
  },
  checkInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  checkInButtonTextDisabled: {
    color: Colors.textSecondary,
  },
  completedContainer: {
    backgroundColor: '#f0fdf4',
    borderColor: '#22c55e',
    borderWidth: 1,
  },
  completedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  completedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22c55e',
    marginLeft: 8,
  },
  completedText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  unavailableContainer: {
    backgroundColor: Colors.background,
    borderColor: Colors.border,
    borderWidth: 1,
  },
  unavailableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  unavailableTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  unavailableText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
};