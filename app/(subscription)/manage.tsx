import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import SubscriptionStatus from '@/src/components/subscription/SubscriptionStatus';
import { usePurchaseFlow } from '@/src/hooks/usePurchaseFlow';
import { useSubscriptionPlans } from '@/src/hooks/useSubscriptionPlans';
import { useSubscriptionStatus } from '@/src/hooks/useSubscriptionStatus';
import React from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SubscriptionManageScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const { status, isLoading: statusLoading, isInTrial, expirationDate } = useSubscriptionStatus();
  const { isPurchasing } = usePurchaseFlow();
  const { plans } = useSubscriptionPlans();

  const handleCancelSubscription = async () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: async () => {
            // TODO: Implement subscription cancellation with RevenueCat
            Alert.alert('Feature Coming Soon', 'Subscription cancellation will be available in a future update.');
          }
        }
      ]
    );
  };

  const handleRestorePurchases = () => {
    // This would trigger the restore purchases flow
    Alert.alert('Restore Purchases', 'Restoring your previous purchases...');
  };

  const getNextBillingDate = () => {
    if (!expirationDate) return null;
    return expirationDate.toLocaleDateString();
  };

  const getCurrentPlanDetails = () => {
    if (!status.tier) return null;
    return plans.find(plan => plan.id === status.tier);
  };

  const currentPlan = getCurrentPlanDetails();

  if (statusLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Loading subscription...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={[styles.title, { color: textColor }]}>
            Manage Subscription
          </ThemedText>
        </View>

        {/* Current Subscription Status */}
        <View style={styles.section}>
          <SubscriptionStatus status={status} />
        </View>

        {/* Billing Information */}
        {status.isActive && (
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Billing Information
            </ThemedText>

            <View style={styles.billingCard}>
              <View style={styles.billingRow}>
                <ThemedText style={[styles.billingLabel, { color: textColor }]}>
                  Current Plan:
                </ThemedText>
                <ThemedText style={[styles.billingValue, { color: textColor }]}>
                  {currentPlan?.name || status.tier}
                </ThemedText>
              </View>

              {isInTrial && (
                <View style={styles.billingRow}>
                  <ThemedText style={[styles.billingLabel, { color: textColor }]}>
                    Trial Ends:
                  </ThemedText>
                  <ThemedText style={[styles.billingValue, { color: textColor }]}>
                    {getNextBillingDate()}
                  </ThemedText>
                </View>
              )}

              {!isInTrial && expirationDate && (
                <View style={styles.billingRow}>
                  <ThemedText style={[styles.billingLabel, { color: textColor }]}>
                    Next Billing Date:
                  </ThemedText>
                  <ThemedText style={[styles.billingValue, { color: textColor }]}>
                    {getNextBillingDate()}
                  </ThemedText>
                </View>
              )}

              {currentPlan?.price && (
                <View style={styles.billingRow}>
                  <ThemedText style={[styles.billingLabel, { color: textColor }]}>
                    Amount:
                  </ThemedText>
                  <ThemedText style={[styles.billingValue, { color: textColor }]}>
                    {currentPlan.price}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Plan Management Actions */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Plan Management
          </ThemedText>

          <TouchableOpacity
            style={[styles.actionButton, styles.upgradeButton]}
            onPress={() => {
              // Navigate to plans screen for upgrades
              console.log('Navigate to plans screen');
            }}
          >
            <ThemedText style={styles.upgradeButtonText}>
              {status.tier === 'social' ? 'Upgrade to Premium' :
               status.tier === 'traveler' ? 'Upgrade to Entrepreneur' :
               'Change Plan'}
            </ThemedText>
          </TouchableOpacity>

          {status.isActive && !isInTrial && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancelSubscription}
              disabled={isPurchasing}
            >
              <ThemedText style={styles.cancelButtonText}>
                {isPurchasing ? 'Processing...' : 'Cancel Subscription'}
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Account Actions
          </ThemedText>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleRestorePurchases}
          >
            <ThemedText style={[styles.secondaryButtonText, { color: textColor }]}>
              Restore Previous Purchases
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => {
              // Navigate to billing history or support
              console.log('Navigate to billing history');
            }}
          >
            <ThemedText style={[styles.secondaryButtonText, { color: textColor }]}>
              View Billing History
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Support Information */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Need Help?
          </ThemedText>

          <View style={styles.supportCard}>
            <ThemedText style={[styles.supportText, { color: textColor, opacity: 0.8 }]}>
              Questions about your subscription? Contact our support team for assistance.
            </ThemedText>

            <TouchableOpacity style={styles.supportButton}>
              <ThemedText style={[styles.supportButtonText, { color: textColor }]}>
                Contact Support
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  billingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
  },
  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  billingLabel: {
    fontSize: 14,
    opacity: 0.8,
  },
  billingValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButton: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  upgradeButton: {
    backgroundColor: '#10B981',
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  supportCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  supportText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  supportButton: {
    padding: 8,
  },
  supportButtonText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});