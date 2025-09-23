import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuthStore } from '@/src/stores/auth-store';
import { useSubscriptionStore } from '@/src/stores/subscription-store';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, signOut } = useAuthStore();
  const { status } = useSubscriptionStore();

  const isEntrepreneur = status.tier === 'entrepreneur';

  const handleEditProfile = () => {
    // TODO: Navigate to edit profile screen
    // router.push('/profile/edit');
    Alert.alert('Edit Profile', 'Edit profile functionality coming soon!');
  };

  const handleSettingsPress = () => {
    // TODO: Navigate to settings
    // router.push('/settings');
    Alert.alert('Settings', 'Settings screen coming soon!');
  };

  const handleStorefrontPress = () => {
    // TODO: Navigate to storefront
    // router.push('/storefront');
    Alert.alert('Storefront', 'Storefront management coming soon!');
  };

  const handleAddListingPress = () => {
    // TODO: Navigate to create listing
    // router.push('/listing/create');
    Alert.alert('Add Listing', 'Create listing functionality coming soon!');
  };

  const handleEarningsPress = () => {
    // TODO: Navigate to earnings dashboard
    // router.push('/earnings');
    Alert.alert('Earnings', 'Earnings dashboard coming soon!');
  };

  const handleVerifiedLocalPress = () => {
    // TODO: Navigate to verification details
    // router.push('/verification');
    Alert.alert('Verification', 'Verification details coming soon!');
  };

  const handleBoostListingsPress = () => {
    // TODO: Navigate to promotion options
    // router.push('/promotions');
    Alert.alert('Boost Listings', 'Promotion options coming soon!');
  };

  const handleWorkWithUsPress = () => {
    // TODO: Navigate to campaigns
    // router.push('/campaigns');
    Alert.alert('Work with Us', 'Campaign details coming soon!');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/sign-in' as any);
          },
        },
      ]
    );
  };

  const getTierBadgeText = () => {
    switch (status.tier) {
      case 'social':
        return 'Social';
      case 'traveler':
        return 'Traveler';
      case 'entrepreneur':
        return 'Entrepreneur';
      default:
        return 'Social';
    }
  };

  const getTierBadgeStyle = () => {
    switch (status.tier) {
      case 'social':
        return styles.socialBadge;
      case 'traveler':
        return styles.travelerBadge;
      case 'entrepreneur':
        return styles.entrepreneurBadge;
      default:
        return styles.socialBadge;
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <Image
            source={
              profile?.avatar_url
                ? { uri: profile.avatar_url }
                : require('@/assets/images/icon.png')
            }
            style={styles.profileImage}
          />
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <ThemedText style={styles.username}>
                {profile?.first_name} {profile?.last_name}
              </ThemedText>
              <View style={[styles.tierBadge, getTierBadgeStyle()]}>
                <ThemedText style={styles.tierBadgeText}>
                  {getTierBadgeText()}
                </ThemedText>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <ThemedText style={styles.editButtonText}>Edit</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Entrepreneur Business Features */}
        {isEntrepreneur && (
          <>
            {/* My Storefront */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>My Storefront</ThemedText>
              <TouchableOpacity style={styles.card} onPress={handleStorefrontPress}>
                <ThemedText style={styles.cardTitle}>Service Listings</ThemedText>
                <ThemedText style={styles.cardSubtitle}>
                  Manage your tours, experiences, and services
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddListingPress}
              >
                <ThemedText style={styles.addButtonText}>+ Add New Listing</ThemedText>
              </TouchableOpacity>
            </View>

            {/* Bookings & Payouts */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Bookings & Payouts</ThemedText>
              <TouchableOpacity style={styles.card} onPress={handleEarningsPress}>
                <ThemedText style={styles.cardTitle}>View Earnings Dashboard</ThemedText>
                <ThemedText style={styles.cardSubtitle}>
                  Track bookings, payouts, and insights
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Verified Local */}
            <View style={styles.section}>
              <TouchableOpacity style={styles.verifiedCard} onPress={handleVerifiedLocalPress}>
                <ThemedText style={styles.verifiedText}>✅ Verified Local</ThemedText>
                <ThemedText style={styles.verifiedSubtitle}>
                  Your local expertise is verified
                </ThemedText>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* General Profile Sections */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>My Trips</ThemedText>
          {/* TODO: Render trip cards */}
          <ThemedText style={styles.placeholderText}>No trips yet</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>My Groups</ThemedText>
          {/* TODO: Render group cards */}
          <ThemedText style={styles.placeholderText}>No groups yet</ThemedText>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.settingsCard} onPress={handleSettingsPress}>
            <ThemedText style={styles.cardTitle}>Settings</ThemedText>
            <ThemedText style={styles.cardSubtitle}>
              Notifications, privacy, and preferences
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Entrepreneur Promotional Tools */}
        {isEntrepreneur && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Promotional Tools</ThemedText>
            <TouchableOpacity
              style={styles.promotionButton}
              onPress={handleBoostListingsPress}
            >
              <ThemedText style={styles.promotionButtonText}>Boost My Listings</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.promotionButton}
              onPress={handleWorkWithUsPress}
            >
              <ThemedText style={styles.promotionButtonText}>Work with Us</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* Logout */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <ThemedText style={styles.logoutText}>Logout</ThemedText>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingTop: 60, // Account for status bar
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 12,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  socialBadge: {
    backgroundColor: '#6B7280',
  },
  travelerBadge: {
    backgroundColor: '#3B82F6',
  },
  entrepreneurBadge: {
    backgroundColor: '#F59E0B',
  },
  tierBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  bio: {
    fontSize: 16,
    color: '#6B7280',
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  verifiedCard: {
    backgroundColor: '#ECFDF5',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  verifiedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 4,
  },
  verifiedSubtitle: {
    fontSize: 14,
    color: '#047857',
  },
  settingsCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  placeholderText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontStyle: 'italic',
    padding: 20,
  },
  promotionButton: {
    backgroundColor: '#F59E0B',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  promotionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutSection: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  logoutIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  logoutText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
  },
});