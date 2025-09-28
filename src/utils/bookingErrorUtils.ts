import { Alert } from 'react-native';

export interface BookingError {
  code: string;
  message: string;
  type: 'validation' | 'network' | 'payment' | 'availability' | 'authorization' | 'server' | 'unknown';
  details?: any;
  retryable?: boolean;
}

export interface ApiErrorResponse {
  error?: {
    code?: string;
    message?: string;
    details?: any;
  };
  message?: string;
  code?: string;
}

/**
 * Standard booking error codes and their user-friendly messages
 */
export const BOOKING_ERROR_CODES = {
  // Validation errors
  INVALID_DATES: 'invalid_dates',
  INVALID_GUESTS: 'invalid_guests',
  MISSING_PAYMENT_INFO: 'missing_payment_info',

  // Availability errors
  DATES_UNAVAILABLE: 'dates_unavailable',
  PROPERTY_UNAVAILABLE: 'property_unavailable',
  MAX_GUESTS_EXCEEDED: 'max_guests_exceeded',

  // Payment errors
  PAYMENT_FAILED: 'payment_failed',
  PAYMENT_DECLINED: 'payment_declined',
  INSUFFICIENT_FUNDS: 'insufficient_funds',
  CARD_EXPIRED: 'card_expired',

  // Network errors
  NETWORK_ERROR: 'network_error',
  TIMEOUT: 'timeout',

  // Authorization errors
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',

  // Server errors
  SERVER_ERROR: 'server_error',
  SERVICE_UNAVAILABLE: 'service_unavailable',

  // Booking specific
  BOOKING_NOT_FOUND: 'booking_not_found',
  BOOKING_ALREADY_EXISTS: 'booking_already_exists',
  BOOKING_CANNOT_CANCEL: 'booking_cannot_cancel',
  CANCELLATION_TOO_LATE: 'cancellation_too_late',
} as const;

/**
 * Maps error codes to user-friendly messages
 */
export const ERROR_MESSAGES: Record<string, string> = {
  [BOOKING_ERROR_CODES.INVALID_DATES]: 'Please select valid check-in and check-out dates.',
  [BOOKING_ERROR_CODES.INVALID_GUESTS]: 'Please select a valid number of guests.',
  [BOOKING_ERROR_CODES.MISSING_PAYMENT_INFO]: 'Please provide complete payment information.',
  [BOOKING_ERROR_CODES.DATES_UNAVAILABLE]: 'The selected dates are not available. Please choose different dates.',
  [BOOKING_ERROR_CODES.PROPERTY_UNAVAILABLE]: 'This property is no longer available.',
  [BOOKING_ERROR_CODES.MAX_GUESTS_EXCEEDED]: 'The number of guests exceeds the property limit.',
  [BOOKING_ERROR_CODES.PAYMENT_FAILED]: 'Payment could not be processed. Please try again or use a different payment method.',
  [BOOKING_ERROR_CODES.PAYMENT_DECLINED]: 'Your payment was declined. Please check your card details or try a different card.',
  [BOOKING_ERROR_CODES.INSUFFICIENT_FUNDS]: 'Insufficient funds. Please check your account balance or use a different payment method.',
  [BOOKING_ERROR_CODES.CARD_EXPIRED]: 'Your card has expired. Please use a different card.',
  [BOOKING_ERROR_CODES.NETWORK_ERROR]: 'Network connection error. Please check your internet connection and try again.',
  [BOOKING_ERROR_CODES.TIMEOUT]: 'Request timed out. Please try again.',
  [BOOKING_ERROR_CODES.UNAUTHORIZED]: 'You are not authorized to perform this action. Please log in again.',
  [BOOKING_ERROR_CODES.FORBIDDEN]: 'You do not have permission to perform this action.',
  [BOOKING_ERROR_CODES.SERVER_ERROR]: 'A server error occurred. Please try again later.',
  [BOOKING_ERROR_CODES.SERVICE_UNAVAILABLE]: 'Service is temporarily unavailable. Please try again later.',
  [BOOKING_ERROR_CODES.BOOKING_NOT_FOUND]: 'Booking not found.',
  [BOOKING_ERROR_CODES.BOOKING_ALREADY_EXISTS]: 'A booking already exists for these dates.',
  [BOOKING_ERROR_CODES.BOOKING_CANNOT_CANCEL]: 'This booking cannot be cancelled.',
  [BOOKING_ERROR_CODES.CANCELLATION_TOO_LATE]: 'It\'s too late to cancel this booking.',
};

