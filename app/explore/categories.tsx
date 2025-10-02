import { ThemedText } from '@/components/themed-text';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoryItemCard, type CategoryItemData } from '../../src/components/explore';

const mockData: Record<string, CategoryItemData[]> = {
  locals: [
    {
      id: '1',
      title: 'Maria Rodriguez',
      description: 'Local guide with 5+ years experience showing hidden gems of Barcelona',
      imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
      rating: 4.8,
      location: 'Barcelona, Spain'
    },
    {
      id: '2',
      title: 'Ahmed Hassan',
      description: 'Cultural expert specializing in traditional Moroccan cuisine and markets',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      rating: 4.9,
      location: 'Marrakech, Morocco'
    },
    {
      id: '3',
      title: 'Yuki Tanaka',
      description: 'Photography guide who knows the best spots for cherry blossoms in Kyoto',
      imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      rating: 4.7,
      location: 'Kyoto, Japan'
    }
  ],
  experiences: [
    {
      id: '1',
      title: 'Private Cooking Class',
      description: 'Learn to make authentic pasta from a local Italian chef in their home kitchen',
      imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
      price: '$85',
      rating: 4.9,
      location: 'Rome, Italy'
    },
    {
      id: '2',
      title: 'Street Art Tour',
      description: 'Explore the vibrant street art scene with a local artist guide',
      imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
      price: '$45',
      rating: 4.6,
      location: 'Berlin, Germany'
    },
    {
      id: '3',
      title: 'Wine Tasting Experience',
      description: 'Visit local vineyards and learn about wine making traditions',
      imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400',
      price: '$120',
      rating: 4.8,
      location: 'Napa Valley, USA'
    }
  ],
  accommodation: [
    {
      id: '1',
      title: 'Traditional Riad Stay',
      description: 'Authentic Moroccan riad with courtyard garden in the medina',
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      price: '$120/night',
      rating: 4.7,
      location: 'Marrakech, Morocco'
    },
    {
      id: '2',
      title: 'Beachfront Villa',
      description: 'Modern villa with ocean views and private pool',
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
      price: '$250/night',
      rating: 4.9,
      location: 'Bali, Indonesia'
    },
    {
      id: '3',
      title: 'Mountain Cabin',
      description: 'Cozy cabin in the Swiss Alps with fireplace and mountain views',
      imageUrl: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=400',
      price: '$180/night',
      rating: 4.8,
      location: 'Zermatt, Switzerland'
    }
  ],
  activities: [
    {
      id: '1',
      title: 'Hiking Adventure',
      description: 'Full day hike through national park with experienced guide',
      imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400',
      price: '$75',
      rating: 4.7,
      location: 'Yosemite, USA'
    },
    {
      id: '2',
      title: 'Scuba Diving',
      description: 'Introductory scuba diving course in crystal clear waters',
      imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
      price: '$150',
      rating: 4.9,
      location: 'Maui, Hawaii'
    },
    {
      id: '3',
      title: 'Photography Workshop',
      description: 'Learn street photography techniques from a professional photographer',
      imageUrl: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400',
      price: '$95',
      rating: 4.6,
      location: 'Tokyo, Japan'
    }
  ]
};

const categories = [
  { key: 'locals', label: 'Locals', icon: '👥' },
  { key: 'experiences', label: 'Experiences', icon: '🎭' },
  { key: 'accommodation', label: 'Accommodation', icon: '🏠' },
  { key: 'activities', label: 'Activities', icon: '⚽' }
];

export default function ExploreCategoriesScreen() {
  const insets = useSafeAreaInsets();
  const { category = 'locals', location } = useLocalSearchParams<{ category: string; location: string }>();
  const [activeTab, setActiveTab] = useState(category);

  const handleBackPress = () => {
    router.back();
  };

  const handleItemPress = (item: CategoryItemData) => {
    // Navigate to item details
    console.log('Item pressed:', item.title);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBackPress}
          style={styles.backButton}
        >
          <ArrowLeft color="#1E293B" size={24} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          {location ? `${location} - ${categories.find(c => c.key === activeTab)?.label}` : categories.find(c => c.key === activeTab)?.label}
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      {/* Subtabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.tabButton,
                activeTab === cat.key && styles.tabButtonActive
              ]}
              onPress={() => setActiveTab(cat.key)}
            >
              <ThemedText style={[
                styles.tabText,
                activeTab === cat.key && styles.tabTextActive
              ]}>
                {cat.icon} {cat.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.itemsContainer}>
          {mockData[activeTab]?.map((item) => (
            <CategoryItemCard
              key={item.id}
              item={item}
              onPress={() => handleItemPress(item)}
            />
          ))}
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
  tabsContainer: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tabsScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#F1F5F9",
  },
  tabButtonActive: {
    backgroundColor: "#138AFE",
  },
  tabText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  itemsContainer: {
    gap: 16,
  },
});