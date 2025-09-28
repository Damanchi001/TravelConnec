import { useAuthStore } from '@/src/stores/auth-store';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { mapAuthError } from '../../utils/authErrorUtils';
import { ErrorMessage } from './error-message';
import { FormButton } from './form-button';
import { FormInput } from './form-input';

interface LoginFormProps {
  onSuccess?: () => void;
  onForgotPassword?: () => void;
  onSwitchToSignup?: () => void;
}

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onForgotPassword,
  onSwitchToSignup,
}) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState<string>('');
  
  const { signIn, isLoading } = useAuthStore();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Clear general error when user starts typing
    if (generalError) {
      setGeneralError('');
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const result = await signIn(formData.email.trim(), formData.password);

      if (result.success) {
        onSuccess?.();
      } else {
        const error = result.error || 'Login failed. Please try again.';
        const userFriendlyError = mapAuthError(error);
        setGeneralError(userFriendlyError);
      }
    } catch (error: any) {
      const userFriendlyError = mapAuthError(error);
      setGeneralError(userFriendlyError);
    }
  };

  const handleForgotPassword = () => {
    onForgotPassword?.();
  };

  const handleSwitchToSignup = () => {
    onSwitchToSignup?.();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>
      </View>

      <View style={styles.form}>
        {generalError && (
          <ErrorMessage
            message={generalError}
          />
        )}

        <FormInput
          label="Email"
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          error={errors.email}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoFocus
          required
          testID="login-email-input"
        />

        <FormInput
          label="Password"
          value={formData.password}
          onChangeText={(value) => handleInputChange('password', value)}
          error={errors.password}
          placeholder="Enter your password"
          isPassword
          required
          testID="login-password-input"
        />

        <TouchableOpacity
          style={styles.forgotPasswordButton}
          onPress={handleForgotPassword}
          testID="forgot-password-button"
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <FormButton
          title="Sign In"
          onPress={handleSubmit}
          loading={isLoading}
          size="large"
          testID="login-submit-button"
          buttonStyle={styles.submitButton}
        />

        <View style={styles.switchContainer}>
          <Text style={styles.switchText}>Don&apos;t have an account? </Text>
          <TouchableOpacity onPress={handleSwitchToSignup} testID="switch-to-signup-button">
            <Text style={styles.switchButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    padding: 4,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textDecorationLine: 'underline',
  },
  submitButton: {
    marginBottom: 24,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  switchButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});