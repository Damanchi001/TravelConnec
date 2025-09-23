import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export interface CountryData {
  id: string;
  name: string;
  flagUrl?: string;
  coverImageUrl?: string;
  citiesCount: number;
  localsCount: number;
}

interface CountryCardProps {
  country: CountryData;
  onPress?: () => void;
}

export const CountryCard: React.FC<CountryCardProps> = ({ country, onPress }) => {
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image
          source={country.coverImageUrl || country.flagUrl || require('@/assets/images/logo.png')}
          style={styles.image}
          placeholder={require('@/assets/images/logo.png')}
          contentFit="cover"
        />
      </View>
      <View style={styles.content}>
        <ThemedText type="defaultSemiBold" style={styles.name}>
          {country.name}
        </ThemedText>
        <View style={styles.stats}>
          <ThemedText style={styles.statText}>
            {country.citiesCount} Cities
          </ThemedText>
          <ThemedText style={styles.statText}>
            {country.localsCount} Locals
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 160,
    borderRadius: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 100,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    marginBottom: 8,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: 12,
    opacity: 0.7,
  },
});