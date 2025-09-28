import { useCallback, useState } from 'react';
import { Listing } from '../types/database';
import { createBookingError } from '../utils/bookingErrorUtils';

interface AvailabilityCheckResult {
  isAvailable: boolean;
  conflictingBookings: Date[];
  error?: string;
}

export const useAvailabilityCheck = () => {
  const [isChecking, setIsChecking] = useState(false);

  const checkAvailability = useCallback(async (
    listing: Listing,
    checkIn: Date,
    checkOut: Date,
    guests: number
  ): Promise<AvailabilityCheckResult> => {
    setIsChecking(true);

    try {
      // Simulate API call - replace with actual API integration
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check guest capacity
      if (guests > listing.max_guests) {
        throw createBookingError('MAX_GUESTS_EXCEEDED', `Maximum ${listing.max_guests} guests allowed`);
      }

      // Check minimum nights
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      if (nights < listing.min_nights) {
        throw createBookingError('INVALID_DATES', `Minimum ${listing.min_nights} nights required`);
      }

      // Check maximum nights
      if (listing.max_nights && nights > listing.max_nights) {
        throw createBookingError('INVALID_DATES', `Maximum ${listing.max_nights} nights allowed`);
      }

      // Check blocked dates
      const blockedDates = listing.blocked_dates || [];
      const conflictingDates: Date[] = [];

      for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
        if (blockedDates.includes(d.toISOString().split('T')[0])) {
          conflictingDates.push(new Date(d));
        }
      }

      if (conflictingDates.length > 0) {
        return {
          isAvailable: false,
          conflictingBookings: conflictingDates,
          error: 'Selected dates are not available',
        };
      }

      // Check available date range
      if (listing.available_from) {
        const availableFrom = new Date(listing.available_from);
        if (checkIn < availableFrom) {
          return {
            isAvailable: false,
            conflictingBookings: [],
            error: `Property is not available until ${availableFrom.toLocaleDateString()}`,
          };
        }
      }

      if (listing.available_to) {
        const availableTo = new Date(listing.available_to);
        if (checkOut > availableTo) {
          return {
            isAvailable: false,
            conflictingBookings: [],
            error: `Property is not available after ${availableTo.toLocaleDateString()}`,
          };
        }
      }

      return {
        isAvailable: true,
        conflictingBookings: [],
      };

    } catch (error) {
      return {
        isAvailable: false,
        conflictingBookings: [],
        error: 'Failed to check availability',
      };
    } finally {
      setIsChecking(false);
    }
  }, []);

  return {
    checkAvailability,
    isChecking,
  };
};