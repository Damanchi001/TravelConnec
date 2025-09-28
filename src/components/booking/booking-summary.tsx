import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../../../constants/colors';
import { Listing } from '../../types/database';

interface PriceBreakdown {
  baseAmount: number;
  nights: number;
  cleaningFee: number;
  serviceFee: number;
  taxes: number;
  total: number;
  currency: string;
}

interface BookingSummaryProps {
  listing: Listing;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  priceBreakdown: PriceBreakdown;
  onModify?: () => void;
  showModifyButton?: boolean;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
  listing,
  checkIn,
  checkOut,
  guests,
  priceBreakdown,
  onModify,
  showModifyButton = false,
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

  const renderPriceRow = (
    label: string,
    amount: number,
    isTotal: boolean = false,
    icon?: string
  ) => (
    <View style={[styles.priceRow, isTotal && styles.totalRow]}>
      <View style={styles.priceLabelContainer}>
        {icon && (
          <Ionicons
            name={icon as any}
            size={16}
            color={isTotal ? Colors.primary : Colors.textSecondary}
            style={styles.priceIcon}
          />
        )}
        <Text style={[styles.priceLabel, isTotal && styles.totalLabel]}>
          {label}
        </Text>
      </View>
      <Text style={[styles.priceAmount, isTotal && styles.totalAmount]}>
        {formatCurrency(amount, priceBreakdown.currency)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Booking Summary</Text>
        {showModifyButton && onModify && (
          <TouchableOpacity style={styles.modifyButton} onPress={onModify}>
            <Ionicons name="pencil" size={16} color={Colors.primary} />
            <Text style={styles.modifyText}>Modify</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Listing Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property</Text>
          <Text style={styles.listingTitle}>{listing.title}</Text>
          <Text style={styles.listingLocation}>
            {listing.address?.city}, {listing.address?.country}
          </Text>
        </View>

        {/* Dates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dates</Text>
          <View style={styles.dateContainer}>
            <View style={styles.dateItem}>
              <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
              <View style={styles.dateTextContainer}>
                <Text style={styles.dateLabel}>Check-in</Text>
                <Text style={styles.dateValue}>{formatDate(checkIn)}</Text>
              </View>
            </View>
            <View style={styles.dateItem}>
              <Ionicons name="calendar" size={20} color={Colors.primary} />
              <View style={styles.dateTextContainer}>
                <Text style={styles.dateLabel}>Check-out</Text>
                <Text style={styles.dateValue}>{formatDate(checkOut)}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.nightsText}>{nights} night{nights !== 1 ? 's' : ''}</Text>
        </View>

        {/* Guests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guests</Text>
          <View style={styles.guestsContainer}>
            <Ionicons name="people-outline" size={20} color={Colors.primary} />
            <Text style={styles.guestsText}>
              {guests} guest{guests !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          <View style={styles.priceBreakdown}>
            {renderPriceRow(
              `${formatCurrency(priceBreakdown.baseAmount / priceBreakdown.nights, priceBreakdown.currency)} × ${priceBreakdown.nights} nights`,
              priceBreakdown.baseAmount,
              false,
              'home-outline'
            )}

            {priceBreakdown.cleaningFee > 0 && renderPriceRow(
              'Cleaning fee',
              priceBreakdown.cleaningFee,
              false,
              'sparkles-outline'
            )}

            {priceBreakdown.serviceFee > 0 && renderPriceRow(
              'Service fee',
              priceBreakdown.serviceFee,
              false,
              'shield-checkmark-outline'
            )}

            {priceBreakdown.taxes > 0 && renderPriceRow(
              'Taxes',
              priceBreakdown.taxes,
              false,
              'receipt-outline'
            )}

            <View style={styles.divider} />

            {renderPriceRow('Total', priceBreakdown.total, true, 'card-outline')}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 20,
    marginVertical: 8,
    maxHeight: 500,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  modifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modifyText: {
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  listingLocation: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateTextContainer: {
    marginLeft: 8,
  },
  dateLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginTop: 2,
  },
  nightsText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  guestsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestsText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 8,
    fontWeight: '500',
  },
  priceBreakdown: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
    marginTop: 8,
  },
  priceLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  priceIcon: {
    marginRight: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  priceAmount: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
});