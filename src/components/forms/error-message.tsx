import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ErrorMessageProps {
  message: string;
  visible?: boolean;
  testID?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  visible = true,
  testID,
}) => {
  if (!visible || !message) {
    return null;
  }

  return (
    <View style={styles.container} testID={testID}>
      <Ionicons name="alert-circle" size={16} color="#ef4444" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 8,
  },
  message: {
    fontSize: 14,
    color: '#dc2626',
    marginLeft: 8,
    flex: 1,
  },
});