import { supabase } from "@/src/services/supabase/client";
import { useAuthStore } from "@/src/stores/auth-store";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Clock, Edit, Heart, MapPin, Star, Users } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ListingFormData {
  title: string;
  shortDescription: string;
  fullDescription: string;
  price: string;
  location: string;
  availabilityDates: string;
  images: string[];
  duration?: string;
  maxGuests?: string;
  category?: string;
  rentalType?: 'rent' | 'buy';
}

export default function ListingPreviewScreen() {
  const insets = useSafeAreaInsets();
  const { type, data } = useLocalSearchParams<{ type: string; data: string }>();
  const { user } = useAuthStore();

  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const formData: ListingFormData = JSON.parse(data || '{}');
  const isExperience = type === 'experience';

  const handleEdit = () => {
    router.push({
      pathname: '/listing-details',
      params: { type, data }
    });
  };

  const handlePublish = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to publish a listing');
      return;
    }

    setIsPublishing(true);

    try {
      // Map form data to database schema
      const listingData = {
        host_id: user.id,
        title: formData.title,
        description: formData.fullDescription || formData.shortDescription,
        listing_type: isExperience ? 'experience' : 'service',
        category: formData.category,
        address: {
          street: '',
          city: formData.location,
          state: '',
          country: '',
          postal_code: ''
        },
        coordinates: '(0,0)', // PostGIS POINT format - default coordinates, should be geocoded from location
        base_price: parseFloat(formData.price) || 0,
        currency: 'USD',
        price_per: isExperience ? 'person' : (formData.rentalType === 'rent' ? 'day' : 'item'),
        max_guests: isExperience ? parseInt(formData.maxGuests || '1') : 1,
        images: formData.images.map((url, index) => ({
          url,
          caption: '',
          order: index
        })), // JSONB format as per schema
        status: 'active',
        available_from: new Date().toISOString().split('T')[0], // Today
        available_to: null, // No end date for now
        features: isExperience ? {
          duration: formData.duration,
          max_guests: formData.maxGuests
        } : {}
      };

      const { error } = await supabase
        .from('listings')
        .insert(listingData);

      if (error) {
        throw error;
      }

      // Success
      Alert.alert(
        'Success',
        'Your listing has been published successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)/services')
          }
        ]
      );
    } catch (error: any) {
      console.error('Publish error:', error);
      Alert.alert('Error', error.message || 'Failed to publish listing. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to save a draft');
      return;
    }

    setIsSavingDraft(true);

    try {
      // Map form data to database schema
      const listingData = {
        host_id: user.id,
        title: formData.title,
        description: formData.fullDescription || formData.shortDescription,
        listing_type: isExperience ? 'experience' : 'service',
        category: formData.category,
        address: {
          street: '',
          city: formData.location,
          state: '',
          country: '',
          postal_code: ''
        },
        coordinates: '(0,0)', // PostGIS POINT format - default coordinates, should be geocoded from location
        base_price: parseFloat(formData.price) || 0,
        currency: 'USD',
        price_per: isExperience ? 'person' : (formData.rentalType === 'rent' ? 'day' : 'item'),
        max_guests: isExperience ? parseInt(formData.maxGuests || '1') : 1,
        images: formData.images.map((url, index) => ({
          url,
          caption: '',
          order: index
        })), // JSONB format as per schema
        status: 'draft',
        available_from: new Date().toISOString().split('T')[0], // Today
        available_to: null, // No end date for now
        features: isExperience ? {
          duration: formData.duration,
          max_guests: formData.maxGuests
        } : {}
      };

      const { data, error } = await supabase
        .from('listings')
        .insert(listingData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Success
      Alert.alert(
        'Draft Saved',
        'Your listing has been saved as a draft. You can continue editing it later.',
        [
          {
            text: 'Continue Editing',
            onPress: () => {
              // Navigate back to edit screen with the saved draft data
              router.replace({
                pathname: '/listing-details',
                params: {
                  type,
                  data: JSON.stringify({
                    ...formData,
                    id: data.id, // Include the listing ID for future edits
                    status: 'draft'
                  })
                }
              });
            }
          },
          {
            text: 'Go to Services',
            onPress: () => router.replace('/(tabs)/services'),
            style: 'cancel'
          }
        ]
      );
    } catch (error: any) {
      console.error('Save draft error:', error);
      Alert.alert('Error', error.message || 'Failed to save draft. Please try again.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const renderServiceCard = () => (
    <View style={styles.serviceCard}>
      <View style={styles.serviceImageContainer}>
        <Image
          source={{ uri: formData.images[0] || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=200&fit=crop' }}
          style={styles.serviceImage}
        />
        <TouchableOpacity style={styles.favoriteButton}>
          <Heart size={20} color="#FFFFFF" fill="transparent" />
        </TouchableOpacity>
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedText}>✓ Preview</Text>
        </View>
      </View>

      <View style={styles.serviceInfo}>
        <Text style={styles.serviceTitle} numberOfLines={2}>
          {formData.title || 'Your Listing Title'}
        </Text>

        <View style={styles.hostInfo}>
          <View style={styles.hostAvatar}>
            <Text style={styles.hostInitial}>Y</Text>
          </View>
          <Text style={styles.hostName}>You</Text>
        </View>

        <View style={styles.serviceLocation}>
          <MapPin size={14} color="#64748B" />
          <Text style={styles.locationText}>{formData.location || 'Location'}</Text>
        </View>

        {isExperience && (
          <View style={styles.serviceDetails}>
            <View style={styles.serviceDetail}>
              <Clock size={14} color="#64748B" />
              <Text style={styles.detailText}>{formData.duration || 'Duration'}</Text>
            </View>
            <View style={styles.serviceDetail}>
              <Users size={14} color="#64748B" />
              <Text style={styles.detailText}>Up to {formData.maxGuests || 'N'}</Text>
            </View>
          </View>
        )}

        <View style={styles.serviceFooter}>
          <View style={styles.ratingContainer}>
            <Star size={14} color="#FCD34D" fill="#FCD34D" />
            <Text style={styles.rating}>New</Text>
            <Text style={styles.reviews}>(0)</Text>
          </View>
          <Text style={styles.price}>${formData.price || '0'}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft color="#1E293B" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preview Listing</Text>
        <TouchableOpacity
          onPress={handleEdit}
          style={styles.editButton}
        >
          <Edit size={20} color="#0EA5E9" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>How your listing will appear</Text>
          <Text style={styles.sectionSubtitle}>
            This is exactly how travelers will see your {isExperience ? 'experience' : 'gear'} in the app
          </Text>

          <View style={styles.cardContainer}>
            {renderServiceCard()}
          </View>
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Listing Details</Text>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Title</Text>
            <Text style={styles.detailValue}>{formData.title || 'Not provided'}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Description</Text>
            <Text style={styles.detailValue}>
              {formData.shortDescription || 'Not provided'}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Price</Text>
            <Text style={styles.detailValue}>
              ${formData.price || '0'} {isExperience ? 'per person' : formData.rentalType === 'rent' ? 'per day' : ''}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue}>{formData.location || 'Not provided'}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Availability</Text>
            <Text style={styles.detailValue}>{formData.availabilityDates || 'Not provided'}</Text>
          </View>

          {isExperience && (
            <>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Duration</Text>
                <Text style={styles.detailValue}>{formData.duration || 'Not provided'}</Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Max Guests</Text>
                <Text style={styles.detailValue}>{formData.maxGuests || 'Not provided'}</Text>
              </View>
            </>
          )}

          {!isExperience && (
            <>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Category</Text>
                <Text style={styles.detailValue}>
                  {formData.category ? formData.category.charAt(0).toUpperCase() + formData.category.slice(1) : 'Not provided'}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Type</Text>
                <Text style={styles.detailValue}>
                  {formData.rentalType ? formData.rentalType.charAt(0).toUpperCase() + formData.rentalType.slice(1) : 'Not provided'}
                </Text>
              </View>
            </>
          )}

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Photos</Text>
            <Text style={styles.detailValue}>
              {formData.images.length} photo{formData.images.length !== 1 ? 's' : ''} uploaded
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.draftButton, isSavingDraft && styles.draftButtonDisabled]}
          onPress={handleSaveDraft}
          disabled={isSavingDraft}
        >
          <Text style={styles.draftButtonText}>
            {isSavingDraft ? 'Saving...' : 'Save Draft'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.publishButton, isPublishing && styles.publishButtonDisabled]}
          onPress={handlePublish}
          disabled={isPublishing}
        >
          <Text style={styles.publishButtonText}>
            {isPublishing ? 'Publishing...' : 'Publish Listing'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
  },
  editButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  previewSection: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 20,
  },
  cardContainer: {
    alignItems: "center",
  },
  serviceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    width: "100%",
    maxWidth: 350,
  },
  serviceImageContainer: {
    position: "relative",
  },
  serviceImage: {
    width: "100%",
    height: 200,
  },
  favoriteButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  verifiedBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  serviceInfo: {
    padding: 16,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 12,
    lineHeight: 24,
  },
  hostInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  hostAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#0EA5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  hostInitial: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  hostName: {
    fontSize: 14,
    color: "#64748B",
  },
  serviceLocation: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  locationText: {
    fontSize: 14,
    color: "#64748B",
    marginLeft: 4,
  },
  serviceDetails: {
    flexDirection: "row",
    marginBottom: 16,
  },
  serviceDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  detailText: {
    fontSize: 14,
    color: "#64748B",
    marginLeft: 4,
  },
  serviceFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginLeft: 4,
  },
  reviews: {
    fontSize: 14,
    color: "#64748B",
    marginLeft: 4,
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0EA5E9",
  },
  detailsSection: {
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  detailLabel: {
    fontSize: 16,
    color: "#64748B",
  },
  detailValue: {
    fontSize: 16,
    color: "#1E293B",
    flex: 1,
    textAlign: "right",
    marginLeft: 16,
  },
  footer: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    flexDirection: "row",
    gap: 12,
  },
  draftButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  draftButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
  },
  draftButtonDisabled: {
    opacity: 0.6,
  },
  publishButton: {
    flex: 2,
    backgroundColor: "#0EA5E9",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  publishButtonDisabled: {
    opacity: 0.6,
  },
  publishButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});