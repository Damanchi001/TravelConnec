import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { SubscriptionStatus as SubscriptionStatusType } from '@/src/stores/subscription-store';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface SubscriptionStatusProps {
  status: SubscriptionStatusType;
  style?: any;
}

export default function SubscriptionStatus({ status, style }: SubscriptionStatusProps) {
  const primaryColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');

  const getTierDisplayName = (tier: string | null) => {
    switch (tier) {
      case 'social':
        return 'Social Plan';
      case 'traveler':
        return 'Traveler Plan';
      case 'entrepreneur':
        return 'Entrepreneur Plan';
      default:
        return 'Free Plan';
    }
  };

  const getTierColor = (tier: string | null) => {
    switch (tier) {
      case 'social':
        return '#6B7280'; // Gray
      case 'traveler':
        return primaryColor; // Primary blue
      case 'entrepreneur':
        return '#7C3AED'; // Purple
      default:
        return '#6B7280';
    }
  };

  const getStatusBadge = () => {
    if (status.isInFreeTrial) {
      return {
        text: 'Free Trial',
        color: '#10B981', // Green
        backgroundColor: '#D1FAE5'
      };
    }

    if (status.isInGracePeriod) {
      return {
        text: 'Payment Due',
        color: '#F59E0B', // Amber
        backgroundColor: '#FEF3C7'
      };
    }

    if (status.isActive) {
      return {
        text: 'Active',
        color: '#10B981', // Green
        backgroundColor: '#D1FAE5'
      };
    }

    return {
      text: 'Free Plan',
      color: '#6B7280', // Gray
      backgroundColor: '#F3F4F6'
    };
  };

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysRemaining = () => {
    if (!status.expirationDate) return null;
    const now = new Date();
    const diffTime = status.expirationDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const badge = getStatusBadge();
  const tierColor = getTierColor(status.tier);
  const daysRemaining = getDaysRemaining();

  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <ThemedText style={[styles.title, { color: tierColor }]}>
            {getTierDisplayName(status.tier)}
          </ThemedText>
          <View style={[styles.badge, { backgroundColor: badge.backgroundColor }]}>
            <Text style={[styles.badgeText, { color: badge.color }]}>
              {badge.text}
            </Text>
          </View>
        </View>
      </View>

      {/* Status Details */}
      <View style={styles.detailsContainer}>
        {status.isInFreeTrial && (
          <View style={styles.trialContainer}>
            <Text style={[styles.trialText, { color: '#10B981' }]}>
              🎉 You&apos;re on a free trial!
            </Text>
            <ThemedText style={styles.trialSubtext}>
              Enjoy all premium features at no cost.
            </ThemedText>
          </View>
        )}

        {status.isInGracePeriod && (
          <View style={styles.graceContainer}>
            <Text style={[styles.graceText, { color: '#F59E0B' }]}>
              ⚠️ Payment required
            </Text>
            <ThemedText style={styles.graceSubtext}>
              Your subscription will be suspended if payment isn&apos;t received.
            </ThemedText>
          </View>
        )}

        {status.expirationDate && (
          <View style={styles.expirationContainer}>
            <ThemedText style={styles.expirationLabel}>
              {status.willRenew ? 'Renews' : 'Expires'} on:
            </ThemedText>
            <ThemedText style={[styles.expirationDate, { color: tierColor }]}>
              {formatDate(status.expirationDate)}
            </ThemedText>
            {daysRemaining !== null && daysRemaining <= 30 && (
              <ThemedText style={styles.daysRemaining}>
                {daysRemaining} days remaining
              </ThemedText>
            )}
          </View>
        )}

        {!status.isActive && (
          <View style={styles.freeContainer}>
            <ThemedText style={styles.freeText}>
              Upgrade to unlock premium features and remove limitations.
            </ThemedText>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  detailsContainer: {
    gap: 12,
  },
  trialContainer: {
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  trialText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  trialSubtext: {
    fontSize: 12,
    opacity: 0.8,
  },
  graceContainer: {
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  graceText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  graceSubtext: {
    fontSize: 12,
    opacity: 0.8,
  },
  expirationContainer: {
    alignItems: 'center',
  },
  expirationLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  expirationDate: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  daysRemaining: {
    fontSize: 12,
    opacity: 0.7,
  },
  freeContainer: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  freeText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
});