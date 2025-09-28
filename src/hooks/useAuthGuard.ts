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
    console.log('[useAuthGuard] Checking auth state:', {
      isAuthenticated,
      isLoading,
      hasUser: !!user,
      hasProfile: !!profile,
      requireProfile
    });

    // Don't redirect while loading
    if (isLoading) {
      console.log('[useAuthGuard] Still loading, skipping redirect');
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      console.log('[useAuthGuard] User not authenticated, redirecting to welcome');
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
      console.log('[useAuthGuard] Profile required but missing, redirecting to onboarding');
      // Defer redirect
      setTimeout(() => {
        router.replace('/onboarding/1');
      }, 100);
      return;
    }

    console.log('[useAuthGuard] Auth check passed, allowing access');
  }, [isAuthenticated, isLoading, user, profile, requireProfile, onUnauthorized, router]);

  return {
    isAuthenticated: isAuthenticated && !!user,
    hasProfile: !!profile,
    isLoading,
    user,
    profile
  };
}