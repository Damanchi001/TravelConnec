// Import polyfill first to handle import.meta issues
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthErrorBoundary } from '@/src/components/auth';
import { AuthProvider, useAuth } from '@/src/lib/auth-provider';
import { queryClient } from '@/src/lib/react-query';
import { useAuthStore } from '@/src/stores/auth-store';
import { getAuthRedirectPath } from '@/src/utils/navigationUtils';

export const unstable_settings = {
  anchor: 'splash',
};

function RootNavigator() {
  const router = useRouter();
  const segments = useSegments();
  const { isInitialized } = useAuth();
  const { isAuthenticated, isLoading, user, profile } = useAuthStore();

  useEffect(() => {
    // Defer navigation logic to ensure navigator is ready
    const timeoutId = setTimeout(() => {
      // Don't redirect if auth is not initialized or still loading
      if (!isInitialized || isLoading) {
        return;
      }

      // Get current route
      const currentPath = `/${segments.join('/')}`;

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
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(subscription)" options={{ headerShown: false }} />
      <Stack.Screen name="(modals)" options={{ presentation: 'modal' }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <RootNavigator />
            <StatusBar style="auto" />
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </AuthErrorBoundary>
  );
}