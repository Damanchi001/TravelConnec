import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../stores/auth-store';

export interface AuthGuardOptions {
  requireProfile?: boolean;
  onUnauthorized?: () => void;
}

/**
 * Hook to protect routes that require authentication
 * Automatically redirects unauthenticated users to auth flow
 */
export function useAuthGuard(options: AuthGuardOptions = {}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, profile } = useAuthStore();
  
  const {
    requireProfile = false,
    onUnauthorized
  } = options;

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      // Defer redirect to ensure navigator is ready
      setTimeout(() => {
        if (onUnauthorized) {
          onUnauthorized();
        } else {
          router.replace('/welcome');
        }
      }, 100);
      return;
    }

    // Check if profile is required but missing
    if (requireProfile && !profile) {
      // Defer redirect
      setTimeout(() => {
        router.replace('/onboarding/1');
      }, 100);
      return;
    }
  }, [isAuthenticated, isLoading, user, profile, requireProfile, onUnauthorized, router]);

  return {
    isAuthenticated: isAuthenticated && !!user,
    hasProfile: !!profile,
    isLoading,
    user,
    profile
  };
}