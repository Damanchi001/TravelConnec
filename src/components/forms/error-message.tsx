import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../../constants/colors';

interface ErrorMessageProps {
  message: string;
  type?: 'error' | 'warning' | 'info';
  showIcon?: boolean;
  style?: any;
}

/**
 * User-friendly error message component with different types and icons
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  type = 'error',
  showIcon = true,
  style,
}) => {
  const getIconName = () => {
    switch (type) {
      case 'warning':
        return 'warning';
      case 'info':
        return 'information-circle';
      default:
        return 'close-circle';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'warning':
        return '#FFA000';
      case 'info':
        return '#2196F3';
      default:
        return Colors.notification;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'warning':
        return '#FFF3E0';
      case 'info':
        return '#E3F2FD';
      default:
        return '#FFEBEE';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'warning':
        return '#FFCC02';
      case 'info':
        return '#2196F3';
      default:
        return Colors.notification || '#F44336';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor(), borderColor: getBorderColor() }, style]}>
      {showIcon && (
        <Ionicons
          name={getIconName()}
          size={20}
          color={getIconColor()}
          style={styles.icon}
        />
      )}
      <Text style={[styles.message, { color: getIconColor() }]}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 4,
  },
  icon: {
    marginRight: 8,
    marginTop: 2,
  },
  message: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});