import { useAuthStore } from '@/src/stores/auth-store';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { loadUser } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('[AuthCallback] Handling OAuth callback with params:', params);

        // Reload user to pick up the new session
        await loadUser();

        // Navigate to the main app
        router.replace('/(tabs)' as any);
      } catch (error) {
        console.error('[AuthCallback] Error handling callback:', error);
        // On error, redirect to auth screen
        router.replace('/auth' as any);
      }
    };

    handleCallback();
  }, [params, loadUser, router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 16 }}>Completing authentication...</Text>
    </View>
  );
}