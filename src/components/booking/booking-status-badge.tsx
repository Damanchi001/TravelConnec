import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../../constants/colors';

interface BookingStatusBadgeProps {
  status: string;
}

export const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({ status }) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          text: 'Pending',
          backgroundColor: '#fef3c7', // yellow-100
          textColor: '#d97706', // yellow-700
        };
      case 'confirmed':
        return {
          text: 'Confirmed',
          backgroundColor: '#dbeafe', // blue-100
          textColor: '#1d4ed8', // blue-700
        };
      case 'completed':
        return {
          text: 'Completed',
          backgroundColor: '#d1fae5', // green-100
          textColor: '#047857', // green-700
        };
      case 'cancelled':
        return {
          text: 'Cancelled',
          backgroundColor: '#fee2e2', // red-100
          textColor: '#dc2626', // red-600
        };
      case 'refunded':
        return {
          text: 'Refunded',
          backgroundColor: '#f3e8ff', // purple-100
          textColor: '#7c3aed', // purple-600
        };
      case 'partially_refunded':
        return {
          text: 'Partial Refund',
          backgroundColor: '#f3e8ff', // purple-100
          textColor: '#7c3aed', // purple-600
        };
      default:
        return {
          text: status.charAt(0).toUpperCase() + status.slice(1),
          backgroundColor: Colors.card,
          textColor: Colors.textSecondary,
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <View style={[styles.badge, { backgroundColor: config.backgroundColor }]}>
      <Text style={[styles.text, { color: config.textColor }]}>
        {config.text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});