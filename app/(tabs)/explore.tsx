import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CityCard, CityData, CountryCard, CountryData, SearchBar } from '@/src/components/explore';
import { useTrendingCities, useTrendingCountries } from '@/src/hooks/queries/explore';

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: countries = [] } = useTrendingCountries();
  const { data: cities = [] } = useTrendingCities();

  const handleSearchSubmit = () => {
    // TODO: Navigate to search results screen
    console.log('Search for:', searchQuery);
  };

  const handleCountryPress = (country: CountryData) => {
    // Navigate to country categories view
    router.push({
      pathname: '/explore/categories',
      params: { category: 'locals', location: country.name }
    });
  };

  const handleCityPress = (city: CityData) => {
    // Navigate to city categories view
    router.push({
      pathname: '/explore/categories',
      params: { category: 'experiences', location: city.name }
    });
  };

  const handlePlanTrip = (city: CityData) => {
    // TODO: Navigate to trip planning
    console.log('Plan trip for:', city.name);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} keyboardDismissMode="on-drag">
          {/* Header */}
          <View style={styles.header}>
            <ThemedText type="title" style={styles.headerTitle}>
              Discover Your Next Adventure
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Explore amazing destinations and connect with locals
            </ThemedText>
          </View>

          {/* Search Bar */}
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmit={handleSearchSubmit}
          />

          {/* Country Destinations Section */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Explore by Country
            </ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
            >
              {countries.map((country) => (
                <CountryCard
                  key={country.id}
                  country={country}
                  onPress={() => handleCountryPress(country)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Trending Cities Section */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Trending Cities
            </ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
            >
              {cities.map((city) => (
                <CityCard
                  key={city.id}
                  city={city}
                  onPress={() => handleCityPress(city)}
                  onPlanTrip={() => handlePlanTrip(city)}
                />
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 20,
    fontWeight: '600',
  },
  horizontalScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
});