/**
 * Parses various error formats into a standardized BookingError
 */
export const parseBookingError = (error: any): BookingError => {
  // Handle Supabase errors
  if (error?.code && error?.message) {
    return {
      code: error.code,
      message: ERROR_MESSAGES[error.code] || error.message,
      type: getErrorType(error.code),
      details: error.details,
      retryable: isRetryableError(error.code),
    };
  }

  // Handle API response errors
  if (error?.error) {
    const apiError = error as ApiErrorResponse;
    const errorObj = apiError.error!;
    const code = errorObj.code || apiError.code || 'unknown';
    return {
      code,
      message: ERROR_MESSAGES[code] || errorObj.message || apiError.message || 'An error occurred',
      type: getErrorType(code),
      details: errorObj.details,
      retryable: isRetryableError(code),
    };
  }

  // Handle network errors
  if (error?.name === 'NetworkError' || error?.message?.includes('network')) {
    return {
      code: BOOKING_ERROR_CODES.NETWORK_ERROR,
      message: ERROR_MESSAGES[BOOKING_ERROR_CODES.NETWORK_ERROR],
      type: 'network',
      retryable: true,
    };
  }

  // Handle timeout errors
  if (error?.name === 'TimeoutError' || error?.message?.includes('timeout')) {
    return {
      code: BOOKING_ERROR_CODES.TIMEOUT,
      message: ERROR_MESSAGES[BOOKING_ERROR_CODES.TIMEOUT],
      type: 'network',
      retryable: true,
    };
  }

  // Handle Stripe errors
  if (error?.type === 'card_error' || error?.type === 'api_error') {
    const stripeCode = error.code || 'payment_failed';
    return {
      code: stripeCode,
      message: ERROR_MESSAGES[stripeCode] || error.message || 'Payment error occurred',
      type: 'payment',
      details: error,
      retryable: error.type !== 'card_error' || stripeCode !== 'card_declined',
    };
  }

  // Default error
  return {
    code: 'unknown',
    message: error?.message || 'An unexpected error occurred',
    type: 'unknown',
    details: error,
    retryable: true,
  };
};

/**
 * Determines error type based on error code
 */
const getErrorType = (code: string): BookingError['type'] => {
  if (['invalid_dates', 'invalid_guests', 'missing_payment_info'].includes(code)) {
    return 'validation';
  }
  if (['dates_unavailable', 'property_unavailable', 'max_guests_exceeded', 'booking_already_exists'].includes(code)) {
    return 'availability';
  }
  if (['payment_failed', 'payment_declined', 'insufficient_funds', 'card_expired'].includes(code)) {
    return 'payment';
  }
  if (['network_error', 'timeout'].includes(code)) {
    return 'network';
  }
  if (['unauthorized', 'forbidden'].includes(code)) {
    return 'authorization';
  }
  if (['server_error', 'service_unavailable'].includes(code)) {
    return 'server';
  }
  return 'unknown';
};

/**
 * Determines if an error is retryable
 */
const isRetryableError = (code: string): boolean => {
  const retryableCodes = [
    'network_error',
    'timeout',
    'server_error',
    'service_unavailable',
    'payment_failed', // Some payment failures are retryable
  ];
  return retryableCodes.includes(code);
};

/**
 * Shows a user-friendly alert for booking errors
 */
export const showBookingErrorAlert = (error: BookingError | any, title?: string) => {
  const parsedError = error instanceof Object && 'code' in error ? error : parseBookingError(error);

  Alert.alert(
    title || 'Booking Error',
    parsedError.message,
    parsedError.retryable ? [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Retry', style: 'default' }
    ] : [
      { text: 'OK', style: 'default' }
    ]
  );
};

/**
 * Creates a standardized error for throwing
 */
export const createBookingError = (
  code: string,
  message?: string,
  type?: BookingError['type'],
  details?: any
): BookingError => {
  return {
    code,
    message: message || ERROR_MESSAGES[code] || 'An error occurred',
    type: type || getErrorType(code),
    details,
    retryable: isRetryableError(code),
  };
};