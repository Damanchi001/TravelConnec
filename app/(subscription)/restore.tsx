import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { usePurchaseFlow } from '@/src/hooks/usePurchaseFlow';
import { useSubscriptionPlans } from '@/src/hooks/useSubscriptionPlans';
import { useSubscriptionStatus } from '@/src/hooks/useSubscriptionStatus';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RestorePurchasesScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const { restorePurchases, isPurchasing } = usePurchaseFlow();
  const { status, refreshStatus, isInTrial } = useSubscriptionStatus();
  const { plans } = useSubscriptionPlans();

  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreResult, setRestoreResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleRestorePurchases = async () => {
    setIsRestoring(true);
    setRestoreResult(null);

    try {
      const success = await restorePurchases();

      if (success) {
        // Refresh the subscription status to get updated information
        await refreshStatus();

        setRestoreResult({
          success: true,
          message: 'Your purchases have been successfully restored!'
        });
      } else {
        setRestoreResult({
          success: false,
          message: 'No previous purchases were found to restore.'
        });
      }
    } catch (error: any) {
      setRestoreResult({
        success: false,
        message: error.message || 'Failed to restore purchases. Please try again.'
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const getCurrentPlanDisplay = () => {
    if (!status.tier) return 'No active subscription';

    const plan = plans.find(p => p.id === status.tier);
    if (plan) {
      return `${plan.name} (${plan.price}/${plan.period})`;
    }

    return status.tier;
  };

  const getRestoreStatusColor = () => {
    if (!restoreResult) return textColor;
    return restoreResult.success ? '#10B981' : '#EF4444';
  };

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
            Restore Purchases
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: textColor, opacity: 0.7 }]}>
            Recover your previous subscription purchases
          </ThemedText>
        </View>

        {/* Current Status */}
        <View style={styles.statusCard}>
          <ThemedText style={[styles.statusTitle, { color: textColor }]}>
            Current Subscription Status
          </ThemedText>

          <View style={styles.statusRow}>
            <ThemedText style={[styles.statusLabel, { color: textColor }]}>
              Plan:
            </ThemedText>
            <ThemedText style={[styles.statusValue, { color: textColor }]}>
              {getCurrentPlanDisplay()}
            </ThemedText>
          </View>

          <View style={styles.statusRow}>
            <ThemedText style={[styles.statusLabel, { color: textColor }]}>
              Status:
            </ThemedText>
            <ThemedText style={[styles.statusValue, { color: textColor }]}>
              {status.isActive ? 'Active' : 'Inactive'}
            </ThemedText>
          </View>

          {isInTrial && (
            <View style={styles.trialBadge}>
              <ThemedText style={styles.trialBadgeText}>
                Free Trial Active
              </ThemedText>
            </View>
          )}
        </View>

        {/* Restore Information */}
        <View style={styles.infoCard}>
          <ThemedText style={[styles.infoTitle, { color: textColor }]}>
            When to use Restore Purchases
          </ThemedText>

          <View style={styles.infoPoint}>
            <ThemedText style={[styles.bullet, { color: textColor }]}>•</ThemedText>
            <ThemedText style={[styles.infoText, { color: textColor, opacity: 0.8 }]}>
              After reinstalling the app
            </ThemedText>
          </View>

          <View style={styles.infoPoint}>
            <ThemedText style={[styles.bullet, { color: textColor }]}>•</ThemedText>
            <ThemedText style={[styles.infoText, { color: textColor, opacity: 0.8 }]}>
              When switching devices
            </ThemedText>
          </View>

          <View style={styles.infoPoint}>
            <ThemedText style={[styles.bullet, { color: textColor }]}>•</ThemedText>
            <ThemedText style={[styles.infoText, { color: textColor, opacity: 0.8 }]}>
              If your subscription status isn&apos;t showing correctly
            </ThemedText>
          </View>

          <View style={styles.infoPoint}>
            <ThemedText style={[styles.bullet, { color: textColor }]}>•</ThemedText>
            <ThemedText style={[styles.infoText, { color: textColor, opacity: 0.8 }]}>
              After account issues or app updates
            </ThemedText>
          </View>
        </View>

        {/* Restore Result */}
        {restoreResult && (
          <View style={[styles.resultCard, {
            backgroundColor: restoreResult.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'
          }]}>
            <ThemedText style={[styles.resultIcon, { color: getRestoreStatusColor() }]}>
              {restoreResult.success ? '✓' : '✗'}
            </ThemedText>
            <ThemedText style={[styles.resultMessage, { color: getRestoreStatusColor() }]}>
              {restoreResult.message}
            </ThemedText>
          </View>
        )}

        {/* Restore Button */}
        <View style={styles.restoreSection}>
          <TouchableOpacity
            style={[
              styles.restoreButton,
              (isRestoring || isPurchasing) && styles.restoreButtonDisabled
            ]}
            onPress={handleRestorePurchases}
            disabled={isRestoring || isPurchasing}
          >
            {isRestoring || isPurchasing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="white" size="small" />
                <ThemedText style={styles.restoreButtonText}>
                  Restoring...
                </ThemedText>
              </View>
            ) : (
              <ThemedText style={styles.restoreButtonText}>
                Restore Previous Purchases
              </ThemedText>
            )}
          </TouchableOpacity>

          <ThemedText style={[styles.restoreNote, { color: textColor, opacity: 0.6 }]}>
            This process may take a few moments. Please ensure you&apos;re connected to the internet.
          </ThemedText>
        </View>

        {/* Troubleshooting */}
        <View style={styles.troubleshootingCard}>
          <ThemedText style={[styles.troubleshootingTitle, { color: textColor }]}>
            Still having issues?
          </ThemedText>

          <ThemedText style={[styles.troubleshootingText, { color: textColor, opacity: 0.8 }]}>
            If restore purchases doesn&apos;t work, try these steps:
          </ThemedText>

          <View style={styles.troubleshootingStep}>
            <ThemedText style={[styles.stepNumber, { color: textColor }]}>1</ThemedText>
            <ThemedText style={[styles.stepText, { color: textColor, opacity: 0.8 }]}>
              Make sure you&apos;re signed in with the same account you used to purchase
            </ThemedText>
          </View>

          <View style={styles.troubleshootingStep}>
            <ThemedText style={[styles.stepNumber, { color: textColor }]}>2</ThemedText>
            <ThemedText style={[styles.stepText, { color: textColor, opacity: 0.8 }]}>
              Check your internet connection and try again
            </ThemedText>
          </View>

          <View style={styles.troubleshootingStep}>
            <ThemedText style={[styles.stepNumber, { color: textColor }]}>3</ThemedText>
            <ThemedText style={[styles.stepText, { color: textColor, opacity: 0.8 }]}>
              Restart the app and try restore again
            </ThemedText>
          </View>

          <TouchableOpacity style={styles.contactSupport}>
            <ThemedText style={[styles.contactSupportText, { color: textColor }]}>
              Contact Support
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: textColor, opacity: 0.3 }]}
            onPress={() => {
              // Navigate back to subscription management
              console.log('Navigate back to subscription management');
            }}
          >
            <ThemedText style={[styles.secondaryButtonText, { color: textColor }]}>
              Back to Subscription
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton]}
            onPress={() => {
              // Navigate to plans screen
              console.log('Navigate to plans screen');
            }}
          >
            <ThemedText style={styles.primaryButtonText}>
              View All Plans
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
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  statusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusLabel: {
    fontSize: 14,
    opacity: 0.8,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  trialBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  trialBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoPoint: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bullet: {
    fontSize: 16,
    marginRight: 12,
    marginTop: 2,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  resultIcon: {
    fontSize: 20,
    marginRight: 12,
    fontWeight: 'bold',
  },
  resultMessage: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  restoreSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  restoreButton: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  restoreButtonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restoreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  restoreNote: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  troubleshootingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    marginBottom: 32,
  },
  troubleshootingTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  troubleshootingText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  troubleshootingStep: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 12,
    minWidth: 20,
  },
  stepText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  contactSupport: {
    marginTop: 16,
    padding: 8,
  },
  contactSupportText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  actions: {
    marginHorizontal: 20,
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
    marginBottom: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});