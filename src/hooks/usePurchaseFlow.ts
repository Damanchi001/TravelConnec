import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { revenueCatService } from '../services/revenuecat/client';
import { useSubscriptionStore } from '../stores/subscription-store';

interface UsePurchaseFlowReturn {
  purchasePlan: (planId: string) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  isPurchasing: boolean;
  purchaseError: string | null;
  showUpgradePrompt: (feature: string, requiredTier: string) => void;
  clearError: () => void;
}

export function usePurchaseFlow(): UsePurchaseFlowReturn {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const router = useRouter();
  const {
    startPurchase,
    completePurchase,
    availableTiers,
    status
  } = useSubscriptionStore();

  const purchasePlan = useCallback(async (planId: string): Promise<boolean> => {
    try {
      setIsPurchasing(true);
      setPurchaseError(null);

      // Mark purchase as started in store
      startPurchase(planId);

      // Initialize RevenueCat if needed
      await revenueCatService.initialize();

      // Get the offering and find the package
      const offering = await revenueCatService.getCurrentOffering();
      if (!offering) {
        throw new Error('No subscription offerings available');
      }

      // Find the package for this plan
      const packageToPurchase = offering.availablePackages.find(
        pkg => pkg.identifier === planId
      );

      if (!packageToPurchase) {
        throw new Error('Selected plan not found');
      }

      // Purchase the package
      const success = await revenueCatService.purchasePackage(packageToPurchase);

      if (success) {
        // Purchase successful - status will be updated automatically
        console.log('Purchase successful');
      }

      // Mark purchase as completed
      completePurchase(success);

      return success;

    } catch (err: any) {
      console.error('Purchase error:', err);
      const errorMessage = err.message || 'Purchase failed';
      setPurchaseError(errorMessage);
      completePurchase(false, errorMessage);

      // Show error alert
      Alert.alert(
        'Purchase Failed',
        errorMessage,
        [{ text: 'OK' }]
      );

      return false;
    } finally {
      setIsPurchasing(false);
    }
  }, [startPurchase, completePurchase, router]);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    try {
      setIsPurchasing(true);
      setPurchaseError(null);

      // Initialize RevenueCat if needed
      await revenueCatService.initialize();

      // Restore purchases
      const success = await revenueCatService.restorePurchases();

      if (success) {
        Alert.alert(
          'Success',
          'Your purchases have been restored!',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'No Purchases Found',
          'No previous purchases were found to restore.',
          [{ text: 'OK' }]
        );
      }

      return success;

    } catch (err: any) {
      console.error('Restore error:', err);
      const errorMessage = err.message || 'Failed to restore purchases';
      setPurchaseError(errorMessage);

      Alert.alert(
        'Restore Failed',
        errorMessage,
        [{ text: 'OK' }]
      );

      return false;
    } finally {
      setIsPurchasing(false);
    }
  }, []);

  const showUpgradePrompt = useCallback((feature: string, requiredTier: string) => {
    const requiredPlan = availableTiers.find(tier => tier.id.includes(requiredTier));

    if (!requiredPlan) {
      Alert.alert(
        'Feature Unavailable',
        `This feature requires a ${requiredTier} subscription.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Upgrade Required',
      `Unlock "${feature}" with ${requiredPlan.name} plan for ${requiredPlan.price}/${requiredPlan.period}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Upgrade',
          onPress: () => {
            // Navigate to plans screen - navigation will be handled by parent component
            console.log('Navigate to plans with highlighted plan:', requiredPlan.id);
          }
        }
      ]
    );
  }, [availableTiers, router]);

  const clearError = useCallback(() => {
    setPurchaseError(null);
  }, []);

  return {
    purchasePlan,
    restorePurchases,
    isPurchasing,
    purchaseError,
    showUpgradePrompt,
    clearError,
  };
}