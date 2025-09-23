import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useGuestGuard } from '../../hooks/useGuestGuard';

export interface GuestOnlyRouteProps {
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Wrapper component that protects routes that should only be accessible to guests
 * Redirects authenticated users to the appropriate screen
 */
export function GuestOnlyRoute({ 
  children, 
  loadingComponent,
  fallback 
}: GuestOnlyRouteProps) {
  const { isLoading, canAccess } = useGuestGuard();

  // Show loading state while checking authentication
  if (isLoading) {
    return loadingComponent || (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Show fallback if not a guest (though useGuestGuard should redirect)
  if (!canAccess) {
    return fallback || (
      <View style={styles.fallbackContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Render guest content
  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5'
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5'
  }
});