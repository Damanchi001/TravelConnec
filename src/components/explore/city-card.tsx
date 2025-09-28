import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
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
  const textColor = useThemeColor({}, 'text');

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={city.coverImageUrl || require('@/assets/images/logo.png')}
          style={styles.image}
          placeholder={require('@/assets/images/logo.png')}
          contentFit="cover"
        />
        <View style={styles.overlay}>
          <ThemedText type="defaultSemiBold" style={styles.overlayName}>
            {city.name}
          </ThemedText>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Ionicons name="compass" size={16} color="#138AFE" />
            <ThemedText style={styles.statText}>
              {city.experiencesCount} Experiences
            </ThemedText>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="people" size={16} color="#138AFE" />
            <ThemedText style={styles.statText}>
              {city.localsCount} Locals
            </ThemedText>
          </View>
        </View>
        <TouchableOpacity
          style={styles.planTripButton}
          onPress={onPlanTrip}
        >
          <Ionicons name="airplane" size={16} color="#fff" />
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
    width: 220,
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
    height: 140,
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
    padding: 12,
  },
  overlayName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    padding: 16,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    opacity: 0.8,
  },
  planTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#138AFE',
  },
  planTripText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});