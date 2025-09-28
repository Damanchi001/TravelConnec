import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export const bookingFormSchema = z.object({
  checkIn: z.date({
    required_error: 'Check-in date is required',
  }).refine((date) => date >= new Date(), {
    message: 'Check-in date must be in the future',
  }),
  checkOut: z.date({
    required_error: 'Check-out date is required',
  }),
  guests: z.number()
    .min(1, 'At least 1 guest is required')
    .max(10, 'Maximum 10 guests allowed'),
}).refine((data) => data.checkOut > data.checkIn, {
  message: 'Check-out date must be after check-in date',
  path: ['checkOut'],
}).refine((data) => {
  const nights = Math.ceil((data.checkOut.getTime() - data.checkIn.getTime()) / (1000 * 60 * 60 * 24));
  return nights >= 1 && nights <= 30;
}, {
  message: 'Booking must be between 1 and 30 nights',
  path: ['checkOut'],
});

export type BookingFormData = z.infer<typeof bookingFormSchema>;

export const useBookingValidation = () => {
  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      guests: 1,
    },
  });

  const validateBookingDates = (checkIn: Date, checkOut: Date): boolean => {
    try {
      bookingFormSchema.parse({ checkIn, checkOut, guests: 1 });
      return true;
    } catch {
      return false;
    }
  };

  const validateGuests = (guests: number): boolean => {
    return guests >= 1 && guests <= 10;
  };

  const getNightsCount = (checkIn: Date, checkOut: Date): number => {
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  };

  return {
    form,
    validateBookingDates,
    validateGuests,
    getNightsCount,
  };
};