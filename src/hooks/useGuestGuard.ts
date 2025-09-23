import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../stores/auth-store';

export interface GuestGuardOptions {
  onAuthenticated?: () => void;
}

/**
 * Hook to protect routes that should only be accessible to unauthenticated users
 * Automatically redirects authenticated users to the appropriate screen
 */
export function useGuestGuard(options: GuestGuardOptions = {}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, profile } = useAuthStore();
  
  const { onAuthenticated } = options;

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    // Check if user is authenticated
    if (isAuthenticated && user) {
      if (onAuthenticated) {
        onAuthenticated();
      } else {
        // Determine where to redirect based on user state
        if (!profile) {
          // User needs to complete onboarding
          router.replace('/onboarding/1');
        } else {
          // User has profile, redirect to main app
          router.replace('/(tabs)');
        }
      }
      return;
    }
  }, [isAuthenticated, isLoading, user, profile, onAuthenticated, router]);

  return {
    isGuest: !isAuthenticated || !user,
    isLoading,
    canAccess: !isAuthenticated || !user
  };
}