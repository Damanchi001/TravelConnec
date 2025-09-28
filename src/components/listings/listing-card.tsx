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
import { Listing } from '../../hooks/queries/use-listings';

interface ListingCardProps {
  listing: Listing;
  onPress: () => void;
  onEdit?: () => void;
  onAnalytics?: () => void;
  onManage?: () => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onPress,
  onEdit,
  onAnalytics,
  onManage,
}) => {
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return {
          text: 'Active',
          backgroundColor: '#d1fae5', // green-100
          textColor: '#047857', // green-700
        };
      case 'draft':
        return {
          text: 'Draft',
          backgroundColor: '#fef3c7', // yellow-100
          textColor: '#d97706', // yellow-700
        };
      case 'inactive':
        return {
          text: 'Inactive',
          backgroundColor: '#f3f4f6', // gray-100
          textColor: '#374151', // gray-700
        };
      default:
        return {
          text: status.charAt(0).toUpperCase() + status.slice(1),
          backgroundColor: Colors.card,
          textColor: Colors.textSecondary,
        };
    }
  };

  const statusConfig = getStatusConfig(listing.status);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <ThemedView style={styles.card}>
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: listing.images?.[0]?.url || 'https://via.placeholder.com/150' }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.statusBadge}>
            <View style={[styles.statusBadgeInner, { backgroundColor: statusConfig.backgroundColor }]}>
              <Text style={[styles.statusText, { color: statusConfig.textColor }]}>
                {statusConfig.text}
              </Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2}>
              {listing.title}
            </Text>
            <Text style={styles.price}>
              {formatCurrency(listing.base_price, listing.currency)}
            </Text>
          </View>

          <Text style={styles.location}>
            {listing.address?.city}, {listing.address?.country}
          </Text>

          <View style={styles.details}>
            <View style={styles.detailItem}>
              <Ionicons name="people-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.detailText}>
                Up to {listing.max_guests} guest{listing.max_guests !== 1 ? 's' : ''}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="pricetag-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.detailText}>
                {listing.price_per}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={onEdit}
              >
                <Ionicons name="create-outline" size={16} color={Colors.primary} />
                <Text style={styles.secondaryButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
            {onAnalytics && (
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={onAnalytics}
              >
                <Ionicons name="bar-chart-outline" size={16} color={Colors.primary} />
                <Text style={styles.secondaryButtonText}>Analytics</Text>
              </TouchableOpacity>
            )}
            {onManage && (
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={onManage}
              >
                <Ionicons name="settings-outline" size={16} color={Colors.primary} />
                <Text style={styles.secondaryButtonText}>Manage</Text>
              </TouchableOpacity>
            )}
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
  statusBadgeInner: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
});