import { ThemedView } from '@/components/themed-view';
import { IconSymbol, IconSymbolName } from '@/components/ui/icon-symbol';
import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

interface FABProps {
  onPress: () => void;
  icon?: IconSymbolName;
  size?: 'small' | 'medium' | 'large';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  disabled?: boolean;
  style?: ViewStyle;
}

export const FAB: React.FC<FABProps> = ({
  onPress,
  icon = 'plus',
  size = 'medium',
  position = 'bottom-right',
  disabled = false,
  style,
}) => {

  const sizeStyles = {
    small: { width: 48, height: 48, borderRadius: 24 },
    medium: { width: 56, height: 56, borderRadius: 28 },
    large: { width: 64, height: 64, borderRadius: 32 },
  };

  const positionStyles = {
    'bottom-right': { bottom: 24, right: 24 },
    'bottom-left': { bottom: 24, left: 24 },
    'top-right': { top: 24, right: 24 },
    'top-left': { top: 24, left: 24 },
  };

  const iconSizes = {
    small: 20,
    medium: 24,
    large: 28,
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        sizeStyles[size],
        positionStyles[position],
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <ThemedView style={[styles.fab, sizeStyles[size]]}>
        <IconSymbol
          name={icon}
          size={iconSizes[size]}
          color="white"
        />
      </ThemedView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fab: {
    backgroundColor: '#0a7ea4', // Using the tint color
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default FAB;