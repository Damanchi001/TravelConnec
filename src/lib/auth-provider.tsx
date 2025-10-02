import { streamAuthService } from '@/src/services/stream';
import { AuthService } from '@/src/services/supabase/auth';
import { useAuthStore } from '@/src/stores/auth-store';
import React, { createContext, ReactNode, useContext, useEffect } from 'react';

interface AuthContextType {
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isInitialized, setIsInitialized] = React.useState(false);
  const { loadUser, setUser, setSession } = useAuthStore();

  useEffect(() => {
    // Load initial auth state
    const initializeAuth = async () => {
      try {
        await loadUser();
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();

    // Listen to auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthProvider] Auth state changed:', event, 'session exists:', !!session);

        // Reset loading state when auth state changes
        useAuthStore.getState().setLoading(false);

        if (session?.user) {
          console.log('[AuthProvider] User signed in, setting user and session');
          setUser(session.user);
          setSession(session);

          // Load or create user profile
          if (session.user.id) {
            console.log('[AuthProvider] Loading user profile for:', session.user.id);
            let { data: profile, error: profileError } = await AuthService.getUserProfile(session.user.id);

            if (profileError) {
              console.error('[AuthProvider] Error loading user profile:', profileError);
            }

            if (!profile) {
              console.log('[AuthProvider] No profile found, creating one for user');
              // Create profile for new users (including social auth)
              const createResult = await AuthService.createUserProfile(session.user);
              if (!createResult.success) {
                console.error('[AuthProvider] Failed to create user profile:', createResult.error);
                // Continue anyway - profile can be created later in the app
              } else {
                // Try loading the newly created profile
                const profileResult = await AuthService.getUserProfile(session.user.id);
                profile = profileResult.data;
                profileError = profileResult.error;
              }
            }

            if (profile && !profileError) {
              console.log('[AuthProvider] Profile loaded successfully');
              useAuthStore.getState().setProfile(profile);

              // Connect to Stream services
              console.log('[AuthProvider] About to connect to Stream services for user:', session.user.id);
              try {
                // Ensure user ID is valid before connecting
                if (!session.user.id) {
                  console.warn('[AuthProvider] User ID is missing, skipping Stream connection');
                  return;
                }

                // Disconnect any existing connection first
                if (streamAuthService.isConnected()) {
                  console.log('[AuthProvider] Disconnecting existing Stream connection before reconnecting');
                  await streamAuthService.disconnectUser();
                }

                const streamResult = await streamAuthService.connectUser(session.user.id);
                if (streamResult.success) {
                  console.log('[AuthProvider] Stream services connected successfully');
                } else {
                  console.warn('[AuthProvider] Stream services connection failed, but continuing:', streamResult.error);
                }
              } catch (streamError) {
                console.error('[AuthProvider] Failed to connect to Stream services:', streamError);
                // Don't fail the entire auth process if Stream fails
              }
            } else {
              console.warn('[AuthProvider] Profile not available, user may need to complete setup');
              // Still allow the user to proceed - they can complete their profile later
            }
          }
        } else if (event === 'SIGNED_OUT' || !session) {
          console.log('[AuthProvider] User signed out or no session, clearing user and session');
          setUser(null);
          setSession(null);
          useAuthStore.getState().setProfile(null);

          // Disconnect from Stream services
          try {
            await streamAuthService.disconnectUser();
          } catch (error) {
            console.warn('[AuthProvider] Error disconnecting from Stream services:', error);
          }
        } else {
          console.log('[AuthProvider] Auth event:', event, 'no action needed');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUser, setUser, setSession]);

  return (
    <AuthContext.Provider value={{ isInitialized }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Return default value instead of throwing to prevent render errors
    return { isInitialized: false };
  }
  return context;
}