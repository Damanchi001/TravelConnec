import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
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
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={country.coverImageUrl || country.flagUrl || require('@/assets/images/logo.png')}
          style={styles.image}
          placeholder={require('@/assets/images/logo.png')}
          contentFit="cover"
        />
        <View style={styles.overlay}>
          <ThemedText type="defaultSemiBold" style={styles.overlayName}>
            {country.name}
          </ThemedText>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Ionicons name="location" size={14} color="#138AFE" />
            <ThemedText style={styles.statText}>
              {country.citiesCount} Cities
            </ThemedText>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="people" size={14} color="#138AFE" />
            <ThemedText style={styles.statText}>
              {country.localsCount} Locals
            </ThemedText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 180,
    borderRadius: 16,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 120,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 10,
  },
  overlayName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    padding: 14,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    opacity: 0.8,
  },
});