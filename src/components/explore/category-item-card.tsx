import { ThemedText } from '@/components/themed-text';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export interface CategoryItemData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price?: string;
  rating?: number;
  location?: string;
}

interface CategoryItemCardProps {
  item: CategoryItemData;
  onPress?: () => void;
}

export const CategoryItemCard: React.FC<CategoryItemCardProps> = ({ item, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
      <View style={styles.itemContent}>
        <ThemedText type="defaultSemiBold" style={styles.itemTitle}>
          {item.title}
        </ThemedText>
        <ThemedText style={styles.itemDescription} numberOfLines={2}>
          {item.description}
        </ThemedText>
        <View style={styles.itemFooter}>
          {item.price && (
            <ThemedText type="defaultSemiBold" style={styles.itemPrice}>
              {item.price}
            </ThemedText>
          )}
          {item.rating && (
            <View style={styles.ratingContainer}>
              <ThemedText style={styles.ratingText}>⭐ {item.rating}</ThemedText>
            </View>
          )}
        </View>
        {item.location && (
          <ThemedText style={styles.itemLocation}>
            📍 {item.location}
          </ThemedText>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  itemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  itemImage: {
    width: "100%",
    height: 200,
  },
  itemContent: {
    padding: 16,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
    marginBottom: 12,
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    color: "#138AFE",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    color: "#64748B",
  },
  itemLocation: {
    fontSize: 12,
    color: "#64748B",
  },
});