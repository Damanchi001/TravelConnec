import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemedView } from '../../../components/themed-view';
import { Colors } from '../../../constants/colors';
import { BookingStatusBadge } from './booking-status-badge';

interface Booking {
  id: string;
  listing: {
    id: string;
    title: string;
    images: string[];
    address: {
      city: string;
      country: string;
    };
  };
  check_in: string;
  check_out: string;
  total_amount: number;
  currency: string;
  status: string;
  guests: number;
  nights: number;
}

interface BookingCardProps {
  booking: Booking;
  userRole: 'guest' | 'host';
  onPress: () => void;
  onMessageHost?: () => void;
  onMessageGuest?: () => void;
  onCancel?: () => void;
  onConfirm?: () => void;
  onCheckIn?: () => void;
  showCancelButton?: boolean;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  userRole,
  onPress,
  onMessageHost,
  onMessageGuest,
  onCancel,
  onConfirm,
  onCheckIn,
  showCancelButton = true,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
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

  const getActionButtons = () => {
    const buttons = [];

    if (userRole === 'guest') {
      // Guest actions
      if (booking.status === 'confirmed' || booking.status === 'pending') {
        if (onMessageHost) {
          buttons.push(
            <TouchableOpacity
              key="message"
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={onMessageHost}
            >
              <Ionicons name="chatbubble-outline" size={16} color={Colors.primary} />
              <Text style={styles.secondaryButtonText}>Message Host</Text>
            </TouchableOpacity>
          );
        }
        if (booking.status === 'confirmed' && onCancel && showCancelButton) {
          buttons.push(
            <TouchableOpacity
              key="cancel"
              style={[styles.actionButton, styles.dangerButton]}
              onPress={onCancel}
            >
              <Text style={styles.dangerButtonText}>Cancel</Text>
            </TouchableOpacity>
          );
        }
      }
    } else {
      // Host actions
      if (booking.status === 'pending' && onConfirm) {
        buttons.push(
          <TouchableOpacity
            key="confirm"
            style={[styles.actionButton, styles.primaryButton]}
            onPress={onConfirm}
          >
            <Text style={styles.primaryButtonText}>Confirm</Text>
          </TouchableOpacity>
        );
      }
      if (booking.status === 'confirmed') {
        if (onCheckIn) {
          buttons.push(
            <TouchableOpacity
              key="checkin"
              style={[styles.actionButton, styles.primaryButton]}
              onPress={onCheckIn}
            >
              <Text style={styles.primaryButtonText}>Check-in</Text>
            </TouchableOpacity>
          );
        }
        if (onMessageGuest) {
          buttons.push(
            <TouchableOpacity
              key="message"
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={onMessageGuest}
            >
              <Ionicons name="chatbubble-outline" size={16} color={Colors.primary} />
              <Text style={styles.secondaryButtonText}>Message Guest</Text>
            </TouchableOpacity>
          );
        }
      }
    }

    return buttons;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <ThemedView style={styles.card}>
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: booking.listing.images?.[0] || 'https://via.placeholder.com/150' }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.statusBadge}>
            <BookingStatusBadge status={booking.status} />
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2}>
              {booking.listing.title}
            </Text>
            <Text style={styles.price}>
              {formatCurrency(booking.total_amount, booking.currency)}
            </Text>
          </View>

          <Text style={styles.location}>
            {booking.listing.address?.city}, {booking.listing.address?.country}
          </Text>

          <View style={styles.details}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.detailText}>
                {formatDate(booking.check_in)} - {formatDate(booking.check_out)}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="people-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.detailText}>
                {booking.guests} guest{booking.guests !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            {getActionButtons()}
          </View>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    height: 150,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    marginRight: 12,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  location: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  details: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  primaryButtonText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '500',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
  },
  dangerButtonText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '500',
  },
});