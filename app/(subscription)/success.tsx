import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useSubscriptionPlans } from '@/src/hooks/useSubscriptionPlans';
import { useSubscriptionStatus } from '@/src/hooks/useSubscriptionStatus';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SubscriptionSuccessScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const { status, isInTrial, daysRemaining } = useSubscriptionStatus();
  const { plans } = useSubscriptionPlans();

  const currentPlan = plans.find(plan => plan.id === status.tier);

  const getTrialMessage = () => {
    if (!isInTrial || !daysRemaining) return null;

    if (daysRemaining > 1) {
      return `You have ${daysRemaining} days left in your free trial.`;
    } else if (daysRemaining === 1) {
      return 'You have 1 day left in your free trial.';
    } else {
      return 'Your trial period has ended.';
    }
  };

  const getSuccessMessage = () => {
    if (isInTrial) {
      return 'Welcome to Travel Connec Premium!';
    }

    switch (status.tier) {
      case 'traveler':
        return 'Welcome to Traveler Premium!';
      case 'entrepreneur':
        return 'Welcome to Entrepreneur Premium!';
      default:
        return 'Welcome to Travel Connec!';
    }
  };

  const getFeaturesList = () => {
    if (!currentPlan) return [];

    // Get the first 5 features to display
    return currentPlan.features.slice(0, 5);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Header */}
        <View style={styles.header}>
          <View style={styles.successIcon}>
            <ThemedText style={styles.checkmark}>✓</ThemedText>
          </View>

          <ThemedText style={[styles.successTitle, { color: textColor }]}>
            {getSuccessMessage()}
          </ThemedText>

          <ThemedText style={[styles.successSubtitle, { color: textColor, opacity: 0.7 }]}>
            Your subscription is now active and ready to use
          </ThemedText>
        </View>

        {/* Trial Information */}
        {isInTrial && (
          <View style={styles.trialCard}>
            <ThemedText style={[styles.trialTitle, { color: textColor }]}>
              🎉 Free Trial Activated
            </ThemedText>
            <ThemedText style={[styles.trialMessage, { color: textColor, opacity: 0.8 }]}>
              {getTrialMessage()}
            </ThemedText>
            <ThemedText style={[styles.trialNote, { color: textColor, opacity: 0.6 }]}>
              Enjoy all premium features risk-free. No charges until your trial ends.
            </ThemedText>
          </View>
        )}

        {/* Plan Details */}
        {currentPlan && (
          <View style={styles.planCard}>
            <ThemedText style={[styles.planTitle, { color: textColor }]}>
              Your Plan: {currentPlan.name}
            </ThemedText>

            <View style={styles.planDetails}>
              <ThemedText style={[styles.planPrice, { color: textColor }]}>
                {currentPlan.price}
              </ThemedText>
              <ThemedText style={[styles.planPeriod, { color: textColor, opacity: 0.7 }]}>
                /{currentPlan.period}
              </ThemedText>
            </View>

            {currentPlan.savings && (
              <View style={styles.savingsBadge}>
                <ThemedText style={styles.savingsText}>
                  {currentPlan.savings}
                </ThemedText>
              </View>
            )}
          </View>
        )}

        {/* What&apos;s Included */}
        <View style={styles.featuresCard}>
          <ThemedText style={[styles.featuresTitle, { color: textColor }]}>
            What&apos;s Included
          </ThemedText>

          {getFeaturesList().map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <ThemedText style={[styles.featureBullet, { color: textColor }]}>•</ThemedText>
              <ThemedText style={[styles.featureText, { color: textColor, opacity: 0.8 }]}>
                {feature}
              </ThemedText>
            </View>
          ))}

          {currentPlan && currentPlan.features.length > 5 && (
            <ThemedText style={[styles.moreFeatures, { color: textColor, opacity: 0.6 }]}>
              + {currentPlan.features.length - 5} more features
            </ThemedText>
          )}
        </View>

        {/* Next Steps */}
        <View style={styles.nextStepsCard}>
          <ThemedText style={[styles.nextStepsTitle, { color: textColor }]}>
            Next Steps
          </ThemedText>

          <View style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <ThemedText style={styles.stepNumberText}>1</ThemedText>
            </View>
            <ThemedText style={[styles.stepText, { color: textColor, opacity: 0.8 }]}>
              Complete your profile to get personalized recommendations
            </ThemedText>
          </View>

          <View style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <ThemedText style={styles.stepNumberText}>2</ThemedText>
            </View>
            <ThemedText style={[styles.stepText, { color: textColor, opacity: 0.8 }]}>
              Explore premium features like Travel Buddy matching
            </ThemedText>
          </View>

          <View style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <ThemedText style={styles.stepNumberText}>3</ThemedText>
            </View>
            <ThemedText style={[styles.stepText, { color: textColor, opacity: 0.8 }]}>
              Connect with travelers and start planning your next adventure
            </ThemedText>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.primaryButton]}
            onPress={() => {
              // Navigate to main app
              console.log('Navigate to main app');
            }}
          >
            <ThemedText style={styles.primaryButtonText}>
              Start Exploring
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: textColor, opacity: 0.3 }]}
            onPress={() => {
              // Navigate to subscription management
              console.log('Navigate to subscription management');
            }}
          >
            <ThemedText style={[styles.secondaryButtonText, { color: textColor }]}>
              Manage Subscription
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <ThemedText style={[styles.footerText, { color: textColor, opacity: 0.6 }]}>
            Questions? Contact our support team anytime.
          </ThemedText>
          <TouchableOpacity style={styles.supportButton}>
            <ThemedText style={[styles.supportText, { color: textColor, opacity: 0.8 }]}>
              Get Support
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
  header: {
    alignItems: 'center',
    padding: 32,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkmark: {
    fontSize: 40,
    color: 'white',
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  trialCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  trialTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  trialMessage: {
    fontSize: 16,
    marginBottom: 8,
    lineHeight: 22,
  },
  trialNote: {
    fontSize: 14,
    lineHeight: 20,
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  planDetails: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  planPeriod: {
    fontSize: 16,
    marginLeft: 4,
  },
  savingsBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  savingsText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  featuresCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  featureBullet: {
    fontSize: 16,
    marginRight: 12,
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
    marginTop: 8,
  },
  nextStepsCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    marginBottom: 32,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  actions: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  supportButton: {
    padding: 8,
  },
  supportText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});