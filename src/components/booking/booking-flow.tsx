import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Colors } from '../../../constants/colors';
import { useAvailabilityCheck } from '../../hooks/useAvailabilityCheck';
import { useBookingValidation } from '../../hooks/useBookingValidation';
import { usePriceCalculation } from '../../hooks/usePriceCalculation';
import { NotificationService } from '../../services/notifications';
import { Listing } from '../../types/database';
import { ErrorMessage } from '../forms/error-message';
import { FormButton } from '../forms/form-button';
import { BookingCalendar } from './booking-calendar';
import { BookingSummary } from './booking-summary';
import { GuestSelector } from './guest-selector';
import { PaymentForm } from './payment-form';

interface BookingFlowProps {
  listing: Listing;
  onBookingComplete?: (bookingData: any) => void;
  onCancel?: () => void;
}

export const BookingFlow: React.FC<BookingFlowProps> = ({
  listing,
  onBookingComplete,
  onCancel,
}) => {
  const [selectedDates, setSelectedDates] = useState<{ checkIn?: Date; checkOut?: Date }>({});
  const [guests, setGuests] = useState(1);
  const [currentStep, setCurrentStep] = useState<'dates' | 'guests' | 'summary' | 'payment'>('dates');
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [guestError, setGuestError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [networkError, setNetworkError] = useState(false);

  const { form, validateBookingDates, getNightsCount } = useBookingValidation();
  const { checkAvailability, isChecking } = useAvailabilityCheck();
  const { priceBreakdown } = usePriceCalculation(
    listing,
    selectedDates.checkIn || null,
    selectedDates.checkOut || null,
    guests
  );

  const handleDatesChange = (dates: { checkIn?: Date; checkOut?: Date }) => {
    setSelectedDates(dates);
  };

  const handleGuestsChange = (newGuests: number) => {
    setGuests(newGuests);
  };

  const handleNextStep = async () => {
    try {
      setBookingError(null);

      if (currentStep === 'dates') {
        if (!selectedDates.checkIn || !selectedDates.checkOut) {
          setBookingError('Please select both check-in and check-out dates');
          return;
        }

        if (!validateBookingDates(selectedDates.checkIn, selectedDates.checkOut)) {
          setBookingError('Please select valid dates');
          return;
        }

        // Check availability
        const availability = await checkAvailability(
          listing,
          selectedDates.checkIn,
          selectedDates.checkOut,
          guests
        );

        if (!availability.isAvailable) {
          setBookingError(availability.error || 'Selected dates are not available');
          return;
        }

        setCurrentStep('guests');
      } else if (currentStep === 'guests') {
        // Validate guest count
        if (guests < 1 || guests > listing.max_guests) {
          setGuestError(`Please select between 1 and ${listing.max_guests} guests`);
          return;
        }
        setGuestError(null);
        setCurrentStep('summary');
      } else if (currentStep === 'summary') {
        setCurrentStep('payment');
      } else if (currentStep === 'payment') {
        // Proceed with booking
        await handleBooking();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setBookingError(errorMessage);
      setNetworkError(isNetworkError(error));
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 'guests') {
      setCurrentStep('dates');
    } else if (currentStep === 'summary') {
      setCurrentStep('guests');
    } else if (currentStep === 'payment') {
      setCurrentStep('summary');
    }
  };

  const handleRetry = async () => {
    setBookingError(null);
    setNetworkError(false);
    setRetryCount(prev => prev + 1);

    if (currentStep === 'dates') {
      // Retry availability check
      await handleNextStep();
    } else if (currentStep === 'payment') {
      // Retry booking
      await handleBooking();
    }
  };

  const isNetworkError = (error: any): boolean => {
    return error?.message?.includes('network') ||
           error?.message?.includes('timeout') ||
           error?.code === 'NETWORK_ERROR' ||
           error?.code === 'TIMEOUT';
  };

  const handleBooking = async (paymentIntent?: any) => {
    if (!priceBreakdown || !selectedDates.checkIn || !selectedDates.checkOut) {
      setBookingError('Booking data is incomplete');
      return;
    }

    setIsSubmitting(true);
    setBookingError(null);

    try {
      // Here you would integrate with your booking API
      const bookingData = {
        listingId: listing.id,
        checkIn: selectedDates.checkIn,
        checkOut: selectedDates.checkOut,
        guests,
        priceBreakdown,
        paymentIntent, // Include payment intent if provided
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Trigger booking confirmation notification
      NotificationService.createBookingConfirmationNotification(
        `temp-${Date.now()}`, // In real app, this would be the actual booking ID
        listing.title
      );

      // Schedule check-in reminder
      if (selectedDates.checkIn) {
        NotificationService.createCheckInReminderNotification(
          `temp-${Date.now()}`,
          listing.title,
          selectedDates.checkIn
        );
      }

      Alert.alert(
        'Booking Confirmed!',
        'Your booking has been successfully created and payment processed.',
        [
          {
            text: 'OK',
            onPress: () => onBookingComplete?.(bookingData),
          },
        ]
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create booking. Please try again.';
      setBookingError(errorMessage);
      setNetworkError(isNetworkError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    if (currentStep === 'dates') {
      return selectedDates.checkIn && selectedDates.checkOut;
    }
    if (currentStep === 'guests') {
      return guests >= 1 && guests <= listing.max_guests;
    }
    if (currentStep === 'payment') {
      // Payment step handles its own validation and submission
      return false;
    }
    return true;
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'dates':
        return 'Select Dates';
      case 'guests':
        return 'Number of Guests';
      case 'summary':
        return 'Booking Summary';
      case 'payment':
        return 'Payment Details';
      default:
        return '';
    }
  };

  const getNextButtonText = () => {
    switch (currentStep) {
      case 'dates':
        return 'Continue to Guests';
      case 'guests':
        return 'Review Booking';
      case 'summary':
        return 'Continue to Payment';
      case 'payment':
        return 'Complete Booking';
      default:
        return 'Continue';
    }
  };

  // Generate available dates (simplified - in real app, fetch from API)
  const availableDates = React.useMemo(() => {
    const dates: Date[] = [];
    const today = new Date();

    // Add next 90 days as available (except blocked dates)
    for (let i = 0; i < 90; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dateString = date.toISOString().split('T')[0];
      if (!listing.blocked_dates?.includes(dateString)) {
        dates.push(date);
      }
    }

    return dates;
  }, [listing.blocked_dates]);

  const blockedDates = React.useMemo(() => {
    return (listing.blocked_dates || []).map(dateStr => new Date(dateStr));
  }, [listing.blocked_dates]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{getStepTitle()}</Text>
        <Text style={styles.subtitle}>
           Step {currentStep === 'dates' ? '1' : currentStep === 'guests' ? '2' : currentStep === 'summary' ? '3' : '4'} of 4
         </Text>
      </View>

      {/* Error Message */}
      {bookingError && (
        <View style={styles.errorContainer}>
          <ErrorMessage message={bookingError} />
          {networkError && retryCount < 3 && (
            <FormButton
              title="Retry"
              onPress={handleRetry}
              buttonStyle={styles.retryButton}
              loading={isChecking || isSubmitting}
            />
          )}
        </View>
      )}

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressStep, (currentStep === 'guests' || currentStep === 'summary' || currentStep === 'payment') && styles.progressStepCompleted]} />
        <View style={[styles.progressStep, (currentStep === 'summary' || currentStep === 'payment') && styles.progressStepCompleted]} />
        <View style={[styles.progressStep, currentStep === 'payment' && styles.progressStepCompleted]} />
        <View style={[styles.progressStep, currentStep === 'payment' && styles.progressStepCompleted]} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentStep === 'dates' && (
          <BookingCalendar
            availableDates={availableDates}
            blockedDates={blockedDates}
            selectedDates={selectedDates}
            onDatesChange={handleDatesChange}
            minNights={listing.min_nights}
            maxNights={listing.max_nights || 30}
          />
        )}

        {currentStep === 'guests' && (
          <View style={styles.guestsContainer}>
            <GuestSelector
              value={guests}
              onChange={(newGuests) => {
                handleGuestsChange(newGuests);
                // Clear error when user changes value
                if (guestError) setGuestError(null);
              }}
              minGuests={1}
              maxGuests={listing.max_guests}
              label={`Guests (max ${listing.max_guests})`}
              error={guestError || undefined}
            />
          </View>
        )}

        {currentStep === 'summary' && priceBreakdown && (
          <BookingSummary
            listing={listing}
            checkIn={selectedDates.checkIn!}
            checkOut={selectedDates.checkOut!}
            guests={guests}
            priceBreakdown={priceBreakdown}
            showModifyButton={true}
            onModify={() => setCurrentStep('dates')}
          />
        )}

        {currentStep === 'payment' && priceBreakdown && (
          <PaymentForm
            bookingId={`temp-${Date.now()}`} // Temporary ID until booking is created
            amount={priceBreakdown.total}
            currency={priceBreakdown.currency}
            onPaymentSuccess={(paymentIntent) => {
              // Handle successful payment
              handleBooking(paymentIntent);
            }}
            onPaymentError={(error) => {
              setBookingError(error);
            }}
            onCancel={() => setCurrentStep('summary')}
          />
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.buttonContainer}>
          {currentStep !== 'dates' && (
            <FormButton
              title="Back"
              variant="outline"
              onPress={handlePreviousStep}
              buttonStyle={styles.backButton}
            />
          )}
          <FormButton
            title={getNextButtonText()}
            onPress={handleNextStep}
            loading={isChecking}
            disabled={!canProceed()}
            buttonStyle={styles.nextButton}
          />
        </View>

        {onCancel && (
          <FormButton
            title="Cancel"
            variant="outline"
            onPress={onCancel}
            buttonStyle={styles.cancelButton}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  progressStep: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
  },
  progressStepCompleted: {
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  guestsContainer: {
    marginTop: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
  cancelButton: {
    width: '100%',
  },
  errorContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  retryButton: {
    marginTop: 12,
  },
});