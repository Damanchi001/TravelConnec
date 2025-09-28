import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../stores/auth-store';

export interface RequireAuthOptions {
  requireProfile?: boolean;
  redirectTo?: string;
}

/**
 * Hook that throws or redirects if user is not authenticated
 * Use this in components that absolutely require authentication
 */
export function useRequireAuth(options: RequireAuthOptions = {}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, profile } = useAuthStore();
  
  const {
    requireProfile = false
  } = options;

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return;

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      router.replace('/welcome');
      return;
    }

    // Check if profile is required but missing
    if (requireProfile && !profile) {
      router.replace('/onboarding/1');
      return;
    }
  }, [isAuthenticated, isLoading, user, profile, requireProfile, router]);

  // Return auth state for use in components
  const authState = {
    user,
    profile,
    isAuthenticated: isAuthenticated && !!user,
    hasProfile: !!profile,
    isLoading
  };

  // Throw if not authenticated (for strict components)
  if (!isLoading && (!isAuthenticated || !user)) {
    throw new Error('Authentication required');
  }

  // Throw if profile is required but missing
  if (!isLoading && requireProfile && !profile) {
    throw new Error('Profile completion required');
  }

  return authState;
}