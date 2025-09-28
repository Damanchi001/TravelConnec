import { AuthError } from '@supabase/supabase-js';
import { Alert } from 'react-native';

/**
 * Maps Supabase auth error codes/messages to user-friendly messages
 */
export function mapAuthError(error: AuthError | string): string {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorCode = typeof error === 'object' ? error.message : error;

  // Check for specific error codes/messages
  if (errorMessage.includes('Invalid login credentials') || errorCode === 'invalid_credentials') {
    return 'The email or password you entered is incorrect. Please try again.';
  }

  if (errorMessage.includes('User not found') || errorCode === 'user_not_found') {
    return 'No account found with this email. Please sign up or check your email.';
  }

  if (errorMessage.includes('Email not confirmed') || errorCode === 'email_not_confirmed') {
    return 'Please check your email and confirm your account before logging in.';
  }

  if (errorMessage.includes('Password is too short') || errorCode === 'weak_password') {
    return 'Password must be at least 6 characters long.';
  }

  if (errorMessage.includes('Too many requests') || errorCode === 'too_many_requests') {
    return 'Too many login attempts. Please wait a few minutes before trying again.';
  }

  if (errorMessage.includes('Signup disabled') || errorCode === 'signup_disabled') {
    return 'New registrations are currently disabled. Please try again later.';
  }

  if (errorMessage.includes('Email already registered') || errorMessage.includes('already registered')) {
    return 'An account with this email already exists. Please sign in instead.';
  }

  if (errorMessage.includes('Invalid email') || errorCode === 'invalid_email') {
    return 'Please enter a valid email address.';
  }

  if (errorMessage.includes('Password should be at least') || errorMessage.includes('weak password')) {
    return 'Password must include at least one uppercase letter, one number, and one special character.';
  }

  // Network-related errors
  if (errorMessage.includes('Network request failed') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('network') ||
      errorMessage.includes('connection')) {
    return 'Network error. Please check your connection and try again.';
  }

  // Generic fallback
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Shows an alert for critical auth errors
 */
export function showAuthErrorAlert(error: AuthError | string, title: string = 'Authentication Error') {
  const message = mapAuthError(error);
  Alert.alert(title, message);
}

/**
 * Logs auth errors in development mode
 */
export function logAuthError(error: AuthError | string, context: string) {
  // Logging removed for better UX - errors are now displayed in UI
}

/**
 * Checks if an error should be shown as an alert (critical errors)
 */
export function shouldShowAlert(error: AuthError | string): boolean {
  const message = typeof error === 'string' ? error : error.message;

  // Show alerts for critical errors that need immediate attention
  return message.includes('Too many requests') ||
         message.includes('Email not confirmed') ||
         message.includes('Network request failed') ||
         message.includes('connection');
}