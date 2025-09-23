import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { SubscriptionTier } from '@/src/stores/subscription-store';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PlanCardProps {
  tier: SubscriptionTier;
  isSelected?: boolean;
  isCurrentPlan?: boolean;
  onSelect?: () => void;
  onPurchase?: () => void;
  showPurchaseButton?: boolean;
}

export default function PlanCard({
  tier,
  isSelected = false,
  isCurrentPlan = false,
  onSelect,
  onPurchase,
  showPurchaseButton = true
}: PlanCardProps) {
  const primaryColor = useThemeColor({}, 'tint');
  const cardBackground = useThemeColor({}, 'background');

  const getTierColor = (tierId: string) => {
    switch (tierId) {
      case 'social':
        return '#6B7280'; // Gray
      case 'traveler':
        return primaryColor; // Primary blue
      case 'entrepreneur':
        return '#7C3AED'; // Purple
      default:
        return primaryColor;
    }
  };

  const tierColor = getTierColor(tier.id);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: cardBackground,
          borderColor: isSelected ? tierColor : 'transparent',
          borderWidth: isSelected ? 2 : 1,
        }
      ]}
      onPress={onSelect}
      disabled={!onSelect}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <ThemedText style={[styles.title, { color: tierColor }]}>
            {tier.name}
          </ThemedText>
          {tier.isPopular && (
            <View style={[styles.popularBadge, { backgroundColor: tierColor }]}>
              <Text style={styles.popularText}>Most Popular</Text>
            </View>
          )}
          {isCurrentPlan && (
            <View style={[styles.currentBadge, { backgroundColor: tierColor }]}>
              <Text style={styles.currentText}>Current Plan</Text>
            </View>
          )}
        </View>

        {/* Pricing */}
        <View style={styles.pricingContainer}>
          <View style={styles.priceRow}>
            <ThemedText style={[styles.price, { color: tierColor }]}>
              {tier.price}
            </ThemedText>
            <ThemedText style={styles.period}>
              {tier.period === 'forever' ? '' :
               tier.period === 'month' ? '/month' :
               tier.period === 'quarter' ? '/quarter' :
               '/year'}
            </ThemedText>
          </View>

          {tier.savings && (
            <View style={styles.savingsContainer}>
              <ThemedText style={styles.originalPrice}>
                {tier.originalPrice}
              </ThemedText>
              <View style={[styles.savingsBadge, { backgroundColor: '#10B981' }]}>
                <Text style={styles.savingsText}>{tier.savings}</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Features */}
      <View style={styles.featuresContainer}>
        {tier.features.slice(0, 5).map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Text style={[styles.checkmark, { color: tierColor }]}>✓</Text>
            <ThemedText style={styles.featureText} numberOfLines={2}>
              {feature}
            </ThemedText>
          </View>
        ))}
        {tier.features.length > 5 && (
          <ThemedText style={styles.moreFeatures}>
            +{tier.features.length - 5} more features
          </ThemedText>
        )}
      </View>

      {/* Purchase Button */}
      {showPurchaseButton && !isCurrentPlan && (
        <TouchableOpacity
          style={[styles.purchaseButton, { backgroundColor: tierColor }]}
          onPress={onPurchase}
        >
          <Text style={styles.purchaseButtonText}>
            {tier.price === '$0' ? 'Get Started' : 'Choose Plan'}
          </Text>
        </TouchableOpacity>
      )}

      {isCurrentPlan && (
        <View style={[styles.currentPlanButton, { borderColor: tierColor }]}>
          <Text style={[styles.currentPlanText, { color: tierColor }]}>
            Current Plan
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  popularBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  currentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pricingContainer: {
    marginTop: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  period: {
    fontSize: 16,
    marginLeft: 4,
    opacity: 0.7,
  },
  savingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  originalPrice: {
    fontSize: 16,
    textDecorationLine: 'line-through',
    opacity: 0.6,
    marginRight: 8,
  },
  savingsBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  savingsText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  checkmark: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  featureText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  moreFeatures: {
    fontSize: 14,
    fontStyle: 'italic',
    opacity: 0.7,
    marginTop: 4,
  },
  purchaseButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  currentPlanButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  currentPlanText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});