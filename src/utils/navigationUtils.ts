import { User } from '@supabase/supabase-js';
import { UserProfile } from '../services/supabase/auth';
import { useAuthStore } from '../stores/auth-store';

export interface NavigationState {
  isAuthenticated: boolean;
  hasProfile: boolean;
  isNewUser: boolean;
  needsOnboarding: boolean;
  needsSubscription: boolean;
}

/**
 * Determine where a user should be redirected based on their auth state
 */
export function getAuthRedirectPath(
  isAuthenticated: boolean,
  user: User | null,
  profile: UserProfile | null
): string {
  // Unauthenticated users go to welcome
  if (!isAuthenticated || !user) {
    return '/welcome';
  }

  // User is authenticated but has no profile - needs onboarding
  if (!profile) {
    return '/onboarding/1';
  }

  // User has profile but onboarding not complete - needs profile setup
  if (!hasCompletedOnboarding(profile)) {
    return '/profile-setup';
  }

  // Check if user is new (created recently) - might need subscription
  const userCreatedAt = new Date(user.created_at);
  const now = new Date();
  const daysSinceCreation = (now.getTime() - userCreatedAt.getTime()) / (1000 * 60 * 60 * 24);

  // If user is new (less than 1 day old) and hasn't seen subscription plans
  if (daysSinceCreation < 1) {
    // You could check a flag in profile to see if they've completed subscription flow
    // For now, assume new users need to see subscription plans
    return '/(subscription)/plans';
  }

  // Default to main app for authenticated users with complete profiles
  return '/(tabs)';
}

/**
 * Check if user has completed onboarding
 */
export function hasCompletedOnboarding(profile: UserProfile | null): boolean {
  if (!profile) return false;

  // Check if required onboarding fields are filled
  const hasBasicInfo = !!(
    profile.first_name &&
    profile.last_name &&
    profile.user_type
  );

  // Check if profile setup is complete (has preferences from profile-setup screen)
  const hasProfileSetup = !!profile.preferences;

  return hasBasicInfo && hasProfileSetup;
}

/**
 * Check if user is considered "new" (recently signed up)
 */
export function isNewUser(user: User | null): boolean {
  if (!user) return false;
  
  const userCreatedAt = new Date(user.created_at);
  const now = new Date();
  const daysSinceCreation = (now.getTime() - userCreatedAt.getTime()) / (1000 * 60 * 60 * 24);
  
  return daysSinceCreation < 1; // User is new if created less than 1 day ago
}

/**
 * Get current navigation state for use in routing logic
 */
export function getNavigationState(): NavigationState {
  const { isAuthenticated, user, profile } = useAuthStore.getState();
  
  const hasProfile = !!profile;
  const userIsNew = isNewUser(user);
  const needsOnboarding = isAuthenticated && !hasCompletedOnboarding(profile);
  const needsSubscription = isAuthenticated && hasProfile && userIsNew;
  
  return {
    isAuthenticated,
    hasProfile,
    isNewUser: userIsNew,
    needsOnboarding,
    needsSubscription
  };
}

/**
 * Determine the next step in the user flow
 */
export function getNextUserFlowStep(
  isAuthenticated: boolean,
  user: User | null,
  profile: UserProfile | null
): {
  path: string;
  reason: string;
} {
  // Not authenticated
  if (!isAuthenticated || !user) {
    return {
      path: '/welcome',
      reason: 'User not authenticated'
    };
  }

  // Authenticated but no profile
  if (!profile) {
    return {
      path: '/onboarding/1',
      reason: 'Profile not created'
    };
  }

  // Profile exists but onboarding not complete
  if (!hasCompletedOnboarding(profile)) {
    return {
      path: '/onboarding/1',
      reason: 'Onboarding not completed'
    };
  }

  // New user with complete profile - show subscription
  if (isNewUser(user)) {
    return {
      path: '/(subscription)/plans',
      reason: 'New user needs to see subscription options'
    };
  }

  // All good, go to main app
  return {
    path: '/(tabs)',
    reason: 'User ready for main app'
  };
}

/**
 * Hook to get current navigation utilities
 */
export function useNavigationUtils() {
  const { isAuthenticated, user, profile } = useAuthStore();
  
  return {
    getRedirectPath: () => getAuthRedirectPath(isAuthenticated, user, profile),
    getNavigationState: () => getNavigationState(),
    getNextStep: () => getNextUserFlowStep(isAuthenticated, user, profile),
    hasCompletedOnboarding: () => hasCompletedOnboarding(profile),
    isNewUser: () => isNewUser(user)
  };
}