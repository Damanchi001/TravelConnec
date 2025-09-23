import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { usePurchaseFlow } from '@/src/hooks/usePurchaseFlow';
import { useSubscriptionPlans } from '@/src/hooks/useSubscriptionPlans';
import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

interface UpgradePromptModalProps {
  visible: boolean;
  onClose: () => void;
  feature: string;
  requiredTier: string;
  currentTier?: string;
}

export function UpgradePromptModal({
  visible,
  onClose,
  feature,
  requiredTier,
  currentTier = 'social'
}: UpgradePromptModalProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const { plans } = useSubscriptionPlans();
  const { purchasePlan, isPurchasing } = usePurchaseFlow();

  const recommendedPlan = plans.find(plan => plan.id.includes(requiredTier) && plan.period === 'year') ||
                         plans.find(plan => plan.id.includes(requiredTier));

  const getTierDisplayName = (tier: string) => {
    switch (tier) {
      case 'traveler': return 'Traveler';
      case 'entrepreneur': return 'Entrepreneur';
      default: return 'Premium';
    }
  };

  const getCurrentTierDisplay = () => {
    switch (currentTier) {
      case 'social': return 'Social (Free)';
      case 'traveler': return 'Traveler';
      case 'entrepreneur': return 'Entrepreneur';
      default: return 'Free';
    }
  };

  const handleUpgrade = async () => {
    if (!recommendedPlan) return;

    const success = await purchasePlan(recommendedPlan.id);
    if (success) {
      onClose();
    }
  };

  const handleViewPlans = () => {
    onClose();
    // Navigate to plans screen - this would be handled by parent component
    console.log('Navigate to plans screen');
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <ThemedText style={styles.icon}>⭐</ThemedText>
            </View>
            <ThemedText style={[styles.title, { color: textColor }]}>
              Unlock Premium Feature
            </ThemedText>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <ThemedText style={[styles.message, { color: textColor, opacity: 0.8 }]}>
              <ThemedText style={[styles.featureText, { color: textColor }]}>
                &ldquo;{feature}&rdquo;
              </ThemedText> is a premium feature available with the{' '}
              <ThemedText style={[styles.tierText, { color: textColor }]}>
                {getTierDisplayName(requiredTier)} Plan
              </ThemedText>.
            </ThemedText>

            <View style={styles.currentPlan}>
              <ThemedText style={[styles.currentPlanText, { color: textColor, opacity: 0.7 }]}>
                Current Plan: {getCurrentTierDisplay()}
              </ThemedText>
            </View>

            {/* Plan Preview */}
            {recommendedPlan && (
              <View style={styles.planPreview}>
                <ThemedText style={[styles.planName, { color: textColor }]}>
                  {recommendedPlan.name}
                </ThemedText>
                <ThemedText style={[styles.planPrice, { color: textColor }]}>
                  {recommendedPlan.price}
                  <ThemedText style={[styles.planPeriod, { color: textColor, opacity: 0.7 }]}>
                    /{recommendedPlan.period}
                  </ThemedText>
                </ThemedText>

                {recommendedPlan.savings && (
                  <View style={styles.savingsBadge}>
                    <ThemedText style={styles.savingsText}>
                      {recommendedPlan.savings}
                    </ThemedText>
                  </View>
                )}

                {/* Key Features */}
                <View style={styles.featuresList}>
                  {recommendedPlan.features.slice(0, 3).map((featureItem, index) => (
                    <View key={index} style={styles.featureItem}>
                      <ThemedText style={[styles.featureBullet, { color: textColor }]}>•</ThemedText>
                      <ThemedText style={[styles.featureItemText, { color: textColor, opacity: 0.8 }]}>
                        {featureItem}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: textColor, opacity: 0.3 }]}
              onPress={handleViewPlans}
            >
              <ThemedText style={[styles.secondaryButtonText, { color: textColor }]}>
                View All Plans
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.upgradeButton, isPurchasing && styles.upgradeButtonDisabled]}
              onPress={handleUpgrade}
              disabled={isPurchasing}
            >
              <ThemedText style={styles.upgradeButtonText}>
                {isPurchasing ? 'Processing...' : `Upgrade to ${getTierDisplayName(requiredTier)}`}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <ThemedText style={[styles.closeButtonText, { color: textColor, opacity: 0.5 }]}>
              ✕
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    marginBottom: 24,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  featureText: {
    fontWeight: '600',
  },
  tierText: {
    fontWeight: '600',
    color: '#10B981',
  },
  currentPlan: {
    alignItems: 'center',
    marginBottom: 20,
  },
  currentPlanText: {
    fontSize: 14,
  },
  planPreview: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  planPeriod: {
    fontSize: 16,
  },
  savingsBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'center',
    marginBottom: 12,
  },
  savingsText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  featuresList: {
    marginTop: 12,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  featureBullet: {
    fontSize: 14,
    marginRight: 8,
    marginTop: 2,
  },
  featureItemText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  actions: {
    gap: 12,
  },
  secondaryButton: {
    borderWidth: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  upgradeButton: {
    backgroundColor: '#10B981',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  upgradeButtonDisabled: {
    opacity: 0.6,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});