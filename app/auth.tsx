import { GuestOnlyRoute } from '@/src/components/auth';
import { LoginForm, SignupForm } from '@/src/components/forms';
import { useAuthStore } from '@/src/stores/auth-store';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');

type AuthMode = 'social' | 'login' | 'signup';

export default function AuthScreen() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<AuthMode>('social');
  const { isAuthenticated, loadUser } = useAuthStore();

  useEffect(() => {
    // Check for existing session on mount
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    // Navigate to main app if user is authenticated
    if (isAuthenticated) {
      router.replace('/(tabs)' as any);
    }
  }, [isAuthenticated, router]);

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
    // TODO: Implement OAuth login logic
    // For now, do nothing
  };

  const handleEmailLogin = () => {
    setAuthMode('login');
  };

  const handleAuthSuccess = () => {
    // After successful login, navigate to main app
    router.replace('/(tabs)' as any);
  };

  const handleSignupSuccess = () => {
    // After successful signup, navigate to main app
    router.replace('/(tabs)' as any);
  };

  const handleSwitchToSignup = () => {
    setAuthMode('signup');
  };

  const handleSwitchToLogin = () => {
    setAuthMode('login');
  };

  const handleBackToSocial = () => {
    setAuthMode('social');
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password flow
    console.log('Forgot password');
  };

  const renderSocialLogin = () => (
    <>
      {/* Logo Section */}
      <View style={styles.logoSection}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
        <Image
          source={require('@/assets/images/Logo-text.png')}
          style={styles.logoText}
          contentFit="contain"
        />
      </View>

      {/* Login Buttons Section */}
      <View style={styles.loginSection}>
        
        {/* Facebook Login */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => handleSocialLogin('Facebook')}
          activeOpacity={0.8}
        >
          <Image
            source={require('@/assets/images/continue-with-facebook-btn.png')}
            style={styles.buttonImage}
            contentFit="contain"
          />
        </TouchableOpacity>

        {/* Apple Login */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => handleSocialLogin('Apple')}
          activeOpacity={0.8}
        >
          <Image
            source={require('@/assets/images/continue-with-apple-btn.png')}
            style={styles.buttonImage}
            contentFit="contain"
          />
        </TouchableOpacity>

        {/* LinkedIn Login */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => handleSocialLogin('LinkedIn')}
          activeOpacity={0.8}
        >
          <Image
            source={require('@/assets/images/continue-with-linkedin-btn.png')}
            style={styles.buttonImage}
            contentFit="contain"
          />
        </TouchableOpacity>

        {/* Google Login */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => handleSocialLogin('Google')}
          activeOpacity={0.8}
        >
          <Image
            source={require('@/assets/images/continue-with-google-btn.png')}
            style={styles.buttonImage}
            contentFit="contain"
          />
        </TouchableOpacity>

        {/* Email Login */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleEmailLogin}
          activeOpacity={0.8}
        >
          <Image
            source={require('@/assets/images/email-login-button.png')}
            style={styles.buttonImage}
            contentFit="contain"
          />
        </TouchableOpacity>

        {/* Terms and Conditions */}
        <Text style={styles.termsText}>
          By continuing, you agree to our T&Cs. We use your data to offer you a personalized experience.{' '}
          <Text style={styles.linkText}>Find out more.</Text>
        </Text>

      </View>
    </>
  );

  const renderAuthForm = () => {
    if (authMode === 'login') {
      return (
        <View style={styles.formContainer}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackToSocial}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <LoginForm
            onSuccess={handleAuthSuccess}
            onSwitchToSignup={handleSwitchToSignup}
            onForgotPassword={handleForgotPassword}
          />
        </View>
      );
    } else if (authMode === 'signup') {
      return (
        <View style={styles.formContainer}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackToSocial}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <SignupForm
            onSuccess={handleSignupSuccess}
            onSwitchToLogin={handleSwitchToLogin}
          />
        </View>
      );
    }
    return null;
  };

  return (
    <GuestOnlyRoute>
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        
        {/* Background Image */}
        <Image
          source={require('@/assets/images/Login-Screen-BgImg.png')}
          style={styles.backgroundImage}
          contentFit="cover"
        />

        {/* Content Overlay */}
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior="height"
        >
          {authMode === 'social' ? renderSocialLogin() : renderAuthForm()}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GuestOnlyRoute>
  );
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  logoText: {
    width: 220,
    height: 50,
  },
  loginSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingBottom: 20,
  },
  loginButton: {
    width: '100%',
    maxWidth: 300,
  },
  buttonImage: {
    width: '100%',
    height: 56,
  },
  termsText: {
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
    lineHeight: 16,
  },
  linkText: {
    textDecorationLine: 'underline',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 16,
    marginTop: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
});