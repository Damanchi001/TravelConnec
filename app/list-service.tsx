import { router } from "expo-router";
import { ArrowLeft, Shirt, TreePine } from "lucide-react-native";
import React from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LISTING_TYPES = [
  {
    id: "experience",
    title: "Experience",
    subtitle: "Tours, classes, activities",
    icon: TreePine,
    color: "#8B5CF6",
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop",
    description: "Share your local expertise, culture, and unique experiences with travelers",
  },
  {
    id: "gear",
    title: "Gear",
    subtitle: "Equipment rental",
    icon: Shirt,
    color: "#F97316",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop",
    description: "Rent out your travel gear, camping equipment, or specialty items",
  },
];

export default function ListServiceScreen() {
  const insets = useSafeAreaInsets();

  const handleSelectType = (typeId: string) => {
    router.push(`/listing-details?type=${typeId}`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft color="#1E293B" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Listing</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>What would you like to list?</Text>
          <Text style={styles.heroSubtitle}>
            Choose the type of service you want to offer to travelers
          </Text>
        </View>

        <View style={styles.typesContainer}>
          {LISTING_TYPES.map((type) => {
            const IconComponent = type.icon;
            return (
              <TouchableOpacity
                key={type.id}
                style={styles.typeCard}
                onPress={() => handleSelectType(type.id)}
              >
                <View style={styles.typeImageContainer}>
                  <Image source={{ uri: type.image }} style={styles.typeImage} />
                  <View style={[styles.typeIconContainer, { backgroundColor: type.color }]}>
                    <IconComponent color="#FFFFFF" size={24} />
                  </View>
                </View>

                <View style={styles.typeContent}>
                  <Text style={styles.typeTitle}>{type.title}</Text>
                  <Text style={styles.typeSubtitle}>{type.subtitle}</Text>
                  <Text style={styles.typeDescription}>{type.description}</Text>
                </View>

                <View style={styles.typeArrow}>
                  <Text style={styles.arrowText}>→</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Ready to get started?</Text>
          <Text style={styles.infoText}>
            • Fill in your listing details
            • Add photos to showcase your offering
            • Set your pricing and availability
            • Preview and publish your listing
          </Text>
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
  content: {
    flex: 1,
  },
  heroSection: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#64748B",
    lineHeight: 24,
  },
  typesContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  typeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  typeImageContainer: {
    position: "relative",
    marginRight: 16,
  },
  typeImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  typeIconContainer: {
    position: "absolute",
    bottom: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  typeContent: {
    flex: 1,
  },
  typeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  typeSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 8,
  },
  typeDescription: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },
  typeArrow: {
    marginLeft: 16,
  },
  arrowText: {
    fontSize: 24,
    color: "#CBD5E1",
  },
  infoSection: {
    backgroundColor: "#FFFFFF",
    margin: 20,
    padding: 20,
    borderRadius: 16,
    marginBottom: 40,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 22,
  },
});