import { useCallback, useEffect, useState } from 'react';
import { revenueCatService } from '../services/revenuecat/client';
import { SubscriptionStatus, useSubscriptionStore } from '../stores/subscription-store';

interface UseSubscriptionStatusReturn {
  status: SubscriptionStatus;
  isLoading: boolean;
  error: string | null;
  loadStatus: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  isActive: boolean;
  isInTrial: boolean;
  isInGracePeriod: boolean;
  currentTier: string | null;
  daysRemaining: number | null;
  expirationDate: Date | null;
}

export function useSubscriptionStatus(): UseSubscriptionStatusReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { status, updateSubscriptionStatus, setLoading, setError: setStoreError } = useSubscriptionStore();

  const loadStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setStoreError(null);

      // Initialize RevenueCat if needed
      await revenueCatService.initialize();

      // Load subscription status from RevenueCat
      const subscriptionStatus = await revenueCatService.getSubscriptionStatus();

      // Update the store with the loaded status
      updateSubscriptionStatus(subscriptionStatus);

    } catch (err: any) {
      console.error('Error loading subscription status:', err);
      const errorMessage = err.message || 'Failed to load subscription status';
      setError(errorMessage);
      setStoreError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [updateSubscriptionStatus, setStoreError]);

  const refreshStatus = useCallback(async () => {
    await loadStatus();
  }, [loadStatus]);

  // Calculate derived values
  const isActive = status.isActive;
  const isInTrial = status.isInFreeTrial;
  const isInGracePeriod = status.isInGracePeriod;
  const currentTier = status.tier;

  const daysRemaining = status.expirationDate ? (() => {
    const now = new Date();
    const diffTime = status.expirationDate!.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  })() : null;

  const expirationDate = status.expirationDate;

  // Load status on mount
  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  return {
    status,
    isLoading,
    error,
    loadStatus,
    refreshStatus,
    isActive,
    isInTrial,
    isInGracePeriod,
    currentTier,
    daysRemaining,
    expirationDate,
  };
}