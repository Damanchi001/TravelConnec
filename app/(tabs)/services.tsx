import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Clock, Filter, Heart, MapPin, Plus, Star, User, Users } from "lucide-react-native";
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
import { FeatureGate } from "../../src/components/subscription/FeatureGate";

const SERVICE_CATEGORIES = [
  { id: "all", name: "All", color: "#0EA5E9" },
  { id: "experiences", name: "Experiences", color: "#8B5CF6" },
  { id: "travel-gear", name: "Travel Gear", color: "#F97316" },
];

const FEATURED_SERVICES = [
  {
    id: "1",
    title: "Private Sunrise Tour at Mount Batur",
    host: "Made Sutrisna",
    hostAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    location: "Bali, Indonesia",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop",
    rating: 4.9,
    reviews: 127,
    price: 45,
    duration: "6 hours",
    maxGuests: 8,
    category: "tours",
    isVerified: true,
  },
  {
    id: "2",
    title: "Authentic Thai Cooking Class",
    host: "Siriporn Kittikul",
    hostAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    location: "Bangkok, Thailand",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop",
    rating: 4.8,
    reviews: 89,
    price: 28,
    duration: "3 hours",
    maxGuests: 6,
    category: "food",
    isVerified: true,
  },
  {
    id: "3",
    title: "Santorini Photography Session",
    host: "Dimitris Papadopoulos",
    hostAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    location: "Santorini, Greece",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=300&h=200&fit=crop",
    rating: 4.9,
    reviews: 156,
    price: 85,
    duration: "2 hours",
    maxGuests: 2,
    category: "experiences",
    isVerified: true,
  },
  {
    id: "4",
    title: "Tokyo Street Food Walking Tour",
    host: "Yuki Tanaka",
    hostAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    location: "Tokyo, Japan",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300&h=200&fit=crop",
    rating: 4.7,
    reviews: 203,
    price: 35,
    duration: "4 hours",
    maxGuests: 10,
    category: "food",
    isVerified: true,
  },
];

export default function ServicesScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [favorites, setFavorites] = useState<string[]>([]);

  const filteredServices = selectedCategory === "all" 
    ? FEATURED_SERVICES 
    : FEATURED_SERVICES.filter(service => service.category === selectedCategory);

  const toggleFavorite = (serviceId: string) => {
    setFavorites(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const renderService = (service: typeof FEATURED_SERVICES[0]) => (
    <TouchableOpacity 
      key={service.id} 
      style={styles.serviceCard}
      onPress={() => router.push(`/listing/${service.id}`)}
    >
      <View style={styles.serviceImageContainer}>
        <Image source={{ uri: service.image }} style={styles.serviceImage} />
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(service.id)}
        >
          <Heart 
            size={20} 
            color={favorites.includes(service.id) ? "#EF4444" : "#FFFFFF"} 
            fill={favorites.includes(service.id) ? "#EF4444" : "transparent"}
          />
        </TouchableOpacity>
        {service.isVerified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Verified</Text>
          </View>
        )}
      </View>
      
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceTitle} numberOfLines={2}>
          {service.title}
        </Text>
        
        <View style={styles.hostInfo}>
          <Image source={{ uri: service.hostAvatar }} style={styles.hostAvatar} />
          <Text style={styles.hostName}>Hosted by {service.host}</Text>
        </View>
        
        <View style={styles.serviceLocation}>
          <MapPin size={14} color="#64748B" />
          <Text style={styles.locationText}>{service.location}</Text>
        </View>
        
        <View style={styles.serviceDetails}>
          <View style={styles.serviceDetail}>
            <Clock size={14} color="#64748B" />
            <Text style={styles.detailText}>{service.duration}</Text>
          </View>
          <View style={styles.serviceDetail}>
            <Users size={14} color="#64748B" />
            <Text style={styles.detailText}>Up to {service.maxGuests}</Text>
          </View>
        </View>
        
        <View style={styles.serviceFooter}>
          <View style={styles.ratingContainer}>
            <Star size={14} color="#FCD34D" fill="#FCD34D" />
            <Text style={styles.rating}>{service.rating}</Text>
            <Text style={styles.reviews}>({service.reviews})</Text>
          </View>
          <Text style={styles.price}>${service.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={["#0EA5E9", "#0284C7"]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Services</Text>
        <View style={styles.headerButtons}>
          <FeatureGate
            feature="create_paid_listings"
            requiredTier="entrepreneur"
          >
            <TouchableOpacity
              onPress={() => router.push("/list-service")}
              style={styles.listServiceButton}
            >
              <Plus color="#FFFFFF" size={24} />
            </TouchableOpacity>
          </FeatureGate>
          <TouchableOpacity
            onPress={() => router.push("/profile")}
            style={styles.profileButton}
          >
            <User color="#FFFFFF" size={24} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.categoriesSection}>
          <View style={styles.categoriesHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity>
              <Filter size={20} color="#64748B" />
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoriesContainer}>
              {SERVICE_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.id && {
                      backgroundColor: category.color,
                    },
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category.id && styles.categoryTextActive,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === "all" ? "Featured Services" : `${SERVICE_CATEGORIES.find(c => c.id === selectedCategory)?.name} Services`}
          </Text>
          <Text style={styles.resultsCount}>
            {filteredServices.length} services available
          </Text>
          
          <View style={styles.servicesGrid}>
            {filteredServices.map(renderService)}
          </View>
        </View>
      </ScrollView>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  listServiceButton: {
    padding: 4,
    marginRight: 8,
  },
  profileButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  categoriesSection: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  categoriesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
  },
  categoriesContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    marginRight: 12,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
  },
  categoryTextActive: {
    color: "#FFFFFF",
  },
  servicesSection: {
    padding: 20,
  },
  resultsCount: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 20,
  },
  servicesGrid: {
    gap: 16,
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
    marginRight: 8,
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
});