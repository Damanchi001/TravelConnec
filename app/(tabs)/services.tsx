import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol, IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FlatList, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

interface ServiceCategory {
  id: string;
  title: string;
  icon: IconSymbolName;
  description: string;
  count: number;
}

interface ServiceItem {
  id: string;
  title: string;
  host: string;
  rating: number;
  price: string;
  image: string;
  category: string;
}

const serviceCategories: ServiceCategory[] = [
  {
    id: 'tours',
    title: 'Guided Tours',
    icon: 'map.fill',
    description: 'Explore destinations with local experts',
    count: 24,
  },
  {
    id: 'experiences',
    title: 'Unique Experiences',
    icon: 'sparkles',
    description: 'One-of-a-kind activities and adventures',
    count: 18,
  },
  {
    id: 'classes',
    title: 'Classes & Workshops',
    icon: 'book.fill',
    description: 'Learn new skills from local artisans',
    count: 12,
  },
  {
    id: 'food',
    title: 'Food & Cooking',
    icon: 'fork.knife',
    description: 'Culinary experiences and dining',
    count: 15,
  },
  {
    id: 'adventure',
    title: 'Adventure',
    icon: 'figure.climbing',
    description: 'Thrilling outdoor activities',
    count: 9,
  },
  {
    id: 'wellness',
    title: 'Wellness',
    icon: 'heart.fill',
    description: 'Relaxation and rejuvenation',
    count: 7,
  },
];

const featuredServices: ServiceItem[] = [
  {
    id: '1',
    title: 'Private City Walking Tour',
    host: 'Maria Rodriguez',
    rating: 4.9,
    price: '$45',
    image: '🏙️',
    category: 'tours',
  },
  {
    id: '2',
    title: 'Traditional Cooking Class',
    host: 'Chef Ahmed',
    rating: 4.8,
    price: '$65',
    image: '👨‍🍳',
    category: 'food',
  },
  {
    id: '3',
    title: 'Sunset Yoga Session',
    host: 'Yoga Master Priya',
    rating: 4.7,
    price: '$25',
    image: '🧘‍♀️',
    category: 'wellness',
  },
];

export default function ServicesScreen() {
  const colorScheme = useColorScheme();

  const renderCategory = ({ item }: { item: ServiceCategory }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        { backgroundColor: Colors[colorScheme ?? 'light'].background },
      ]}
      onPress={() => {
        // Navigate to category-specific services
        console.log(`Navigate to ${item.id} services`);
      }}>
      <ThemedView style={styles.categoryIcon}>
        <IconSymbol name={item.icon} size={32} color={Colors[colorScheme ?? 'light'].tint} />
      </ThemedView>
      <ThemedText type="subtitle" style={styles.categoryTitle}>
        {item.title}
      </ThemedText>
      <ThemedText style={styles.categoryDescription}>
        {item.description}
      </ThemedText>
      <ThemedText style={styles.categoryCount}>
        {item.count} services
      </ThemedText>
    </TouchableOpacity>
  );

  const renderServiceItem = ({ item }: { item: ServiceItem }) => (
    <TouchableOpacity
      style={[
        styles.serviceCard,
        { backgroundColor: Colors[colorScheme ?? 'light'].background },
      ]}
      onPress={() => {
        // Navigate to service details
        console.log(`Navigate to service ${item.id}`);
      }}>
      <ThemedText style={styles.serviceImage}>{item.image}</ThemedText>
      <ThemedView style={styles.serviceContent}>
        <ThemedText type="subtitle" style={styles.serviceTitle} numberOfLines={2}>
          {item.title}
        </ThemedText>
        <ThemedText style={styles.serviceHost}>by {item.host}</ThemedText>
        <ThemedView style={styles.serviceFooter}>
          <ThemedView style={styles.ratingContainer}>
            <IconSymbol name="star.fill" size={14} color="#FFD700" />
            <ThemedText style={styles.rating}>{item.rating}</ThemedText>
          </ThemedView>
          <ThemedText type="subtitle" style={styles.price}>
            {item.price}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Travel Services
        </ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Discover unique experiences and activities
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Categories
        </ThemedText>
        <FlatList
          data={serviceCategories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Featured Services
        </ThemedText>
        <FlatList
          data={featuredServices}
          renderItem={renderServiceItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.servicesList}
        />
      </ThemedView>

      <ThemedView style={styles.section}>
        <TouchableOpacity
          style={[
            styles.exploreButton,
            { backgroundColor: Colors[colorScheme ?? 'light'].tint },
          ]}
          onPress={() => {
            // Navigate to full services list
            console.log('Navigate to all services');
          }}>
          <ThemedText style={styles.exploreButtonText}>
            Explore All Services
          </ThemedText>
          <IconSymbol name="arrow.right" size={20} color="white" />
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    marginBottom: 8,
  },
  headerSubtitle: {
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoriesList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryCard: {
    width: 160,
    padding: 16,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 122, 164, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryDescription: {
    textAlign: 'center',
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8,
  },
  categoryCount: {
    opacity: 0.6,
  },
  servicesList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  serviceCard: {
    width: 280,
    padding: 16,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
  },
  serviceImage: {
    fontSize: 40,
    marginRight: 12,
    alignSelf: 'center',
  },
  serviceContent: {
    flex: 1,
  },
  serviceTitle: {
    marginBottom: 4,
  },
  serviceHost: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    marginLeft: 4,
  },
  price: {
    color: '#0a7ea4',
  },
  exploreButton: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});