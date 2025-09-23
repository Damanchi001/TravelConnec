import { AuthService, UserProfile } from '@/src/services/supabase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

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
  signOut: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
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

      signUp: async ({ email, password, firstName, lastName }) => {
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

      signOut: async () => {
        set({ isLoading: true });
        
        try {
          await AuthService.signOut();
          set({
            user: null,
            session: null,
            profile: null,
            isAuthenticated: false,
            isLoading: false
          });
        } catch (error) {
          console.error('Sign out error:', error);
          // Still clear local state even if sign out fails
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

      updateProfile: async (updates) => {
        const { user, profile } = get();
        if (!user || !profile) {
          return { success: false, error: 'No user logged in' };
        }

        try {
          const { error } = await AuthService.updateUserProfile(user.id, updates);
          
          if (error) {
            return { success: false, error: error.message };
          }

          // Update local profile
          set({ profile: { ...profile, ...updates } });
          return { success: true };
        } catch (error: any) {
          return { success: false, error: error.message || 'Update failed' };
        }
      },

      // Setters for external auth state updates
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session, isAuthenticated: !!session }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading })
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Don't persist authentication state - let Supabase handle session validation
      partialize: (state) => ({
        // Only persist minimal data, authentication will be verified on load
      })
    }
  )
);