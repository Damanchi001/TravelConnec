import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { ThemedView } from '../../../../components/themed-view';
import { Colors } from '../../../../constants/colors';
import { FormButton, FormInput } from '../../../../src/components/forms';
import type { Listing } from '../../../../src/hooks/queries/use-listings';
import { useListingById } from '../../../../src/hooks/queries/use-listings';
import { supabase } from '../../../../src/services/supabase/client';
import { useAuthStore } from '../../../../src/stores/auth-store';

interface FormData {
  title: string;
  description: string;
  listing_type: 'experience' | 'service';
  category: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  };
  base_price: string;
  currency: string;
  price_per: string;
  max_guests: string;
  available_from: string;
  available_to: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
  };
  base_price?: string;
  currency?: string;
  price_per?: string;
  max_guests?: string;
  available_from?: string;
  available_to?: string;
}

export default function EditListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    listing_type: 'experience',
    category: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      postal_code: '',
    },
    base_price: '',
    currency: 'USD',
    price_per: 'hour',
    max_guests: '',
    available_from: '',
    available_to: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Fetch existing listing
  const { data: listing, isLoading, error } = useListingById(id);

  // Pre-populate form when listing loads
  useEffect(() => {
    if (listing) {
      setFormData({
        title: listing.title || '',
        description: listing.description || '',
        listing_type: listing.listing_type,
        category: listing.category || '',
        address: {
          street: listing.address?.street || '',
          city: listing.address?.city || '',
          state: listing.address?.state || '',
          country: listing.address?.country || '',
          postal_code: listing.address?.postal_code || '',
        },
        base_price: listing.base_price?.toString() || '',
        currency: listing.currency || 'USD',
        price_per: listing.price_per || 'hour',
        max_guests: listing.max_guests?.toString() || '',
        available_from: listing.available_from || '',
        available_to: listing.available_to || '',
      });
    }
  }, [listing]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Listing>) => {
      const { data: result, error } = await supabase
        .from('listings')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result as Listing;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['host-listings', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['listing', id] });
      Alert.alert('Success', 'Listing updated successfully!', [
        {
          text: 'OK',
          onPress: () => router.replace('/(host)/listings'),
        },
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to update listing. Please try again.');
    },
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!formData.address.city.trim()) {
      newErrors.address = { ...newErrors.address, city: 'City is required' };
    }

    if (!formData.address.country.trim()) {
      newErrors.address = { ...newErrors.address, country: 'Country is required' };
    }

    const price = parseFloat(formData.base_price);
    if (!formData.base_price || isNaN(price) || price <= 0) {
      newErrors.base_price = 'Valid price is required';
    }

    const guests = parseInt(formData.max_guests);
    if (!formData.max_guests || isNaN(guests) || guests <= 0) {
      newErrors.max_guests = 'Valid number of guests is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const updateData: Partial<Listing> = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      listing_type: formData.listing_type,
      category: formData.category.trim(),
      address: {
        street: formData.address.street.trim(),
        city: formData.address.city.trim(),
        state: formData.address.state.trim(),
        country: formData.address.country.trim(),
        postal_code: formData.address.postal_code.trim(),
      },
      base_price: parseFloat(formData.base_price),
      currency: formData.currency,
      price_per: formData.price_per,
      max_guests: parseInt(formData.max_guests),
      available_from: formData.available_from || undefined,
      available_to: formData.available_to || undefined,
    };

    updateMutation.mutate(updateData);
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const updateAddress = (field: keyof FormData['address'], value: string) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
    // Clear address errors
    if (errors.address?.[field]) {
      setErrors(prev => ({
        ...prev,
        address: { ...prev.address, [field]: undefined }
      }));
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading listing...</Text>
        </View>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>Failed to load listing</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Listing</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            <FormInput
              label="Title"
              value={formData.title}
              onChangeText={(value) => updateFormData('title', value)}
              error={errors.title}
              placeholder="Enter listing title"
            />

            <FormInput
              label="Description"
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              error={errors.description}
              placeholder="Describe your listing"
              multiline
              numberOfLines={4}
            />

            <FormInput
              label="Category"
              value={formData.category}
              onChangeText={(value) => updateFormData('category', value)}
              error={errors.category}
              placeholder="e.g., Photography, Cooking, Adventure"
            />

            <Text style={styles.sectionTitle}>Address</Text>

            <FormInput
              label="Street Address"
              value={formData.address.street}
              onChangeText={(value) => updateAddress('street', value)}
              placeholder="Street address (optional)"
            />

            <FormInput
              label="City"
              value={formData.address.city}
              onChangeText={(value) => updateAddress('city', value)}
              error={errors.address?.city}
              placeholder="City"
            />

            <FormInput
              label="State/Province"
              value={formData.address.state}
              onChangeText={(value) => updateAddress('state', value)}
              placeholder="State or province (optional)"
            />

            <FormInput
              label="Country"
              value={formData.address.country}
              onChangeText={(value) => updateAddress('country', value)}
              error={errors.address?.country}
              placeholder="Country"
            />

            <FormInput
              label="Postal Code"
              value={formData.address.postal_code}
              onChangeText={(value) => updateAddress('postal_code', value)}
              placeholder="Postal code (optional)"
            />

            <Text style={styles.sectionTitle}>Pricing & Capacity</Text>

            <FormInput
              label="Base Price"
              value={formData.base_price}
              onChangeText={(value) => updateFormData('base_price', value)}
              error={errors.base_price}
              placeholder="0.00"
              keyboardType="numeric"
            />

            <FormInput
              label="Currency"
              value={formData.currency}
              onChangeText={(value) => updateFormData('currency', value)}
              placeholder="USD"
            />

            <FormInput
              label="Price Per"
              value={formData.price_per}
              onChangeText={(value) => updateFormData('price_per', value)}
              placeholder="hour, day, person, etc."
            />

            <FormInput
              label="Maximum Guests"
              value={formData.max_guests}
              onChangeText={(value) => updateFormData('max_guests', value)}
              error={errors.max_guests}
              placeholder="1"
              keyboardType="numeric"
            />

            <Text style={styles.sectionTitle}>Availability</Text>

            <FormInput
              label="Available From"
              value={formData.available_from}
              onChangeText={(value) => updateFormData('available_from', value)}
              placeholder="YYYY-MM-DD (optional)"
            />

            <FormInput
              label="Available To"
              value={formData.available_to}
              onChangeText={(value) => updateFormData('available_to', value)}
              placeholder="YYYY-MM-DD (optional)"
            />

            <View style={styles.buttonContainer}>
              <FormButton
                title="Update Listing"
                onPress={handleSubmit}
                loading={updateMutation.isPending}
                disabled={updateMutation.isPending}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.card,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  headerSpacer: {
    width: 40,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 24,
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 32,
    marginBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  retryText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '500',
  },
});