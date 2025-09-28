import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../../constants/colors';
import { ErrorMessage } from '../forms/error-message';

interface GuestSelectorProps {
  value: number;
  onChange: (value: number) => void;
  minGuests?: number;
  maxGuests?: number;
  label?: string;
  showLabel?: boolean;
  error?: string;
}

export const GuestSelector: React.FC<GuestSelectorProps> = ({
  value,
  onChange,
  minGuests = 1,
  maxGuests = 10,
  label = 'Guests',
  showLabel = true,
  error,
}) => {
  const decreaseGuests = () => {
    if (value > minGuests) {
      onChange(value - 1);
    }
  };

  const increaseGuests = () => {
    if (value < maxGuests) {
      onChange(value + 1);
    }
  };

  const canDecrease = value > minGuests;
  const canIncrease = value < maxGuests;

  return (
    <View style={styles.container}>
      {showLabel && (
        <Text style={styles.label}>{label}</Text>
      )}

      <View style={[styles.selectorContainer, error && styles.selectorContainerError]}>
        <TouchableOpacity
          style={[
            styles.button,
            !canDecrease && styles.buttonDisabled,
          ]}
          onPress={decreaseGuests}
          disabled={!canDecrease}
        >
          <Ionicons
            name="remove"
            size={20}
            color={canDecrease ? Colors.primary : Colors.textSecondary}
          />
        </TouchableOpacity>

        <View style={styles.valueContainer}>
          <Text style={styles.valueText}>{value}</Text>
          <Text style={styles.guestText}>
            {value === 1 ? 'Guest' : 'Guests'}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            !canIncrease && styles.buttonDisabled,
          ]}
          onPress={increaseGuests}
          disabled={!canIncrease}
        >
          <Ionicons
            name="add"
            size={20}
            color={canIncrease ? Colors.primary : Colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {error && <ErrorMessage message={error} style={styles.errorMessage} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  selectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  selectorContainerError: {
    borderColor: Colors.notification,
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  valueContainer: {
    flex: 1,
    alignItems: 'center',
  },
  valueText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  guestText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  errorMessage: {
    marginTop: 8,
  },
});