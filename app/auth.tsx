import { GuestOnlyRoute } from '@/src/components/auth';
import { LoginForm, SignupForm } from '@/src/components/forms';
import { useAuthStore } from '@/src/stores/auth-store';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

type AuthMode = 'social' | 'login' | 'signup';

export default function AuthScreen() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<AuthMode>('social');
  const { isAuthenticated, loadUser, isLoading } = useAuthStore();

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

  const { signInWithGoogle, signInWithFacebook, signInWithApple } = useAuthStore();

  const handleSocialLogin = async (provider: string) => {
    try {
      console.log(`[AuthScreen] Starting ${provider} authentication`);
      let result;

      switch (provider.toLowerCase()) {
        case 'google':
          result = await signInWithGoogle();
          break;
        case 'facebook':
          result = await signInWithFacebook();
          break;
        case 'apple':
          result = await signInWithApple();
          break;
        default:
          console.warn(`[AuthScreen] Unsupported provider: ${provider}`);
          Alert.alert('Error', `${provider} authentication is not supported yet.`);
          return;
      }

      if (!result.success) {
        console.error(`[AuthScreen] ${provider} authentication failed:`, result.error);
        const errorMessage = getAuthErrorMessage(result.error || 'Unknown error', provider);
        Alert.alert('Authentication Failed', errorMessage);
      } else {
        console.log(`[AuthScreen] ${provider} authentication initiated successfully`);
        // Success will be handled by the auth state change listener
      }
    } catch (error: any) {
      console.error(`[AuthScreen] ${provider} login exception:`, error);
      const errorMessage = getAuthErrorMessage(error?.message || error, provider);
      Alert.alert('Authentication Failed', errorMessage);
    }
  };

  const getAuthErrorMessage = (error: string, provider: string): string => {
    if (!error) return `Failed to authenticate with ${provider}. Please try again.`;

    const lowerError = error.toLowerCase();

    if (lowerError.includes('network') || lowerError.includes('connection')) {
      return `Network error. Please check your internet connection and try again.`;
    }

    if (lowerError.includes('cancelled') || lowerError.includes('dismissed')) {
      return `Authentication was cancelled. Please try again if you want to sign in with ${provider}.`;
    }

    if (lowerError.includes('invalid') || lowerError.includes('unauthorized')) {
      return `Authentication failed. Please check your ${provider} account and try again.`;
    }

    if (lowerError.includes('timeout')) {
      return `Authentication timed out. Please try again.`;
    }

    // Default error message
    return `Failed to authenticate with ${provider}. Please try again or contact support if the problem persists.`;
  };

  const handleEmailLogin = () => {
    setAuthMode('login');
  };

  const handleAuthSuccess = () => {
    // After successful login, navigate to main app
    router.replace('/(tabs)' as any);
  };

  const handleSignupSuccess = () => {
    // After successful signup, navigate to profile setup
    router.replace('/profile-setup' as any);
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
          style={[styles.loginButton, isLoading && styles.disabledButton]}
          onPress={() => handleSocialLogin('Facebook')}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          <Image
            source={require('@/assets/images/continue-with-facebook-btn.png')}
            style={[styles.buttonImage, isLoading && styles.disabledImage]}
            contentFit="contain"
          />
        </TouchableOpacity>

        {/* Apple Login */}
        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.disabledButton]}
          onPress={() => handleSocialLogin('Apple')}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          <Image
            source={require('@/assets/images/continue-with-apple-btn.png')}
            style={[styles.buttonImage, isLoading && styles.disabledImage]}
            contentFit="contain"
          />
        </TouchableOpacity>

        {/* LinkedIn Login - Not implemented yet */}
        <TouchableOpacity
          style={[styles.loginButton, styles.disabledButton]}
          onPress={() => Alert.alert('Coming Soon', 'LinkedIn authentication will be available soon.')}
          activeOpacity={0.8}
          disabled={true}
        >
          <Image
            source={require('@/assets/images/continue-with-linkedin-btn.png')}
            style={[styles.buttonImage, styles.disabledImage]}
            contentFit="contain"
          />
        </TouchableOpacity>

        {/* Google Login */}
        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.disabledButton]}
          onPress={() => handleSocialLogin('Google')}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          <Image
            source={require('@/assets/images/continue-with-google-btn.png')}
            style={[styles.buttonImage, isLoading && styles.disabledImage]}
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
        <ScrollView style={styles.formContainer} keyboardDismissMode="on-drag">
          <TouchableOpacity style={styles.backButton} onPress={handleBackToSocial}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <LoginForm
            onSuccess={handleAuthSuccess}
            onSwitchToSignup={handleSwitchToSignup}
            onForgotPassword={handleForgotPassword}
          />
        </ScrollView>
      );
    } else if (authMode === 'signup') {
      return (
        <ScrollView style={styles.formContainer} keyboardDismissMode="on-drag">
          <TouchableOpacity style={styles.backButton} onPress={handleBackToSocial}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <SignupForm
            onSuccess={handleSignupSuccess}
            onSwitchToLogin={handleSwitchToLogin}
          />
        </ScrollView>
      );
    }
    return null;
  };

  return (
    <GuestOnlyRoute>
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        
        {/* Background Image */}
        <Image
          source={require('@/assets/images/Login-Screen-BgImg.png')}
          style={styles.backgroundImage}
          contentFit="cover"
        />

        {/* Content Overlay */}
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.5)']}
          style={styles.overlay}
        >
          <KeyboardAvoidingView
            behavior="padding"
            style={{flex: 1, paddingHorizontal: 24, paddingVertical: 60}}
          >
            {authMode === 'social' ? renderSocialLogin() : renderAuthForm()}
          </KeyboardAvoidingView>
        </LinearGradient>
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
  },
  logoSection: {
    flex: 1.3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    width: 250,
    height: 60,
  },
  loginSection: {
    flex: 0.9,
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
  disabledButton: {
    opacity: 0.6,
  },
  disabledImage: {
    opacity: 0.6,
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