import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    TouchableOpacityProps,
    ViewStyle,
} from 'react-native';

interface FormButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  testID?: string;
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
}

export const FormButton: React.FC<FormButtonProps> = ({
  title,
  loading = false,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  testID,
  buttonStyle,
  textStyle,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const getButtonStyle = (): any[] => {
    const baseStyle: any[] = [styles.button, styles[`button_${size}`]];
    
    switch (variant) {
      case 'secondary':
        baseStyle.push(styles.buttonSecondary);
        break;
      case 'outline':
        baseStyle.push(styles.buttonOutline);
        break;
      default:
        baseStyle.push(styles.buttonPrimary);
    }

    if (isDisabled) {
      baseStyle.push(styles.buttonDisabled);
    }

    if (buttonStyle) {
      baseStyle.push(buttonStyle);
    }

    return baseStyle;
  };

  const getTextStyle = (): any[] => {
    const baseStyle: any[] = [styles.text, styles[`text_${size}`]];
    
    switch (variant) {
      case 'secondary':
        baseStyle.push(styles.textSecondary);
        break;
      case 'outline':
        baseStyle.push(styles.textOutline);
        break;
      default:
        baseStyle.push(styles.textPrimary);
    }

    if (isDisabled) {
      baseStyle.push(styles.textDisabled);
    }

    if (textStyle) {
      baseStyle.push(textStyle);
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      disabled={isDisabled}
      activeOpacity={0.8}
      testID={testID}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#fff' : '#2196F3'}
          testID={`${testID}-loading`}
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  button_small: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
  },
  button_medium: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 48,
  },
  button_large: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 56,
  },
  buttonPrimary: {
    backgroundColor: '#2196F3',
  },
  buttonSecondary: {
    backgroundColor: '#f5f5f5',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  buttonDisabled: {
    backgroundColor: '#e0e0e0',
    borderColor: '#e0e0e0',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  text_small: {
    fontSize: 14,
  },
  text_medium: {
    fontSize: 16,
  },
  text_large: {
    fontSize: 18,
  },
  textPrimary: {
    color: '#fff',
  },
  textSecondary: {
    color: '#333',
  },
  textOutline: {
    color: '#2196F3',
  },
  textDisabled: {
    color: '#999',
  },
});