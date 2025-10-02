// Import polyfill first to handle import.meta issues
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import Constants from 'expo-constants';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';

import { AuthErrorBoundary } from '@/src/components/auth';
import { AuthProvider, useAuth } from '@/src/lib/auth-provider';
import { queryClient } from '@/src/lib/react-query';
import { ThemeProvider as CustomThemeProvider } from '@/src/lib/theme-provider';
import { NotificationService } from '@/src/services/notifications';
import { callSignalingService } from '@/src/services/stream/call-signaling';
import { useAuthStore } from '@/src/stores/auth-store';
import { getAuthRedirectPath } from '@/src/utils/navigationUtils';
import * as Notifications from 'expo-notifications';

// Conditionally import Stripe only when not in Expo Go
let initializeStripe: (() => Promise<void>) | null = null;
try {
  // Only import Stripe if we're not in Expo Go (which would cause web compatibility issues)
  if (!Constants.expoConfig?.hostUri?.includes('exp://')) {
    const stripeModule = require('@/src/services/stripe/client');
    initializeStripe = stripeModule.default;
  }
} catch (error) {
  console.warn('Stripe not available, skipping initialization');
}

export const unstable_settings = {
  initialRouteName: 'splash',
};

function RootNavigator() {
  const router = useRouter();
  const segments = useSegments();
  const { isInitialized } = useAuth();
  const { isAuthenticated, isLoading, user, profile } = useAuthStore();

  // Listen for incoming calls
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const unsubscribe = callSignalingService.onIncomingCall((callData) => {
      // Navigate to incoming call screen
      router.push(`/incoming-call?callId=${callData.callId}` as any);
    });

    return unsubscribe;
  }, [isAuthenticated, user?.id, router]);

  useEffect(() => {
    // Defer navigation logic to ensure navigator is ready
    const timeoutId = setTimeout(() => {
      // Don't redirect if auth is not initialized or still loading
      if (!isInitialized || isLoading) {
        return;
      }

      // Get current route
      const currentPath = `/${segments.join('/')}`;

      // For unregistered users starting at onboarding, redirect to splash
      if (!isAuthenticated && currentPath === '/onboarding/1') {
        router.replace('/splash' as any);
        return;
      }

      // Determine where user should be based on auth state
      const redirectPath = getAuthRedirectPath(isAuthenticated, user, profile);

      // Protected routes that require authentication
      const protectedRoutes = ['/(tabs)', '/(subscription)'];

      // Guest-only routes (should redirect if authenticated)
      const guestOnlyRoutes = ['/auth'];


      // If user is authenticated and on guest-only route, redirect
      if (isAuthenticated && guestOnlyRoutes.some(route => currentPath.startsWith(route))) {
        router.replace(redirectPath as any);
        return;
      }

      // If user is not authenticated and on protected route, redirect to onboarding
      if (!isAuthenticated && protectedRoutes.some(route => currentPath.startsWith(route))) {
        router.replace('/onboarding/1');
        return;
      }

      // Handle specific auth flow redirections
      if (isAuthenticated && user) {
        // User is authenticated but no profile - redirect to onboarding
        if (!profile && !currentPath.startsWith('/onboarding')) {
          router.replace('/onboarding/1');
          return;
        }

        // User has profile and is on onboarding - redirect to appropriate next step
        if (profile && currentPath.startsWith('/onboarding')) {
          // Check if user is new and should see subscription
          const userCreatedAt = new Date(user.created_at);
          const now = new Date();
          const daysSinceCreation = (now.getTime() - userCreatedAt.getTime()) / (1000 * 60 * 60 * 24);

          if (daysSinceCreation < 1) {
            router.replace('/(subscription)/plans' as any);
          } else {
            router.replace('/(tabs)');
          }
          return;
        }
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isInitialized, isLoading, isAuthenticated, user, profile, segments, router]);

  return (
    <Stack>
      <Stack.Screen name="splash" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="profile-setup" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(host)" options={{ headerShown: false }} />
      <Stack.Screen name="(subscription)" options={{ headerShown: false }} />
      <Stack.Screen name="call-logs" />
      <Stack.Screen name="incoming-call" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
      <Stack.Screen name="(modals)" options={{ presentation: 'modal' }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    // Initialize Stripe on app startup (only if available)
    if (initializeStripe) {
      initializeStripe().catch(console.error);
    }

    // Set up push notification listeners
    const notificationReceivedListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('[RootLayout] Notification received:', notification);
      // Handle Stream push notifications
      NotificationService.handleStreamPushNotification(notification);
    });

    const notificationResponseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('[RootLayout] Notification response received:', response);
      // Handle notification taps if needed
    });

    return () => {
      notificationReceivedListener?.remove();
      notificationResponseListener?.remove();
    };
  }, []);

  return (
    <AuthErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CustomThemeProvider>
            <ThemeProvider value={DefaultTheme}>
              <RootNavigator />
              <StatusBar style="auto" />
            </ThemeProvider>
          </CustomThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </AuthErrorBoundary>
  );
}