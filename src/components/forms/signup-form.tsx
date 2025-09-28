import { useAuthStore } from '@/src/stores/auth-store';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { logAuthError, mapAuthError, shouldShowAlert, showAuthErrorAlert } from '../../utils/authErrorUtils';
import { ErrorMessage } from './error-message';
import { FormButton } from './form-button';
import { FormInput } from './form-input';

interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
}

export const SignupForm: React.FC<SignupFormProps> = ({
  onSuccess,
  onSwitchToLogin,
}) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState<string>('');
  
  const { signUp, isLoading } = useAuthStore();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): { isValid: boolean; message?: string } => {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    return { isValid: true };
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.message;
      }
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
      const result = await signUp({
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
      });

      if (result.success) {
        onSuccess?.();
      } else {
        const error = result.error || 'Registration failed. Please try again.';
        const userFriendlyError = mapAuthError(error);

        logAuthError(error, 'SignupForm.handleSubmit');

        if (shouldShowAlert(error)) {
          showAuthErrorAlert(error, 'Registration Failed');
        } else {
          setGeneralError(userFriendlyError);
        }
      }
    } catch (error: any) {
      const userFriendlyError = mapAuthError(error);
      logAuthError(error, 'SignupForm.handleSubmit - catch');

      if (shouldShowAlert(error)) {
        showAuthErrorAlert(error, 'Registration Failed');
      } else {
        setGeneralError(userFriendlyError);
      }
    }
  };

  const handleSwitchToLogin = () => {
    onSwitchToLogin?.();
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the community of travelers</Text>
      </View>

      <View style={styles.form}>
        {generalError && (
          <ErrorMessage
            message={generalError}
          />
        )}

        <View style={styles.nameRow}>
          <View style={styles.nameField}>
            <FormInput
              label="First Name"
              value={formData.firstName}
              onChangeText={(value) => handleInputChange('firstName', value)}
              error={errors.firstName}
              placeholder="John"
              autoCapitalize="words"
              autoFocus
              required
              testID="signup-firstname-input"
            />
          </View>
          
          <View style={styles.nameField}>
            <FormInput
              label="Last Name"
              value={formData.lastName}
              onChangeText={(value) => handleInputChange('lastName', value)}
              error={errors.lastName}
              placeholder="Doe"
              autoCapitalize="words"
              required
              testID="signup-lastname-input"
            />
          </View>
        </View>

        <FormInput
          label="Email"
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          error={errors.email}
          placeholder="john.doe@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          required
          testID="signup-email-input"
        />

        <FormInput
          label="Password"
          value={formData.password}
          onChangeText={(value) => handleInputChange('password', value)}
          error={errors.password}
          placeholder="Create a strong password"
          isPassword
          required
          testID="signup-password-input"
        />


        <Text style={styles.passwordHint}>
          Password must be at least 8 characters with uppercase, lowercase, and numbers
        </Text>

        <FormButton
          title="Create Account"
          onPress={handleSubmit}
          loading={isLoading}
          size="large"
          testID="signup-submit-button"
          buttonStyle={styles.submitButton}
        />

        <View style={styles.switchContainer}>
          <Text style={styles.switchText}>Already have an account? </Text>
          <TouchableOpacity onPress={handleSwitchToLogin} testID="switch-to-login-button">
            <Text style={styles.switchButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameField: {
    flex: 1,
  },
  passwordHint: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: -8,
    marginBottom: 24,
    lineHeight: 16,
  },
  submitButton: {
    marginBottom: 24,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
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