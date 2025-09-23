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
        console.log('Auth state changed:', event, session);
        
        if (session) {
          setUser(session.user);
          setSession(session);
          
          // Load user profile
          if (session.user.id) {
            const { data: profile } = await AuthService.getUserProfile(session.user.id);
            if (profile) {
              useAuthStore.getState().setProfile(profile);
            }
          }
        } else {
          setUser(null);
          setSession(null);
          useAuthStore.getState().setProfile(null);
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}