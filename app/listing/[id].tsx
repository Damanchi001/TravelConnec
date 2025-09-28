import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Heart, MapPin, Share, Star, Users } from "lucide-react-native";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BookingFlow } from "../../src/components/booking/booking-flow";
import { FormButton } from "../../src/components/forms/form-button";
import { Listing } from "../../src/types/database";

// Mock data - in real app, this would be fetched from API
const FEATURED_SERVICES = [
  {
    id: "1",
    title: "Private Sunrise Tour at Mount Batur",
    host: "Made Sutrisna",
    host_id: "host-1",
    hostAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    location: "Bali, Indonesia",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    rating: 4.9,
    reviews: 127,
    price: 45,
    duration: "6 hours",
    maxGuests: 8,
    category: "tours",
    isVerified: true,
    description: "Experience the breathtaking sunrise at Mount Batur with a private guided tour. We&apos;ll hike to the summit to witness one of Bali&apos;s most spectacular natural phenomena. Includes transportation, guide, breakfast, and all necessary equipment.",
    amenities: ["Transportation", "Guide", "Breakfast", "Equipment"],
    house_rules: ["Arrive 15 minutes early", "Wear comfortable hiking shoes", "Bring warm clothing"],
    listing_type: "experience" as const,
    property_type: null,
    address: { city: "Bali", country: "Indonesia" },
    coordinates: { lat: -8.3405, lng: 115.0920 },
    base_price: 45,
    currency: "USD",
    price_per: "person",
    cleaning_fee: 0,
    service_fee: 5,
    min_nights: 1,
    max_nights: null,
    instant_book: true,
    features: {},
    available_from: null,
    available_to: null,
    blocked_dates: [],
    images: ["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"],
    video_url: null,
    virtual_tour_url: null,
    status: "active" as const,
    views: 245,
    average_rating: 4.9,
    review_count: 127,
    featured: true,
    verified: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    title: "Authentic Thai Cooking Class",
    host: "Siriporn Kittikul",
    host_id: "host-2",
    hostAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    location: "Bangkok, Thailand",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
    rating: 4.8,
    reviews: 89,
    price: 28,
    duration: "3 hours",
    maxGuests: 6,
    category: "food",
    isVerified: true,
    description: "Learn to cook authentic Thai dishes in a traditional setting. Master the art of Thai cuisine with fresh ingredients and traditional techniques. Perfect for food lovers and those wanting to bring home culinary skills.",
    amenities: ["Ingredients included", "Recipe book", "Certificate", "Transportation"],
    house_rules: ["Vegetarian options available", "No outside food", "Photography allowed"],
    listing_type: "experience" as const,
    property_type: null,
    address: { city: "Bangkok", country: "Thailand" },
    coordinates: { lat: 13.7563, lng: 100.5018 },
    base_price: 28,
    currency: "USD",
    price_per: "person",
    cleaning_fee: 0,
    service_fee: 3,
    min_nights: 1,
    max_nights: null,
    instant_book: true,
    features: {},
    available_from: null,
    available_to: null,
    blocked_dates: [],
    images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop"],
    video_url: null,
    virtual_tour_url: null,
    status: "active" as const,
    views: 189,
    average_rating: 4.8,
    review_count: 89,
    featured: true,
    verified: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    title: "Santorini Photography Session",
    host: "Dimitris Papadopoulos",
    host_id: "host-3",
    hostAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    location: "Santorini, Greece",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=300&fit=crop",
    rating: 4.9,
    reviews: 156,
    price: 85,
    duration: "2 hours",
    maxGuests: 2,
    category: "experiences",
    isVerified: true,
    description: "Capture the magic of Santorini&apos;s iconic landscapes with a professional photography session. Visit the best spots at golden hour and learn composition techniques from a local expert.",
    amenities: ["Professional photographer", "Photo editing", "Transportation", "Drinks"],
    house_rules: ["Maximum 2 people", "Weather dependent", "Advance booking required"],
    listing_type: "experience" as const,
    property_type: null,
    address: { city: "Santorini", country: "Greece" },
    coordinates: { lat: 36.3932, lng: 25.4615 },
    base_price: 85,
    currency: "USD",
    price_per: "person",
    cleaning_fee: 0,
    service_fee: 8,
    min_nights: 1,
    max_nights: null,
    instant_book: false,
    features: {},
    available_from: null,
    available_to: null,
    blocked_dates: [],
    images: ["https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=300&fit=crop"],
    video_url: null,
    virtual_tour_url: null,
    status: "active" as const,
    views: 312,
    average_rating: 4.9,
    review_count: 156,
    featured: true,
    verified: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "4",
    title: "Tokyo Street Food Walking Tour",
    host: "Yuki Tanaka",
    host_id: "host-4",
    hostAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    location: "Tokyo, Japan",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop",
    rating: 4.7,
    reviews: 203,
    price: 35,
    duration: "4 hours",
    maxGuests: 10,
    category: "food",
    isVerified: true,
    description: "Discover Tokyo's vibrant street food scene with a local food expert. Visit hidden gems and try authentic Japanese street food from ramen to takoyaki.",
    amenities: ["Local guide", "Tastings included", "Translation service", "Insurance"],
    house_rules: ["Groups up to 10", "Vegetarian options", "Cash only for some vendors"],
    listing_type: "experience" as const,
    property_type: null,
    address: { city: "Tokyo", country: "Japan" },
    coordinates: { lat: 35.6762, lng: 139.6503 },
    base_price: 35,
    currency: "USD",
    price_per: "person",
    cleaning_fee: 0,
    service_fee: 4,
    min_nights: 1,
    max_nights: null,
    instant_book: true,
    features: {},
    available_from: null,
    available_to: null,
    blocked_dates: [],
    images: ["https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop"],
    video_url: null,
    virtual_tour_url: null,
    status: "active" as const,
    views: 445,
    average_rating: 4.7,
    review_count: 203,
    featured: true,
    verified: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Find the listing by ID
  const listing = FEATURED_SERVICES.find(service => service.id === id);

  if (!listing) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft color="#1E293B" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Listing Not Found</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>The listing you&apos;re looking for doesn&apos;t exist.</Text>
          <FormButton
            title="Go Back"
            onPress={() => router.back()}
            buttonStyle={styles.errorButton}
          />
        </View>
      </View>
    );
  }

  const toggleFavorite = () => {
    setFavorites(prev =>
      prev.includes(listing.id)
        ? prev.filter(id => id !== listing.id)
        : [...prev, listing.id]
    );
  };

  const handleBookingComplete = (bookingData: any) => {
    // Navigate back to services screen after booking
    router.replace('/(tabs)/services');
    setShowBookingFlow(false);
  };

  const handleShare = () => {
    // In a real app, implement share functionality
    console.log('Share listing:', listing.title);
  };

  if (showBookingFlow) {
    // Map the listing to match the expected Listing type
    const mappedListing: Listing = {
      ...listing,
      max_guests: listing.maxGuests,
    };

    return (
      <BookingFlow
        listing={mappedListing}
        onBookingComplete={handleBookingComplete}
        onCancel={() => setShowBookingFlow(false)}
      />
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft color="#1E293B" size={24} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={toggleFavorite}
            style={styles.favoriteButton}
          >
            <Heart
              size={24}
              color={favorites.includes(listing.id) ? "#EF4444" : "#64748B"}
              fill={favorites.includes(listing.id) ? "#EF4444" : "transparent"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleShare}
            style={styles.shareButton}
          >
            <Share size={24} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: listing.image }} style={styles.image} />
          {listing.isVerified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verified</Text>
            </View>
          )}
        </View>

        {/* Title and Rating */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{listing.title}</Text>
          <View style={styles.ratingContainer}>
            <Star size={16} color="#FCD34D" fill="#FCD34D" />
            <Text style={styles.rating}>{listing.rating}</Text>
            <Text style={styles.reviews}>({listing.reviews} reviews)</Text>
          </View>
        </View>

        {/* Host Info */}
        <View style={styles.hostSection}>
          <Image source={{ uri: listing.hostAvatar }} style={styles.hostAvatar} />
          <View style={styles.hostInfo}>
            <Text style={styles.hostName}>Hosted by {listing.host}</Text>
            <Text style={styles.hostRole}>Local Expert</Text>
          </View>
        </View>

        {/* Location */}
        <View style={styles.locationSection}>
          <MapPin size={16} color="#64748B" />
          <Text style={styles.locationText}>{listing.location}</Text>
        </View>

        {/* Details */}
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Users size={16} color="#64748B" />
            <Text style={styles.detailText}>Up to {listing.maxGuests} guests</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Duration:</Text>
            <Text style={styles.detailText}>{listing.duration}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Price:</Text>
            <Text style={styles.priceText}>${listing.price} per person</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>About this experience</Text>
          <Text style={styles.description}>{listing.description}</Text>
        </View>

        {/* Amenities */}
        {listing.amenities && listing.amenities.length > 0 && (
          <View style={styles.amenitiesSection}>
            <Text style={styles.sectionTitle}>What&apos;s included</Text>
            <View style={styles.amenitiesList}>
              {listing.amenities.map((amenity, index) => (
                <View key={index} style={styles.amenityItem}>
                  <Text style={styles.amenityText}>• {amenity}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* House Rules */}
        {listing.house_rules && listing.house_rules.length > 0 && (
          <View style={styles.rulesSection}>
            <Text style={styles.sectionTitle}>House rules</Text>
            <View style={styles.rulesList}>
              {listing.house_rules.map((rule, index) => (
                <View key={index} style={styles.ruleItem}>
                  <Text style={styles.ruleText}>• {rule}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Reviews Preview */}
        <View style={styles.reviewsSection}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all {listing.reviews} reviews</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.ratingSummary}>
            <View style={styles.ratingRow}>
              <Star size={20} color="#FCD34D" fill="#FCD34D" />
              <Text style={styles.ratingNumber}>{listing.rating}</Text>
              <Text style={styles.ratingLabel}>out of 5</Text>
            </View>
            <Text style={styles.reviewsCount}>{listing.reviews} reviews</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomContainer}>
        <View style={styles.priceInfo}>
          <Text style={styles.price}>${listing.price}</Text>
          <Text style={styles.priceLabel}>per person</Text>
        </View>
        <FormButton
          title="Book Now"
          onPress={() => setShowBookingFlow(true)}
          buttonStyle={styles.bookButton}
        />
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
  headerSpacer: {
    width: 32,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  favoriteButton: {
    padding: 8,
    marginRight: 8,
  },
  shareButton: {
    padding: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 20,
  },
  errorButton: {
    minWidth: 120,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
    height: 300,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  verifiedBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "#10B981",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  titleSection: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 8,
    lineHeight: 32,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginLeft: 4,
  },
  reviews: {
    fontSize: 16,
    color: "#64748B",
    marginLeft: 4,
  },
  hostSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  hostAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  hostInfo: {
    flex: 1,
  },
  hostName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  hostRole: {
    fontSize: 14,
    color: "#64748B",
  },
  locationSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  locationText: {
    fontSize: 16,
    color: "#64748B",
    marginLeft: 8,
  },
  detailsSection: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1E293B",
    width: 80,
  },
  detailText: {
    fontSize: 16,
    color: "#64748B",
    marginLeft: 8,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0EA5E9",
    marginLeft: 8,
  },
  descriptionSection: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#64748B",
    lineHeight: 24,
  },
  amenitiesSection: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  amenitiesList: {
    gap: 8,
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  amenityText: {
    fontSize: 16,
    color: "#64748B",
  },
  rulesSection: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  rulesList: {
    gap: 8,
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  ruleText: {
    fontSize: 16,
    color: "#64748B",
  },
  reviewsSection: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    marginBottom: 20,
  },
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 16,
    color: "#0EA5E9",
    fontWeight: "500",
  },
  ratingSummary: {
    alignItems: "center",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  ratingNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
    marginLeft: 8,
  },
  ratingLabel: {
    fontSize: 16,
    color: "#64748B",
    marginLeft: 4,
  },
  reviewsCount: {
    fontSize: 16,
    color: "#64748B",
  },
  bottomContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  priceInfo: {
    alignItems: "flex-start",
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
  },
  priceLabel: {
    fontSize: 14,
    color: "#64748B",
  },
  bookButton: {
    minWidth: 120,
  },
});