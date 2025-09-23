import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ActivityFeed } from '@/src/components/social/activity-feed';
import { FAB } from '@/src/components/ui/fab';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleCreatePost = () => {
    router.push('/(modals)/post-composer' as any);
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Social Time</ThemedText>
        <ThemedText style={styles.headerSubtitle}>Connect with fellow travelers</ThemedText>
      </View>

      {/* Social Feed */}
      <ActivityFeed
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      {/* Floating Action Button */}
      <FAB
        onPress={handleCreatePost}
        icon="plus"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 60, // Account for status bar
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 4,
  },
});