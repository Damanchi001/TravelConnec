import { Stack } from 'expo-router';
import React from 'react';

export default function SubscriptionLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="plans"
        options={{
          title: 'Choose Your Plan',
          headerShown: true
        }}
      />
      <Stack.Screen
        name="manage"
        options={{
          title: 'Manage Subscription',
          headerShown: true
        }}
      />
      <Stack.Screen
        name="success"
        options={{
          title: 'Welcome!',
          headerShown: false,
          presentation: 'modal'
        }}
      />
      <Stack.Screen
        name="restore"
        options={{
          title: 'Restore Purchase',
          headerShown: true
        }}
      />
    </Stack>
  );
}