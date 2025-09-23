import { AuthLoadingScreen } from '@/src/components/auth';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const [showSplash, setShowSplash] = React.useState(true);

  useEffect(() => {
    // Always show splash for 1 second
    const timer = setTimeout(() => {
      setShowSplash(false);
      router.replace('/welcome' as any);
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  if (showSplash) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <Image
          source={require('@/assets/images/Splash-screen.png')}
          style={styles.backgroundImage}
          contentFit="cover"
        />
      </View>
    );
  }

  // Show loading state while navigating
  return <AuthLoadingScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2196F3',
  },
  backgroundImage: {
    position: 'absolute',
    width: width,
    height: height,
  },
});