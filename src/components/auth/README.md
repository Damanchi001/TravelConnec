# Authentication System Documentation

This directory contains all the authentication-related components and utilities for the travel app. The system provides comprehensive route protection, authentication state management, and user flow handling.

## Components

### 1. ProtectedRoute
Wrapper component that protects routes requiring authentication.

```tsx
import { ProtectedRoute } from '@/src/components/auth';

// Protect a route that requires authentication
<ProtectedRoute>
  <YourProtectedComponent />
</ProtectedRoute>

// Protect a route that requires both authentication and profile completion
<ProtectedRoute requireProfile={true}>
  <YourProtectedComponent />
</ProtectedRoute>
```

**Props:**
- `requireProfile?: boolean` - Whether the user must have completed their profile
- `loadingComponent?: ReactNode` - Custom loading component
- `fallback?: ReactNode` - Custom fallback component

### 2. GuestOnlyRoute
Wrapper component for routes that should only be accessible to unauthenticated users.

```tsx
import { GuestOnlyRoute } from '@/src/components/auth';

<GuestOnlyRoute>
  <WelcomeScreen />
</GuestOnlyRoute>
```

**Props:**
- `loadingComponent?: ReactNode` - Custom loading component
- `fallback?: ReactNode` - Custom fallback component

### 3. AuthLoadingScreen
Loading screen component shown during authentication checks.

```tsx
import { AuthLoadingScreen } from '@/src/components/auth';

<AuthLoadingScreen message="Loading..." />
```

### 4. AuthErrorBoundary
Error boundary that catches authentication-related errors.

```tsx
import { AuthErrorBoundary } from '@/src/components/auth';

<AuthErrorBoundary>
  <YourApp />
</AuthErrorBoundary>
```

## Hooks

### 1. useAuthGuard
Hook for protecting routes that require authentication.

```tsx
import { useAuthGuard } from '@/src/hooks';

function ProtectedComponent() {
  const { isAuthenticated, hasProfile, isLoading } = useAuthGuard({
    requireProfile: true
  });

  if (isLoading) return <LoadingSpinner />;
  
  return <YourComponent />;
}
```

### 2. useGuestGuard
Hook for protecting routes that should only be accessible to guests.

```tsx
import { useGuestGuard } from '@/src/hooks';

function GuestOnlyComponent() {
  const { isGuest, canAccess } = useGuestGuard();
  
  return <YourComponent />;
}
```

### 3. useRequireAuth
Hook that throws or redirects if user is not authenticated.

```tsx
import { useRequireAuth } from '@/src/hooks';

function StrictComponent() {
  const { user, profile } = useRequireAuth({ requireProfile: true });
  
  // This component will only render if user is authenticated with profile
  return <YourComponent user={user} profile={profile} />;
}
```

## Navigation Utilities

### getAuthRedirectPath
Determines where a user should be redirected based on their auth state.

```tsx
import { getAuthRedirectPath } from '@/src/utils/navigationUtils';

const redirectPath = getAuthRedirectPath(isAuthenticated, user, profile);
router.replace(redirectPath);
```

### Navigation Flow States

The authentication system handles these user states:

1. **Unauthenticated users** → `/welcome`
2. **Authenticated users without profile** → `/onboarding/1`
3. **New authenticated users with profile** → `/(subscription)/plans`
4. **Returning authenticated users** → `/(tabs)`

## Integration Example

```tsx
// app/(tabs)/_layout.tsx
import { ProtectedRoute } from '@/src/components/auth';

export default function TabLayout() {
  return (
    <ProtectedRoute requireProfile={true}>
      <Tabs>
        {/* Your tabs */}
      </Tabs>
    </ProtectedRoute>
  );
}
```

```tsx
// app/welcome.tsx
import { GuestOnlyRoute } from '@/src/components/auth';

export default function WelcomeScreen() {
  return (
    <GuestOnlyRoute>
      <View>
        {/* Welcome content */}
      </View>
    </GuestOnlyRoute>
  );
}
```

## Best Practices

1. **Use ProtectedRoute** for any screen that requires authentication
2. **Use GuestOnlyRoute** for welcome, auth, and other guest-only screens
3. **Set requireProfile={true}** for screens that need complete user profiles
4. **Wrap your app with AuthErrorBoundary** for better error handling
5. **Use navigation utilities** for consistent redirect logic

## Error Handling

The system includes comprehensive error handling:

- **AuthErrorBoundary** catches and displays authentication errors
- **Graceful fallbacks** for network failures
- **Automatic retry mechanisms** for transient errors
- **Debug information** in development mode

## Loading States

The system provides multiple loading states:

- **Splash screen** while initializing auth
- **AuthLoadingScreen** during auth checks
- **Custom loading components** for specific use cases
- **Skeleton screens** for better UX

## Security Features

- **Route protection** prevents unauthorized access
- **Session validation** on app resume
- **Automatic logout** on session expiry
- **Secure token storage** via Zustand persistence

## Debugging

In development mode, you can monitor auth state changes:

```tsx
// Enable auth debugging
console.log('Auth state:', useAuthStore.getState());
```

The system logs navigation decisions and auth state changes to help with debugging.