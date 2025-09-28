import Constants from 'expo-constants';

// Environment variables
const stripePublishableKey = Constants.expoConfig?.extra?.stripePublishableKey || process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  throw new Error(
    'Missing Stripe publishable key. Please check your .env.local file and ensure EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY is set.'
  );
}

// Initialize Stripe
const initializeStripe = async () => {
  try {
    const { initStripe } = await import('@stripe/stripe-react-native');
    await initStripe({
      publishableKey: stripePublishableKey,
      merchantIdentifier: 'merchant.com.mynewtravelproject', // For Apple Pay
      urlScheme: 'mynewtravelproject', // For 3D Secure redirects
    });
  } catch (error) {
    console.warn('Stripe not available, skipping initialization:', error instanceof Error ? error.message : String(error));
    // Don't throw, just warn
  }
};

export default initializeStripe;

// Export publishable key for server-side operations (when needed)
export const STRIPE_PUBLISHABLE_KEY = stripePublishableKey;

// Stripe configuration for Connect
export const STRIPE_CONFIG = {
  publishableKey: stripePublishableKey,
  // Application fee percentage (3% platform fee)
  applicationFeePercent: 3,
  // Supported payment methods
  paymentMethods: ['card', 'apple_pay', 'google_pay'],
  // Currency
  currency: 'usd',
} as const;