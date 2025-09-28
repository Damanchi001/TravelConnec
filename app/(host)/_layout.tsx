import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '../../src/stores/auth-store';

export default function HostLayout() {
  const { user, profile } = useAuthStore();

  // Redirect if not authenticated or not a host
  if (!user || (profile?.role !== 'host' && profile?.role !== 'both')) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="listings/index"
        options={{ title: 'My Listings' }}
      />
      <Stack.Screen
        name="listings/create"
        options={{ title: 'Create Listing', presentation: 'modal' }}
      />
      <Stack.Screen
        name="listings/[id]/edit"
        options={{ title: 'Edit Listing' }}
      />
      <Stack.Screen
        name="listings/[id]/analytics"
        options={{ title: 'Listing Analytics' }}
      />
      <Stack.Screen
        name="bookings/manage"
        options={{ title: 'Manage Bookings' }}
      />
      <Stack.Screen
        name="earnings"
        options={{ title: 'Earnings' }}
      />
      <Stack.Screen
        name="calendar-management"
        options={{ title: 'Calendar Management' }}
      />
    </Stack>
  );
}