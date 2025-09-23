import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';

export interface AuthLoadingScreenProps {
  message?: string;
}

/**
 * Loading screen shown while checking authentication state
 */
export function AuthLoadingScreen({ message = 'Loading...' }: AuthLoadingScreenProps) {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      
      {/* Loading Indicator */}
      <ActivityIndicator 
        size="large" 
        color="#FFFFFF" 
        style={styles.loader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
  },
  loader: {
    marginTop: 20,
  },
});