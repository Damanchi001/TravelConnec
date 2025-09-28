import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { ThemedText } from '../../../components/themed-text';
import { ThemedView } from '../../../components/themed-view';
import { Colors } from '../../../constants/colors';
import { BookingSummary } from '../../../src/components/booking/booking-summary';
import { CheckIn } from '../../../src/components/booking/check-in';

export default function BookingConfirmation() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // Mock data - in real app, this would come from API
  const mockBooking = {
    id: id || '1',
    listing_id: 'listing-1',
    guest_id: 'guest-1',
    host_id: 'host-1',
    check_in: '2024-10-15T14:00:00Z',
    check_out: '2024-10-20T11:00:00Z',
    guests: 2,
    nights: 5,
    base_amount: 500,
    cleaning_fee: 50,
    service_fee: 75,
    taxes: 45,
    total_amount: 670,
    currency: 'USD',
    payment_status: 'paid' as const,
    status: 'confirmed' as const,
    booking_code: 'BK123456',
    escrow_id: 'escrow-1', // Mock escrow ID for testing
    created_at: '2024-09-24T10:00:00Z',
  };

  const mockListing = {
    id: 'listing-1',
    host_id: 'host-1',
    title: 'Beautiful Beachfront Villa',
    description: 'Stunning villa with ocean views',
    listing_type: 'accommodation' as const,
    property_type: 'villa' as const,
    category: 'beachfront',
    address: {
      city: 'Malibu',
      country: 'USA',
      street: '123 Ocean Drive',
    },
    coordinates: { lat: 34.0259, lng: -118.7798 },
    base_price: 100,
    currency: 'USD',
    price_per: 'night',
    cleaning_fee: 50,
    service_fee: 15,
    max_guests: 4,
    min_nights: 1,
    max_nights: 30,
    instant_book: true,
    amenities: ['wifi', 'pool', 'kitchen'],
    features: {},
    house_rules: ['No smoking', 'No pets'],
    available_from: null,
    available_to: null,
    blocked_dates: [],
    images: [],
    video_url: null,
    virtual_tour_url: null,
    status: 'active' as const,
    views: 0,
    average_rating: 4.8,
    review_count: 25,
    featured: false,
    verified: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const mockHost = {
    id: 'host-1',
    first_name: 'Sarah',
    last_name: 'Johnson',
    phone: '+1 (555) 123-4567',
    email: 'sarah.johnson@email.com',
  };

  const priceBreakdown = {
    baseAmount: mockBooking.base_amount,
    nights: mockBooking.nights,
    cleaningFee: mockBooking.cleaning_fee,
    serviceFee: mockBooking.service_fee,
    taxes: mockBooking.taxes,
    total: mockBooking.total_amount,
    currency: mockBooking.currency,
  };

  const checkInDate = new Date(mockBooking.check_in);
  const checkOutDate = new Date(mockBooking.check_out);

  const handleShareBooking = async () => {
    try {
      const message = `I'm excited for my trip! 🎉\n\nBooking Details:\n📍 ${mockListing.title}\n📅 Check-in: ${checkInDate.toLocaleDateString()}\n📅 Check-out: ${checkOutDate.toLocaleDateString()}\n👥 ${mockBooking.guests} guests\n💰 Total: $${mockBooking.total_amount}\n\nBooking Code: ${mockBooking.booking_code}`;

      await Share.share({
        message,
        title: 'My Travel Booking',
      });
    } catch {
      Alert.alert('Error', 'Unable to share booking details');
    }
  };

  const handleNavigateToBookings = () => {
    // Navigate to profile tab for now (bookings management)
    router.push('/profile');
  };

  const handleContactHost = () => {
    // Navigate to chat with host
    router.push('/chat');
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Booking Confirmed',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Success Header */}
        <View style={styles.successHeader}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color="#22c55e" />
          </View>
          <ThemedText style={styles.successTitle}>Booking Confirmed!</ThemedText>
          <ThemedText style={styles.successSubtitle}>
            Your reservation has been successfully confirmed
          </ThemedText>
          <View style={styles.bookingCodeContainer}>
            <ThemedText style={styles.bookingCodeLabel}>Booking Code</ThemedText>
            <ThemedText style={styles.bookingCode}>{mockBooking.booking_code}</ThemedText>
          </View>
        </View>

        {/* Booking Summary */}
        <View style={styles.section}>
          <BookingSummary
            listing={mockListing}
            checkIn={checkInDate}
            checkOut={checkOutDate}
            guests={mockBooking.guests}
            priceBreakdown={priceBreakdown}
          />
        </View>

        {/* Payment Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card-outline" size={24} color={Colors.primary} />
            <ThemedText style={styles.sectionTitle}>Payment Information</ThemedText>
          </View>
          <View style={styles.paymentCard}>
            <View style={styles.paymentRow}>
              <ThemedText style={styles.paymentLabel}>Payment Status</ThemedText>
              <View style={styles.statusBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                <ThemedText style={styles.statusText}>Paid</ThemedText>
              </View>
            </View>
            <View style={styles.paymentRow}>
              <ThemedText style={styles.paymentLabel}>Payment Method</ThemedText>
              <ThemedText style={styles.paymentValue}>•••• •••• •••• 4242</ThemedText>
            </View>
            <View style={styles.paymentRow}>
              <ThemedText style={styles.paymentLabel}>Transaction ID</ThemedText>
              <ThemedText style={styles.paymentValue}>pi_1234567890</ThemedText>
            </View>
          </View>
        </View>

        {/* Check-in Instructions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="key-outline" size={24} color={Colors.primary} />
            <ThemedText style={styles.sectionTitle}>Check-in Instructions</ThemedText>
          </View>
          <View style={styles.instructionsCard}>
            <View style={styles.instructionItem}>
              <Ionicons name="time-outline" size={20} color={Colors.primary} />
              <View style={styles.instructionContent}>
                <ThemedText style={styles.instructionTitle}>Check-in Time</ThemedText>
                <ThemedText style={styles.instructionText}>After 2:00 PM</ThemedText>
              </View>
            </View>
            <View style={styles.instructionItem}>
              <Ionicons name="location-outline" size={20} color={Colors.primary} />
              <View style={styles.instructionContent}>
                <ThemedText style={styles.instructionTitle}>Address</ThemedText>
                <ThemedText style={styles.instructionText}>
                  {mockListing.address?.street}, {mockListing.address?.city}
                </ThemedText>
              </View>
            </View>
            <View style={styles.instructionItem}>
              <Ionicons name="phone-portrait-outline" size={20} color={Colors.primary} />
              <View style={styles.instructionContent}>
                <ThemedText style={styles.instructionTitle}>Self Check-in</ThemedText>
                <ThemedText style={styles.instructionText}>
                  Use the keypad at the front door with code: 1234
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Host Contact Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={24} color={Colors.primary} />
            <ThemedText style={styles.sectionTitle}>Host Contact</ThemedText>
          </View>
          <View style={styles.hostCard}>
            <View style={styles.hostInfo}>
              <View style={styles.hostAvatar}>
                <ThemedText style={styles.hostInitials}>
                  {mockHost.first_name[0]}{mockHost.last_name[0]}
                </ThemedText>
              </View>
              <View style={styles.hostDetails}>
                <ThemedText style={styles.hostName}>
                  {mockHost.first_name} {mockHost.last_name}
                </ThemedText>
                <ThemedText style={styles.hostSubtitle}>Your Host</ThemedText>
              </View>
            </View>
            <TouchableOpacity style={styles.contactButton} onPress={handleContactHost}>
              <Ionicons name="chatbubble-outline" size={20} color={Colors.primary} />
              <ThemedText style={styles.contactButtonText}>Message Host</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Next Steps */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list-outline" size={24} color={Colors.primary} />
            <ThemedText style={styles.sectionTitle}>Next Steps</ThemedText>
          </View>
          <View style={styles.nextStepsCard}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <ThemedText style={styles.stepNumberText}>1</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText style={styles.stepTitle}>Prepare for Check-in</ThemedText>
                <ThemedText style={styles.stepDescription}>
                  Review house rules and check-in instructions
                </ThemedText>
              </View>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <ThemedText style={styles.stepNumberText}>2</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText style={styles.stepTitle}>Travel Documents</ThemedText>
                <ThemedText style={styles.stepDescription}>
                  Ensure you have valid ID and travel documents
                </ThemedText>
              </View>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <ThemedText style={styles.stepNumberText}>3</ThemedText>
              </View>
              <View style={styles.stepContent}>
                <ThemedText style={styles.stepTitle}>Arrival</ThemedText>
                <ThemedText style={styles.stepDescription}>
                  Arrive at the property and use self check-in
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Check-in Section */}
        <CheckIn
          booking={{
            id: mockBooking.id,
            check_in: mockBooking.check_in,
            guest_id: mockBooking.guest_id,
            host_id: mockBooking.host_id,
            escrow_id: mockBooking.escrow_id,
          }}
        />

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShareBooking}>
            <Ionicons name="share-outline" size={20} color={Colors.primary} />
            <ThemedText style={styles.shareButtonText}>Share Booking</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.manageButton} onPress={handleNavigateToBookings}>
            <Ionicons name="calendar-outline" size={20} color="#fff" />
            <ThemedText style={styles.manageButtonText}>Manage Bookings</ThemedText>
          </TouchableOpacity>
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
  headerButton: {
    marginLeft: 16,
    padding: 8,
  },
  successHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: Colors.card,
    margin: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  bookingCodeContainer: {
    alignItems: 'center',
  },
  bookingCodeLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  bookingCode: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: 2,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 12,
  },
  paymentCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  paymentValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '500',
    marginLeft: 4,
  },
  instructionsCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  instructionContent: {
    marginLeft: 12,
    flex: 1,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  hostCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  hostAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  hostInitials: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  hostDetails: {
    flex: 1,
  },
  hostName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  hostSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  contactButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: 8,
  },
  nextStepsCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  actionsContainer: {
    marginHorizontal: 16,
    marginBottom: 32,
    gap: 12,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shareButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
  },
  manageButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
});