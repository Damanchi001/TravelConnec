import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import PlanCard from '@/src/components/subscription/PlanCard';
import { usePurchaseFlow } from '@/src/hooks/usePurchaseFlow';
import { useSubscriptionPlans } from '@/src/hooks/useSubscriptionPlans';
import { useSubscriptionStatus } from '@/src/hooks/useSubscriptionStatus';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SubscriptionPlansScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const {
    plans,
    isLoading: plansLoading,
    selectedPlan,
    selectPlan,
  } = useSubscriptionPlans();

  const { status, isLoading: statusLoading } = useSubscriptionStatus();
  const { purchasePlan, isPurchasing } = usePurchaseFlow();

  // Group plans by tier for display
  const socialPlans = plans.filter(plan => plan.id === 'social');
  const travelerPlans = plans.filter(plan => plan.id.includes('traveler'));
  const entrepreneurPlans = plans.filter(plan => plan.id.includes('entrepreneur'));

  const handlePlanSelect = (planId: string) => {
    selectPlan(planId);
  };

  const handlePurchase = async (planId: string) => {
    const success = await purchasePlan(planId);
    if (success) {
      // Navigation will be handled by the hook
      console.log('Purchase successful');
    }
  };

  if (plansLoading || statusLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Loading plans...</ThemedText>
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
            Choose Your Plan
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: textColor, opacity: 0.7 }]}>
            Unlock premium features and connect with travelers worldwide
          </ThemedText>
        </View>

        {/* Current Status */}
        {status.isActive && (
          <View style={styles.currentStatus}>
            <ThemedText style={[styles.currentStatusText, { color: textColor }]}>
              Current Plan: {status.tier === 'social' ? 'Social (Free)' :
                            status.tier === 'traveler' ? 'Traveler' :
                            status.tier === 'entrepreneur' ? 'Entrepreneur' : 'Unknown'}
            </ThemedText>
          </View>
        )}

        {/* Social Plan (Free) */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Free Plan
          </ThemedText>
          {socialPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              tier={plan}
              isSelected={selectedPlan === plan.id}
              isCurrentPlan={status.tier === plan.id}
              onSelect={() => handlePlanSelect(plan.id)}
              onPurchase={() => handlePurchase(plan.id)}
              showPurchaseButton={false} // Free plan doesn't need purchase button
            />
          ))}
        </View>

        {/* Traveler Plans */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Premium Plans
          </ThemedText>
          <ThemedText style={[styles.sectionSubtitle, { color: textColor, opacity: 0.7 }]}>
            Perfect for frequent travelers and digital nomads
          </ThemedText>

          {travelerPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              tier={plan}
              isSelected={selectedPlan === plan.id}
              isCurrentPlan={status.tier === plan.id}
              onSelect={() => handlePlanSelect(plan.id)}
              onPurchase={() => handlePurchase(plan.id)}
              showPurchaseButton={!isPurchasing}
            />
          ))}
        </View>

        {/* Entrepreneur Plans */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Business Plans
          </ThemedText>
          <ThemedText style={[styles.sectionSubtitle, { color: textColor, opacity: 0.7 }]}>
            For local guides, travel vendors, and entrepreneurs
          </ThemedText>

          {entrepreneurPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              tier={plan}
              isSelected={selectedPlan === plan.id}
              isCurrentPlan={status.tier === plan.id}
              onSelect={() => handlePlanSelect(plan.id)}
              onPurchase={() => handlePurchase(plan.id)}
              showPurchaseButton={!isPurchasing}
            />
          ))}
        </View>

        {/* Comparison Note */}
        <View style={styles.comparisonNote}>
          <ThemedText style={[styles.comparisonText, { color: textColor, opacity: 0.7 }]}>
            💡 Pro tip: Annual plans save you up to 25% compared to monthly billing
          </ThemedText>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <ThemedText style={[styles.footerText, { color: textColor, opacity: 0.6 }]}>
            All plans include a 7-day free trial. Cancel anytime.
          </ThemedText>
          <TouchableOpacity style={styles.restoreButton}>
            <ThemedText style={[styles.restoreText, { color: textColor, opacity: 0.8 }]}>
              Restore Previous Purchase
            </ThemedText>
          </TouchableOpacity>
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
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  currentStatus: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  currentStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginHorizontal: 20,
    marginBottom: 16,
    lineHeight: 20,
  },
  comparisonNote: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
  },
  comparisonText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 18,
  },
  restoreButton: {
    padding: 8,
  },
  restoreText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});