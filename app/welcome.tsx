import { GuestOnlyRoute } from '@/src/components/auth';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/onboarding/1');
  };

  return (
    <GuestOnlyRoute>
      <View style={styles.container}>
        <StatusBar style="dark" />
        
        {/* Logo Icon */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logoIcon}
            contentFit="contain"
          />
        </View>

        {/* Logo Text */}
        <View style={styles.logoTextContainer}>
          <Image
            source={require('@/assets/images/Logo-text.png')}
            style={styles.logoText}
            contentFit="contain"
          />
        </View>

        {/* Tagline */}
        <View style={styles.taglineContainer}>
          <Image
            source={require('@/assets/images/Tagline.png')}
            style={styles.taglineIcon}
            contentFit="contain"
          />
        </View>

        {/* Get Started Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleGetStarted} activeOpacity={0.8}>
            <Image
              source={require('@/assets/images/Get-started-button.png')}
              style={styles.getStartedButton}
              contentFit="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
    </GuestOnlyRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoIcon: {
    width: 120,
    height: 120,
  },
  logoTextContainer: {
    marginBottom: 40,
  },
  logoText: {
    width: 250,
    height: 60,
  },
  taglineContainer: {
    marginBottom: 60,
  },
  taglineIcon: {
    width: 200,
    height: 40,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 100,
    width: width - 80,
  },
  getStartedButton: {
    width: '100%',
    height: 56,
  },
});