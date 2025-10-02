import type { AuthError, Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
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
  username?: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  avatar_url?: string;
  bio?: string;
  user_type: 'traveler' | 'host' | 'both';
  status?: string;
  verification_status?: string;
  languages?: string[];
  location?: any;
  preferences?: any;
  social_links?: any;
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
     console.log('[AuthService] Calling supabase.auth.signOut()');
     const { error } = await supabase.auth.signOut();
     if (error) {
       console.error('[AuthService] supabase.auth.signOut() error:', error);
     } else {
       console.log('[AuthService] supabase.auth.signOut() completed successfully');
     }
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
   * Create user profile after sign up or social auth
   */
  static async createUserProfile(user: User, firstName?: string, lastName?: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('[AuthService] Creating user profile for:', user.id, user.email);

      // For social auth, try to extract names from user metadata
      const metadata = user.user_metadata || {};
      console.log('[AuthService] User metadata:', metadata);

      let profileFirstName = firstName || '';
      let profileLastName = lastName || '';

      // Try different metadata fields for names
      if (!profileFirstName) {
        profileFirstName = metadata.first_name || metadata.given_name || metadata.name?.split(' ')[0] || '';
      }

      if (!profileLastName) {
        profileLastName = metadata.last_name || metadata.family_name || '';
        // If we have a full name but no last name, try to extract it
        if (!profileLastName && metadata.name && metadata.name.split(' ').length > 1) {
          const nameParts = metadata.name.split(' ');
          profileLastName = nameParts.slice(1).join(' ');
        }
      }

      // Ensure we have valid strings
      profileFirstName = profileFirstName.trim();
      profileLastName = profileLastName.trim();

      console.log('[AuthService] Extracted names:', { firstName: profileFirstName, lastName: profileLastName });

      console.log('[AuthService] Attempting to insert into user_profiles table');
      const { error } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          email: user.email,
          first_name: profileFirstName,
          last_name: profileLastName,
          user_type: 'traveler', // Default to traveler, can be changed later
          is_verified: false,
        });

      if (error) {
        console.error('[AuthService] Error creating user profile:', error);
        console.error('[AuthService] Error code:', error.code);
        console.error('[AuthService] Error message:', error.message);
        console.error('[AuthService] Error details:', error.details);
        return { success: false, error: error.message };
      }

      console.log('[AuthService] User profile created successfully');
      return { success: true };
    } catch (error: any) {
      console.error('[AuthService] Exception creating user profile:', error);
      return { success: false, error: error.message || 'Failed to create user profile' };
    }
  }

  /**
   * Get user profile by ID
   */
  static async getUserProfile(userId: string): Promise<{ data: UserProfile | null; error: any }> {
    const { data, error } = await supabase
      .from('user_profiles')
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
      .from('user_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId);

    return { error };
  }

  /**
   * Sign in with Google OAuth
   */
  static async signInWithGoogle(): Promise<{ data: any; error: AuthError | null }> {
    try {
      console.log('[AuthService] Starting Google OAuth sign-in');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'mynewtravelproject://',
          skipBrowserRedirect: true, // CHANGED: Skip browser redirect so we can handle it
        },
      });

      if (error) {
        console.error('[AuthService] Google OAuth error:', error);
        return { data: null, error };
      }

      // ADDED: Manually open the OAuth URL in the browser
      if (data?.url) {
        console.log('[AuthService] Opening OAuth URL:', data.url);
        await Linking.openURL(data.url);
      }

      console.log('[AuthService] Google OAuth initiated successfully');
      return { data, error: null };
    } catch (error) {
      console.error('[AuthService] Google OAuth exception:', error);
      return { data: null, error: error as AuthError };
    }
  }

  /**
   * Sign in with Facebook OAuth
   */
  static async signInWithFacebook(): Promise<{ data: any; error: AuthError | null }> {
    try {
      console.log('[AuthService] Starting Facebook OAuth sign-in');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: 'mynewtravelproject://',
          skipBrowserRedirect: true, // CHANGED: Skip browser redirect so we can handle it
        },
      });

      if (error) {
        console.error('[AuthService] Facebook OAuth error:', error);
        return { data: null, error };
      }

      // ADDED: Manually open the OAuth URL in the browser
      if (data?.url) {
        console.log('[AuthService] Opening OAuth URL:', data.url);
        await Linking.openURL(data.url);
      }

      console.log('[AuthService] Facebook OAuth initiated successfully');
      return { data, error: null };
    } catch (error) {
      console.error('[AuthService] Facebook OAuth exception:', error);
      return { data: null, error: error as AuthError };
    }
  }

  /**
   * Sign in with Apple OAuth
   */
  static async signInWithApple(): Promise<{ data: any; error: AuthError | null }> {
    try {
      console.log('[AuthService] Starting Apple OAuth sign-in');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
         redirectTo: 'mynewtravelproject://',
          skipBrowserRedirect: true, // CHANGED: Skip browser redirect so we can handle it
        },
      });

      if (error) {
        console.error('[AuthService] Apple OAuth error:', error);
        return { data: null, error };
      }

      // ADDED: Manually open the OAuth URL in the browser
      if (data?.url) {
        console.log('[AuthService] Opening OAuth URL:', data.url);
        await Linking.openURL(data.url);
      }

      console.log('[AuthService] Apple OAuth initiated successfully');
      return { data, error: null };
    } catch (error) {
      console.error('[AuthService] Apple OAuth exception:', error);
      return { data: null, error: error as AuthError };
    }
  }

  /**
   * Sign in with LinkedIn OAuth
   */
  static async signInWithLinkedIn(): Promise<{ data: any; error: AuthError | null }> {
    try {
      console.log('[AuthService] Starting LinkedIn OAuth sign-in');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: 'mynewtravelproject://',
          skipBrowserRedirect: true, // CHANGED: Skip browser redirect so we can handle it
        },
      });

      if (error) {
        console.error('[AuthService] LinkedIn OAuth error:', error);
        return { data: null, error };
      }

      // ADDED: Manually open the OAuth URL in the browser
      if (data?.url) {
        console.log('[AuthService] Opening OAuth URL:', data.url);
        await Linking.openURL(data.url);
      }

      console.log('[AuthService] LinkedIn OAuth initiated successfully');
      return { data, error: null };
    } catch (error) {
      console.error('[AuthService] LinkedIn OAuth exception:', error);
      return { data: null, error: error as AuthError };
    }
  }
}

export default AuthService;