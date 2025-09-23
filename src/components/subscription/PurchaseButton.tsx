import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PurchaseButtonProps {
  tierId: string;
  price: string;
  period: string;
  isLoading?: boolean;
  isTrial?: boolean;
  trialDays?: number;
  onPress: () => void;
  disabled?: boolean;
  style?: any;
}

export default function PurchaseButton({
  tierId,
  price,
  period,
  isLoading = false,
  isTrial = false,
  trialDays = 7,
  onPress,
  disabled = false,
  style
}: PurchaseButtonProps) {
  const primaryColor = useThemeColor({}, 'tint');

  const getButtonColor = (tierId: string) => {
    switch (tierId) {
      case 'social':
        return '#6B7280'; // Gray
      case 'traveler':
        return primaryColor; // Primary blue
      case 'entrepreneur':
        return '#7C3AED'; // Purple
      default:
        return primaryColor;
    }
  };

  const buttonColor = getButtonColor(tierId);
  const isFree = price === '$0';

  const getButtonText = () => {
    if (isFree) return 'Get Started';
    if (isTrial) return `Start ${trialDays}-Day Free Trial`;
    return `Subscribe for ${price}`;
  };

  const getSubText = () => {
    if (isFree) return '';
    if (isTrial) return `Then ${price}/${period}`;
    return '';
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: disabled ? '#9CA3AF' : buttonColor,
          opacity: disabled ? 0.6 : 1,
        },
        style
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="white" size="small" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <Text style={styles.buttonText}>
            {getButtonText()}
          </Text>
          {getSubText() && (
            <Text style={styles.subText}>
              {getSubText()}
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  contentContainer: {
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});