import { AuthService, UserProfile } from '@/src/services/supabase/auth';
import { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

let AsyncStorage;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  console.warn('AsyncStorage not available, auth will not persist');
  AsyncStorage = null;
}

let revenueCatService;
try {
  revenueCatService = require('@/src/services/revenuecat/client').revenueCatService;
} catch (e) {
  console.warn('RevenueCat not available, subscription features disabled');
  revenueCatService = { logout: async () => {} };
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signInWithFacebook: () => Promise<{ success: boolean; error?: string }>;
  signInWithApple: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

const storeConfig = (set: any, get: any) => ({
  // Initial state
  user: null,
  session: null,
  profile: null,
  isLoading: false,
  isAuthenticated: false,

  // Actions
  signIn: async (email: string, password: string) => {
    set({ isLoading: true });

    try {
      const { data, error } = await AuthService.signIn({ email, password });

      if (error) {
        set({ isLoading: false });
        return { success: false, error: error.message };
      }

      if (data.user && data.session) {
        set({
          user: data.user,
          session: data.session,
          isAuthenticated: true,
          isLoading: false
        });

        // Load user profile
        const { profile } = get();
        if (!profile && data.user.id) {
          const { data: profileData } = await AuthService.getUserProfile(data.user.id);
          if (profileData) {
            set({ profile: profileData });
          }
        }

        return { success: true };
      }

      set({ isLoading: false });
      return { success: false, error: 'Authentication failed' };
    } catch (error: any) {
      set({ isLoading: false });
      return { success: false, error: error.message || 'An error occurred' };
    }
  },

  signUp: async ({ email, password, firstName, lastName }: any) => {
    set({ isLoading: true });

    try {
      const { data, error } = await AuthService.signUp({
        email,
        password,
        firstName,
        lastName
      });

      if (error) {
        set({ isLoading: false });
        return { success: false, error: error.message };
      }

      if (data.user) {
        // For sign up, user might need email confirmation
        set({
          user: data.user,
          session: data.session,
          isAuthenticated: !!data.session,
          isLoading: false
        });

        return { success: true };
      }

      set({ isLoading: false });
      return { success: false, error: 'Registration failed' };
    } catch (error: any) {
      set({ isLoading: false });
      return { success: false, error: error.message || 'An error occurred' };
    }
  },

  signInWithGoogle: async () => {
    set({ isLoading: true });

    try {
      console.log('[AuthStore] Initiating Google OAuth sign-in');
      const { data, error } = await AuthService.signInWithGoogle();

      if (error) {
        console.error('[AuthStore] Google OAuth error:', error);
        set({ isLoading: false });
        return { success: false, error: error.message };
      }

      console.log('[AuthStore] Google OAuth initiated, waiting for callback');
      // OAuth will handle the redirect and auth state change will be caught by the listener
      // Keep loading state until auth state changes or timeout
      setTimeout(() => {
        // If still loading after 60 seconds, reset loading state
        const currentState = get();
        if (currentState.isLoading) {
          console.warn('[AuthStore] Google OAuth timeout after 60 seconds, resetting loading state');
          set({ isLoading: false });
        }
      }, 60000);

      return { success: true };
    } catch (error: any) {
      console.error('[AuthStore] Google OAuth exception:', error);
      set({ isLoading: false });
      return { success: false, error: error.message || 'Google sign-in failed' };
    }
  },

  signInWithFacebook: async () => {
    set({ isLoading: true });

    try {
      console.log('[AuthStore] Initiating Facebook OAuth sign-in');
      const { data, error } = await AuthService.signInWithFacebook();

      if (error) {
        console.error('[AuthStore] Facebook OAuth error:', error);
        set({ isLoading: false });
        return { success: false, error: error.message };
      }

      console.log('[AuthStore] Facebook OAuth initiated, waiting for callback');
      setTimeout(() => {
        const currentState = get();
        if (currentState.isLoading) {
          console.warn('[AuthStore] Facebook OAuth timeout after 60 seconds, resetting loading state');
          set({ isLoading: false });
        }
      }, 60000);

      return { success: true };
    } catch (error: any) {
      console.error('[AuthStore] Facebook OAuth exception:', error);
      set({ isLoading: false });
      return { success: false, error: error.message || 'Facebook sign-in failed' };
    }
  },

  signInWithApple: async () => {
    set({ isLoading: true });

    try {
      console.log('[AuthStore] Initiating Apple OAuth sign-in');
      const { data, error } = await AuthService.signInWithApple();

      if (error) {
        console.error('[AuthStore] Apple OAuth error:', error);
        set({ isLoading: false });
        return { success: false, error: error.message };
      }

      console.log('[AuthStore] Apple OAuth initiated, waiting for callback');
      setTimeout(() => {
        const currentState = get();
        if (currentState.isLoading) {
          console.warn('[AuthStore] Apple OAuth timeout after 60 seconds, resetting loading state');
          set({ isLoading: false });
        }
      }, 60000);

      return { success: true };
    } catch (error: any) {
      console.error('[AuthStore] Apple OAuth exception:', error);
      set({ isLoading: false });
      return { success: false, error: error.message || 'Apple sign-in failed' };
    }
  },

  signOut: async () => {
    console.log('[AuthStore] Starting sign out process');
    set({ isLoading: true });

    try {
      console.log('[AuthStore] Calling AuthService.signOut()');
      const { error } = await AuthService.signOut();
      if (error) {
        console.error('[AuthStore] AuthService.signOut() returned error:', error);
        // Continue with logout even if server sign out fails
      } else {
        console.log('[AuthStore] AuthService.signOut() completed successfully');
      }

      console.log('[AuthStore] Logging out from RevenueCat');
      try {
        await revenueCatService.logout();
        console.log('[AuthStore] RevenueCat logout completed');
      } catch (revenueCatError) {
        console.warn('[AuthStore] RevenueCat logout failed:', revenueCatError);
      }

      // Manually clear AsyncStorage to ensure session is removed
      if (AsyncStorage) {
        try {
          await AsyncStorage.removeItem('supabase.auth.token');
          console.log('[AuthStore] Cleared auth token from AsyncStorage');
        } catch (storageError) {
          console.warn('[AuthStore] Failed to clear AsyncStorage:', storageError);
        }
      }

      console.log('[AuthStore] Clearing local auth state');
      set({
        user: null,
        session: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false
      });
      console.log('[AuthStore] Local auth state cleared');

      // Force clear auth provider state as well
      if (typeof window !== 'undefined') {
        // This ensures any cached auth state is cleared
        console.log('[AuthStore] Forcing auth provider state clear');
      }
    } catch (error) {
      console.error('[AuthStore] Sign out error:', error);
      // Always clear local state even if sign out fails
      console.log('[AuthStore] Clearing local auth state despite error');
      set({
        user: null,
        session: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  },

  loadUser: async () => {
    set({ isLoading: true });

    try {
      // First check for a valid session from Supabase (not cached)
      const session = await AuthService.getCurrentSession();

      if (session?.user) {
        // Session is valid, load user data
        const user = session.user;
        const { data: profile } = await AuthService.getUserProfile(user.id);

        set({
          user,
          session,
          profile,
          isAuthenticated: true,
          isLoading: false
        });
      } else {
        // No valid session, clear any cached data
        set({
          user: null,
          session: null,
          profile: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Load user error:', error);
      // On error, clear cached data and set unauthenticated
      set({
        user: null,
        session: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  },

  updateProfile: async (updates: any) => {
    const { user, profile } = get();
    if (!user || !profile) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      const { error } = await AuthService.updateUserProfile(user.id, updates);

      if (error) {
        console.error('[AuthStore] Failed to update profile in database:', error);
        return { success: false, error: error.message };
      }

      // Reload profile from database to ensure consistency
      console.log('[AuthStore] Reloading profile from database after update');
      const { data: updatedProfile, error: fetchError } = await AuthService.getUserProfile(user.id);

      if (fetchError) {
        console.warn('[AuthStore] Failed to reload profile, using local update:', fetchError);
        // Fall back to local update
        set({ profile: { ...profile, ...updates } });
      } else {
        console.log('[AuthStore] Profile reloaded successfully from database');
        set({ profile: updatedProfile });
      }

      return { success: true };
    } catch (error: any) {
      console.error('[AuthStore] Profile update exception:', error);
      return { success: false, error: error.message || 'Update failed' };
    }
  },

  // Setters for external auth state updates
  setUser: (user: User | null) => set({ user }),
  setSession: (session: Session | null) => set({ session, isAuthenticated: !!session }),
  setProfile: (profile: UserProfile | null) => set({ profile }),
  setLoading: (isLoading: boolean) => set({ isLoading })
});

export const useAuthStore = create<AuthStore>()(storeConfig);