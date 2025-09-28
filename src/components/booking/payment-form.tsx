import { CardField, useConfirmPayment } from '@stripe/stripe-react-native';
import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View
} from 'react-native';
import { Colors } from '../../../constants/colors';
import { createPaymentIntent } from '../../services/stripe/payments';
import { FormButton } from '../forms/form-button';

interface PaymentFormProps {
  bookingId: string;
  amount: number;
  currency?: string;
  onPaymentSuccess: (paymentIntent: any) => void;
  onPaymentError?: (error: string) => void;
  onCancel?: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  bookingId,
  amount,
  currency = 'usd',
  onPaymentSuccess,
  onPaymentError,
  onCancel,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<any>(null);

  const { confirmPayment, loading: stripeLoading } = useConfirmPayment();

  const handleCardChange = (cardDetails: any) => {
    setCardComplete(cardDetails.complete);
    if (error) setError(null);
  };

  const handlePayment = async () => {
    if (!cardComplete) {
      setError('Please complete your card details');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Create payment intent
      const intent = await createPaymentIntent({
        bookingId,
        amount: Math.round(amount * 100), // Convert to cents
        currency,
      });

      setPaymentIntent(intent);

      // Step 2: Confirm payment with card details
      const { paymentIntent: confirmedIntent, error: confirmError } = await confirmPayment(
        intent.clientSecret,
        {
          paymentMethodType: 'Card',
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message || 'Payment confirmation failed');
      }

      if (confirmedIntent?.status === 'Succeeded') {
        onPaymentSuccess(confirmedIntent);
      } else {
        throw new Error('Payment was not successful');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Payment failed. Please try again.';
      setError(errorMessage);
      onPaymentError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment Details</Text>
        <Text style={styles.subtitle}>
          Secure payment powered by Stripe
        </Text>
      </View>

      <View style={styles.amountContainer}>
        <Text style={styles.amountLabel}>Total Amount</Text>
        <Text style={styles.amountValue}>
          {formatAmount(amount, currency)}
        </Text>
      </View>

      <View style={styles.cardContainer}>
        <Text style={styles.cardLabel}>Card Information</Text>
        <CardField
          postalCodeEnabled={true}
          placeholders={{
            number: '4242 4242 4242 4242',
          }}
          cardStyle={{
            backgroundColor: Colors.card,
            textColor: Colors.text,
            placeholderColor: Colors.textSecondary,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: error ? Colors.notification : Colors.border,
          }}
          style={styles.cardField}
          onCardChange={handleCardChange}
        />
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>

      <View style={styles.securityNote}>
        <Text style={styles.securityText}>
          🔒 Your payment information is encrypted and secure.
          We comply with PCI DSS standards.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        {onCancel && (
          <FormButton
            title="Cancel"
            variant="outline"
            onPress={onCancel}
            buttonStyle={styles.cancelButton}
            disabled={isProcessing || stripeLoading}
          />
        )}
        <FormButton
          title="Pay Now"
          onPress={handlePayment}
          loading={isProcessing || stripeLoading}
          disabled={!cardComplete || isProcessing || stripeLoading}
          buttonStyle={styles.payButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    padding: 20,
    borderRadius: 12,
    marginVertical: 8,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  amountContainer: {
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
  },
  cardContainer: {
    marginBottom: 16,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  cardField: {
    width: '100%',
    height: 50,
    marginVertical: 8,
  },
  errorText: {
    fontSize: 14,
    color: Colors.notification,
    marginTop: 8,
  },
  securityNote: {
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  securityText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  payButton: {
    flex: 2,
  },
});