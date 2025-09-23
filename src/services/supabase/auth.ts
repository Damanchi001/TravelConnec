import type { AuthError, Session, User } from '@supabase/supabase-js';
import { supabase } from './client';

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  user_type: 'traveler' | 'host' | 'both';
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export class AuthService {
  /**
   * Sign up a new user with email and password
   */
  static async signUp({ email, password, firstName, lastName }: SignUpData) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      // If user is created, also create a profile
      if (data.user && !error) {
        await this.createUserProfile(data.user, firstName, lastName);
      }

      return { data, error };
    } catch (error) {
      return { data: { user: null, session: null }, error: error as AuthError };
    }
  }

  /**
   * Sign in with email and password
   */
  static async signIn({ email, password }: SignInData) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { data, error };
    } catch (error) {
      return { data: { user: null, session: null }, error: error as AuthError };
    }
  }

  /**
   * Sign out the current user
   */
  static async signOut(): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  /**
   * Get current user
   */
  static async getCurrentUser(): Promise<User | null> {
    const { data } = await supabase.auth.getUser();
    return data.user;
  }

  /**
   * Get current session
   */
  static async getCurrentSession(): Promise<Session | null> {
    const { data } = await supabase.auth.getSession();
    return data.session;
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  /**
   * Create user profile after sign up
   */
  private static async createUserProfile(user: User, firstName: string, lastName: string) {
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        first_name: firstName,
        last_name: lastName,
        user_type: 'traveler', // Default to traveler, can be changed later
        is_verified: false,
      });

    if (error) {
      console.error('Error creating user profile:', error);
    }
  }

  /**
   * Get user profile by ID
   */
  static async getUserProfile(userId: string): Promise<{ data: UserProfile | null; error: any }> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    return { data, error };
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<{ error: any }> {
    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId);

    return { error };
  }
}

export default AuthService;