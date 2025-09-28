import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemedView } from '../../../components/themed-view';
import { Colors } from '../../../constants/colors';
import { calculateRefund, cancelBooking, CANCELLATION_POLICIES, CancellationPolicy } from '../../services/booking/cancellation';
import { FormButton } from '../forms/form-button';
import { FormInput } from '../forms/form-input';

interface CancellationModalProps {
  visible: boolean;
  onClose: () => void;
  booking: {
    id: string;
    listing: {
      title: string;
      cancellation_policy?: string;
    };
    check_in: string;
    total_amount: number;
    currency: string;
  };
  userRole: 'guest' | 'host';
  userId: string;
  onCancellationComplete?: () => void;
}

export const CancellationModal: React.FC<CancellationModalProps> = ({
  visible,
  onClose,
  booking,
  userRole,
  userId,
  onCancellationComplete,
}) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [refundCalculation, setRefundCalculation] = useState<any>(null);
  const [calculatingRefund, setCalculatingRefund] = useState(false);

  useEffect(() => {
    if (visible && booking.id) {
      calculateRefundAmount();
    }
  }, [visible, booking.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const calculateRefundAmount = useCallback(async () => {
    if (!booking.id) return;

    setCalculatingRefund(true);
    try {
      const calculation = await calculateRefund(booking.id);
      setRefundCalculation(calculation);
    } catch (error) {
      console.error('Error calculating refund:', error);
      Alert.alert('Error', 'Failed to calculate refund amount');
    } finally {
      setCalculatingRefund(false);
    }
  }, [booking.id]);

  const handleCancelBooking = async () => {
    if (!reason.trim()) {
      Alert.alert('Required', 'Please provide a reason for cancellation');
      return;
    }

    setLoading(true);
    try {
      const result = await cancelBooking({
        bookingId: booking.id,
        reason: reason.trim(),
        cancelledBy: userRole,
        userId,
      });

      if (result.success) {
        Alert.alert(
          'Booking Cancelled',
          `Your booking has been cancelled. ${
            result.refundAmount && result.refundAmount > 0
              ? `A refund of ${booking.currency}${result.refundAmount} will be processed.`
              : 'No refund is applicable for this cancellation.'
          }`,
          [
            {
              text: 'OK',
              onPress: () => {
                onClose();
                onCancellationComplete?.();
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      Alert.alert('Error', 'Failed to cancel booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const getPolicyDetails = (): CancellationPolicy => {
    const policyId = booking.listing?.cancellation_policy || 'flexible';
    return CANCELLATION_POLICIES[policyId] || CANCELLATION_POLICIES.flexible;
  };

  const policy = getPolicyDetails();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Cancel Booking</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Booking Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Booking Details</Text>
            <View style={styles.bookingCard}>
              <Text style={styles.listingTitle}>{booking.listing.title}</Text>
              <Text style={styles.bookingDates}>
                Check-in: {new Date(booking.check_in).toLocaleDateString()}
              </Text>
              <Text style={styles.totalAmount}>
                Total: {formatCurrency(booking.total_amount, booking.currency)}
              </Text>
            </View>
          </View>

          {/* Cancellation Policy */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cancellation Policy</Text>
            <View style={styles.policyCard}>
              <Text style={styles.policyName}>{policy.name}</Text>
              <Text style={styles.policyDescription}>{policy.description}</Text>
              <View style={styles.policyConditions}>
                {policy.conditions.map((condition, index) => (
                  <Text key={index} style={styles.conditionText}>
                    • {condition}
                  </Text>
                ))}
              </View>
            </View>
          </View>

          {/* Refund Calculation */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Refund Calculation</Text>
            {calculatingRefund ? (
              <View style={styles.loadingCard}>
                <Text style={styles.loadingText}>Calculating refund...</Text>
              </View>
            ) : refundCalculation ? (
              <View style={styles.refundCard}>
                <View style={styles.refundRow}>
                  <Text style={styles.refundLabel}>Original Amount:</Text>
                  <Text style={styles.refundValue}>
                    {formatCurrency(refundCalculation.originalAmount, booking.currency)}
                  </Text>
                </View>
                <View style={styles.refundRow}>
                  <Text style={styles.refundLabel}>Refund Percentage:</Text>
                  <Text style={styles.refundValue}>{refundCalculation.refundPercentage}%</Text>
                </View>
                <View style={styles.refundRow}>
                  <Text style={styles.refundLabel}>Platform Fee (non-refundable):</Text>
                  <Text style={styles.refundValue}>
                    {formatCurrency(refundCalculation.platformFee, booking.currency)}
                  </Text>
                </View>
                <View style={[styles.refundRow, styles.totalRow]}>
                  <Text style={styles.totalRefundLabel}>Refund Amount:</Text>
                  <Text style={styles.totalRefundValue}>
                    {formatCurrency(refundCalculation.refundableAmount, booking.currency)}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.errorCard}>
                <Text style={styles.errorText}>Unable to calculate refund</Text>
              </View>
            )}
          </View>

          {/* Cancellation Reason */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reason for Cancellation</Text>
            <FormInput
              label="Cancellation Reason"
              placeholder="Please provide a reason for cancellation..."
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={3}
              style={styles.reasonInput}
            />
          </View>

          {/* Warning */}
          <View style={styles.warningSection}>
            <Ionicons name="warning" size={20} color="#f59e0b" />
            <Text style={styles.warningText}>
              This action cannot be undone. The booking will be cancelled and{' '}
              {refundCalculation?.refundableAmount > 0 ? 'refund processed' : 'no refund will be issued'}.
            </Text>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.footer}>
          <FormButton
            title="Keep Booking"
            onPress={onClose}
            variant="secondary"
            style={styles.cancelButton}
          />
          <FormButton
            title="Cancel Booking"
            onPress={handleCancelBooking}
            variant="primary"
            loading={loading}
            disabled={!reason.trim() || calculatingRefund}
            style={styles.confirmButton}
          />
        </View>
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  bookingCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  bookingDates: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  policyCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  policyName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  policyDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  policyConditions: {
    gap: 4,
  },
  conditionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  refundCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  refundRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  refundLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  refundValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 8,
    paddingTop: 16,
  },
  totalRefundLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  totalRefundValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  loadingCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  errorCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
  },
  reasonInput: {
    minHeight: 80,
  },
  warningSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  warningText: {
    fontSize: 14,
    color: '#92400e',
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
});