import { useCallback, useEffect, useState } from 'react';
import { revenueCatService } from '../services/revenuecat/client';
import { SubscriptionTier, useSubscriptionStore } from '../stores/subscription-store';

interface UseSubscriptionPlansReturn {
  plans: SubscriptionTier[];
  isLoading: boolean;
  error: string | null;
  selectedPlan: string | null;
  loadPlans: () => Promise<void>;
  selectPlan: (planId: string) => void;
  getPlanById: (planId: string) => SubscriptionTier | undefined;
  getCurrentPlan: () => SubscriptionTier | undefined;
  getRecommendedPlan: () => SubscriptionTier | undefined;
}

export function useSubscriptionPlans(): UseSubscriptionPlansReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    availableTiers,
    selectedTier,
    setAvailableTiers,
    selectTier,
    status
  } = useSubscriptionStore();

  const loadPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Initialize RevenueCat if needed
      await revenueCatService.initialize();

      // Load subscription tiers from RevenueCat
      const tiers = await revenueCatService.getSubscriptionTiers();

      // Update the store with loaded tiers
      setAvailableTiers(tiers);

    } catch (err: any) {
      console.error('Error loading subscription plans:', err);
      setError(err.message || 'Failed to load subscription plans');

      // Fallback to store defaults if RevenueCat fails
      console.log('Using fallback subscription plans from store');
    } finally {
      setIsLoading(false);
    }
  }, [setAvailableTiers]);

  const selectPlan = useCallback((planId: string) => {
    selectTier(planId);
  }, [selectTier]);

  const getPlanById = useCallback((planId: string) => {
    return availableTiers.find(tier => tier.id === planId);
  }, [availableTiers]);

  const getCurrentPlan = useCallback(() => {
    return availableTiers.find(tier => tier.id === status.tier);
  }, [availableTiers, status.tier]);

  const getRecommendedPlan = useCallback(() => {
    // Return the plan marked as popular, or the annual traveler plan as default
    return availableTiers.find(tier => tier.isPopular) ||
           availableTiers.find(tier => tier.id === 'traveler_annual') ||
           availableTiers.find(tier => tier.id.includes('traveler'));
  }, [availableTiers]);

  // Load plans on mount
  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  return {
    plans: availableTiers,
    isLoading,
    error,
    selectedPlan: selectedTier,
    loadPlans,
    selectPlan,
    getPlanById,
    getCurrentPlan,
    getRecommendedPlan,
  };
}