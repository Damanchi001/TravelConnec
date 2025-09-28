import { useMemo } from 'react';
import { Listing } from '../types/database';

export interface PriceBreakdown {
  baseAmount: number;
  nights: number;
  cleaningFee: number;
  serviceFee: number;
  taxes: number;
  total: number;
  currency: string;
}

export const usePriceCalculation = (
  listing: Listing,
  checkIn: Date | null,
  checkOut: Date | null,
  guests: number
) => {
  const priceBreakdown = useMemo((): PriceBreakdown | null => {
    if (!checkIn || !checkOut || !listing) {
      return null;
    }

    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
      return null;
    }

    const baseAmount = listing.base_price * nights;
    const cleaningFee = listing.cleaning_fee || 0;
    const serviceFee = listing.service_fee || 0;

    // Calculate taxes (simplified - 10% of base amount)
    const taxes = Math.round(baseAmount * 0.1 * 100) / 100;

    const total = baseAmount + cleaningFee + serviceFee + taxes;

    return {
      baseAmount,
      nights,
      cleaningFee,
      serviceFee,
      taxes,
      total,
      currency: listing.currency || 'USD',
    };
  }, [listing, checkIn, checkOut, guests]);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const getPricePerNight = () => {
    if (!listing) return 0;
    return listing.base_price;
  };

  const getTotalSavings = () => {
    // Could implement discount logic here
    return 0;
  };

  return {
    priceBreakdown,
    formatCurrency,
    getPricePerNight,
    getTotalSavings,
  };
};