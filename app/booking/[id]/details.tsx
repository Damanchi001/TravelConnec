import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ThemedView } from '../../../components/themed-view';
import { Colors } from '../../../constants/colors';
import { BookingStatusBadge } from '../../../src/components/booking/booking-status-badge';
import { BookingSummary } from '../../../src/components/booking/booking-summary';
import { useBookingRealtime } from '../../../src/hooks/useBookingRealtime';
import { useBookingDetails } from '../../../src/hooks/useBookings';
import { useEscrowRealtime } from '../../../src/hooks/useEscrowRealtime';
import { usePaymentRealtime } from '../../../src/hooks/usePaymentRealtime';
import { useAuthStore } from '../../../src/stores/auth-store';

export default function BookingDetailsScreen() {
   const { id } = useLocalSearchParams();
   const router = useRouter();
   const { user } = useAuthStore();
   const { data: booking, isLoading, error } = useBookingDetails(id as string);
   const isHost = user?.id === booking?.host_id;

  // Real-time subscriptions for live updates
  const { booking: realtimeBooking, loading: realtimeLoading, error: realtimeError } = useBookingRealtime({
    bookingId: id as string,
  });
  const { payments, loading: paymentLoading, error: paymentError } = usePaymentRealtime({
    bookingId: id as string,
  });
  const { escrow, loading: escrowLoading, error: escrowError } = useEscrowRealtime({
    bookingId: id as string,
  });

  // Use real-time data if available, otherwise fall back to query data
  const currentBooking = realtimeBooking || booking;
  const currentPayments = payments;
  const currentEscrow = escrow;

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading booking details...</Text>
        </View>
      </ThemedView>
    );
  }

  if (error || !booking) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>Failed to load booking details</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }


  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Booking Details</Text>
        <View style={styles.statusContainer}>
          <BookingStatusBadge status={currentBooking?.status || booking.status} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Booking Summary */}
        <View style={styles.section}>
          <BookingSummary
            listing={booking.listing}
            checkIn={new Date(booking.check_in)}
            checkOut={new Date(booking.check_out)}
            guests={booking.guests}
            priceBreakdown={{
              baseAmount: booking.base_amount,
              nights: booking.nights,
              cleaningFee: booking.cleaning_fee,
              serviceFee: booking.service_fee,
              taxes: booking.taxes,
              total: booking.total_amount,
              currency: booking.currency,
            }}
          />
        </View>

        {/* Payment Status */}
        {currentPayments && currentPayments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Status</Text>
            <View style={styles.statusCard}>
              <Text style={styles.statusText}>
                Status: {currentPayments[0].status.charAt(0).toUpperCase() + currentPayments[0].status.slice(1)}
              </Text>
              <Text style={styles.statusText}>
                Amount: {currentPayments[0].amount} {currentPayments[0].currency}
              </Text>
            </View>
          </View>
        )}

        {/* Escrow Status */}
        {currentEscrow && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Escrow Status</Text>
            <View style={styles.statusCard}>
              <Text style={styles.statusText}>
                Status: {currentEscrow.status.charAt(0).toUpperCase() + currentEscrow.status.slice(1)}
              </Text>
              <Text style={styles.statusText}>
                Held Amount: {currentEscrow.held_amount} {booking.currency}
              </Text>
              {currentEscrow.released_amount > 0 && (
                <Text style={styles.statusText}>
                  Released Amount: {currentEscrow.released_amount} {booking.currency}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Guest/Host Information */}
         <View style={styles.section}>
           <Text style={styles.sectionTitle}>Contact Information</Text>
           <View style={styles.contactCard}>
             <View style={styles.contactInfo}>
               <Text style={styles.contactName}>
                 {isHost
                   ? `${booking.guest.first_name} ${booking.guest.last_name}`
                   : `${booking.host?.first_name || 'Host'} ${booking.host?.last_name || ''}`
                 }
               </Text>
               <Text style={styles.contactType}>{isHost ? 'Guest' : 'Host'}</Text>
             </View>
             <TouchableOpacity style={styles.messageButton} onPress={() => router.push(`/chat/${booking.id}`)}>
               <Ionicons name="chatbubble-outline" size={20} color={Colors.primary} />
               <Text style={styles.messageButtonText}>
                 {isHost ? 'Message Guest' : 'Message Host'}
               </Text>
             </TouchableOpacity>
           </View>
         </View>

         {/* Host Actions */}
         {isHost && (
           <View style={styles.section}>
             <Text style={styles.sectionTitle}>Actions</Text>
             <View style={styles.actionsContainer}>
               {currentBooking?.status === 'pending' && (
                 <TouchableOpacity style={styles.primaryButton}>
                   <Text style={styles.primaryButtonText}>Confirm Booking</Text>
                 </TouchableOpacity>
               )}
               {currentBooking?.status === 'confirmed' && (
                 <TouchableOpacity
                   style={styles.primaryButton}
                   onPress={() => router.push(`/booking/${booking.id}/check-in`)}
                 >
                   <Text style={styles.primaryButtonText}>Check-in Guest</Text>
                 </TouchableOpacity>
               )}
             </View>
           </View>
         )}

         {/* Booking Code */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Reference</Text>
          <View style={styles.bookingCodeContainer}>
            <Text style={styles.bookingCode}>{booking.booking_code}</Text>
            <TouchableOpacity style={styles.copyButton}>
              <Ionicons name="copy-outline" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Special Requests */}
        {booking.special_requests && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Requests</Text>
            <Text style={styles.specialRequests}>{booking.special_requests}</Text>
          </View>
        )}

        {/* Cancellation Policy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cancellation Policy</Text>
          <Text style={styles.policyText}>
            Free cancellation until 24 hours before check-in. After that, the booking is non-refundable.
          </Text>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  statusContainer: {
    marginLeft: 16,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  contactType: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  messageButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  bookingCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
  },
  bookingCode: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: 1,
  },
  copyButton: {
    padding: 8,
  },
  specialRequests: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
  },
  policyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  retryText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '500',
  },
  statusCard: {
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  actionsContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});