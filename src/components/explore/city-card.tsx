import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export interface CityData {
  id: string;
  name: string;
  coverImageUrl?: string;
  experiencesCount: number;
  localsCount: number;
}

interface CityCardProps {
  city: CityData;
  onPress?: () => void;
  onPlanTrip?: () => void;
}

export const CityCard: React.FC<CityCardProps> = ({ city, onPress, onPlanTrip }) => {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image
          source={city.coverImageUrl || require('@/assets/images/logo.png')}
          style={styles.image}
          placeholder={require('@/assets/images/logo.png')}
          contentFit="cover"
        />
      </View>
      <View style={styles.content}>
        <ThemedText type="defaultSemiBold" style={styles.name}>
          {city.name}
        </ThemedText>
        <View style={styles.stats}>
          <ThemedText style={styles.statText}>
            {city.experiencesCount} Experiences
          </ThemedText>
          <ThemedText style={styles.statText}>
            {city.localsCount} Locals
          </ThemedText>
        </View>
        <TouchableOpacity
          style={[styles.planTripButton, { backgroundColor: tintColor }]}
          onPress={onPlanTrip}
        >
          <ThemedText style={styles.planTripText}>
            Plan a Trip
          </ThemedText>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 200,
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
    height: 120,
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
    marginBottom: 12,
  },
  statText: {
    fontSize: 12,
    opacity: 0.7,
  },
  planTripButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  planTripText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});