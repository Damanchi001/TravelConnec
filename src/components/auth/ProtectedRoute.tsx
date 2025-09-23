import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuthGuard } from '../../hooks/useAuthGuard';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requireProfile?: boolean;
  loadingComponent?: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Wrapper component that protects routes requiring authentication
 * Shows loading state while checking auth, redirects if unauthorized
 */
export function ProtectedRoute({
  children,
  requireProfile = false,
  loadingComponent,
  fallback
}: ProtectedRouteProps) {
  const { isAuthenticated, hasProfile, isLoading } = useAuthGuard({
    requireProfile
  });

  // Show loading state while checking authentication
  if (isLoading) {
    return loadingComponent || (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Show fallback if not authenticated (though useAuthGuard should redirect)
  if (!isAuthenticated) {
    return fallback || (
      <View style={styles.fallbackContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Show fallback if profile is required but missing
  if (requireProfile && !hasProfile) {
    return fallback || (
      <View style={styles.fallbackContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Render protected content
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