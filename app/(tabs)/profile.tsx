import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Award,
  Calendar,
  Camera,
  Edit3,
  MapPin,
  MessageCircle,
  Settings,
  Share,
  Star
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BookingCard, BookingFilters } from "../../src/components/booking";
import { useBookings } from "../../src/hooks/useBookings";
import { useAuthStore } from "../../src/stores/auth-store";
import { useSubscriptionStore } from "../../src/stores/subscription-store";

const { width: screenWidth } = Dimensions.get("window");

type BookingTab = 'upcoming' | 'past';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("posts");
  const [bookingTab, setBookingTab] = useState<BookingTab>('upcoming');
  const [filters, setFilters] = useState({
    status: 'all' as 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled',
    sortBy: 'check_in' as 'check_in' | 'created_at' | 'total_amount',
    sortOrder: 'desc' as 'asc' | 'desc',
  });
  const { profile, signOut } = useAuthStore();
  const { status } = useSubscriptionStore();

  const { bookings, loading, error, refetch } = useBookings({
    userId: profile?.id,
    userRole: 'guest',
    ...filters,
  });

  const filteredBookings = useMemo(() => {
    const now = new Date();
    return bookings.filter(booking => {
      const isUpcoming = new Date(booking.check_in) >= now;
      const matchesTab = bookingTab === 'upcoming' ? isUpcoming : !isUpcoming;

      if (filters.status !== 'all') {
        return matchesTab && booking.status === filters.status;
      }

      return matchesTab;
    });
  }, [bookings, bookingTab, filters.status]);

  const sortedBookings = useMemo(() => {
    return [...filteredBookings].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'check_in':
          aValue = new Date(a.check_in);
          bValue = new Date(b.check_in);
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'total_amount':
          aValue = a.total_amount;
          bValue = b.total_amount;
          break;
        default:
          return 0;
      }

      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredBookings, filters.sortBy, filters.sortOrder]);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleBackPress = () => {
    router.back();
  };

  const handleEditProfile = () => {
    router.push("/(modals)/edit-profile" as any);
  };

  const handleSettings = () => {
    router.push("/(modals)/settings" as any);
  };

  const handleMessage = () => {
    console.log("Message pressed");
  };

  const handleShare = () => {
    console.log("Share profile pressed");
  };

  const handleFollowersPress = () => {
    router.push('/followers-following?initialTab=followers' as any);
  };

  const handleFollowingPress = () => {
    router.push('/followers-following?initialTab=following' as any);
  };

  const handleTripPress = (trip: any) => {
    console.log("Trip pressed:", trip.destination);
  };

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
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
            console.log('[Profile] Starting logout process');
            try {
              await signOut();
              console.log('[Profile] signOut completed, showing success message');
              Alert.alert(
                'Logged Out',
                'You have been successfully logged out.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      console.log('[Profile] Redirecting to welcome page');
                      router.replace('/welcome' as any);
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('[Profile] Error during logout:', error);
              Alert.alert(
                'Logout Error',
                'There was a problem logging out. You may need to check your internet connection.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  // Get user data from profile
  const userData = {
    name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'User',
    username: profile?.username || `@${profile?.first_name?.toLowerCase() || 'user'}`,
    bio: profile?.bio || "Digital nomad exploring the world ✈️",
    profileImage: profile?.avatar_url || "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face",
    coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop",
    location: profile?.location?.city ? `${profile?.location.city}, ${profile?.location.country}` : "Location not set",
    joinDate: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : "Recently",
    membershipTier: status.tier === 'entrepreneur' ? 'Entrepreneur' : status.tier === 'traveler' ? 'Traveler' : 'Social',
    verified: profile?.is_verified || false,
    stats: {
      posts: 0, // TODO: Get from database
      followers: 0, // TODO: Get from database
      following: 0, // TODO: Get from database
      countriesVisited: profile?.preferences?.countriesVisited?.length || 0,
    },
    badges: [
      { id: 1, name: "Explorer", icon: "🗺️", description: `Visited ${profile?.preferences?.countriesVisited?.length || 0} countries` },
      { id: 2, name: "Photographer", icon: "📸", description: "Travel photographer" },
      { id: 3, name: "Community Builder", icon: "👥", description: "Active traveler" },
    ],
    interests: profile?.preferences?.interests || [],
    recentTrips: [], // TODO: Get from database
  };

  const renderStatsCard = () => (
    <View style={styles.statsCard}>
      <TouchableOpacity style={styles.statItem}>
        <Text style={styles.statNumber}>{userData.stats.posts}</Text>
        <Text style={styles.statLabel}>Posts</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.statItem} onPress={handleFollowersPress}>
        <Text style={styles.statNumber}>{userData.stats.followers.toLocaleString()}</Text>
        <Text style={styles.statLabel}>Followers</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.statItem} onPress={handleFollowingPress}>
        <Text style={styles.statNumber}>{userData.stats.following}</Text>
        <Text style={styles.statLabel}>Following</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.statItem}>
        <Text style={styles.statNumber}>{userData.stats.countriesVisited}</Text>
        <Text style={styles.statLabel}>Countries</Text>
      </TouchableOpacity>
    </View>
  );

  const renderBadges = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Achievements</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.badgesContent}
      >
        {userData.badges.map((badge) => (
          <View key={badge.id} style={styles.badgeCard}>
            <Text style={styles.badgeIcon}>{badge.icon}</Text>
            <Text style={styles.badgeName}>{badge.name}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderInterests = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Travel Interests</Text>
      <View style={styles.interestsContainer}>
        {userData.interests.map((interest: string, index: number) => (
          <View key={index} style={styles.interestChip}>
            <Text style={styles.interestText}>{interest}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderRecentTrips = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Trips</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tripsContent}
      >
        {userData.recentTrips.length > 0 ? userData.recentTrips.map((trip: any) => (
          <TouchableOpacity
            key={trip.id}
            style={styles.tripCard}
            onPress={() => handleTripPress(trip)}
          >
            <Image
              source={{ uri: trip.image }}
              style={styles.tripImage}
              contentFit="cover"
            />
            <View style={styles.tripInfo}>
              <Text style={styles.tripDestination}>{trip.destination}</Text>
              <Text style={styles.tripDate}>{trip.date}</Text>
              <View style={styles.tripRating}>
                {[...Array(trip.rating)].map((_, i) => (
                  <Star key={i} size={12} color="#138AFE" fill="#138AFE" />
                ))}
              </View>
            </View>
          </TouchableOpacity>
        )) : (
          <View style={styles.emptyTripCard}>
            <Text style={styles.emptyTripText}>No trips yet</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "posts":
        return (
          <View style={styles.tabContent}>
            <Text style={styles.emptyStateText}>No posts yet</Text>
            <Text style={styles.emptyStateSubtext}>Share your travel experiences!</Text>
          </View>
        );
      case "bookings":
        return (
          <View style={styles.tabContent}>
            <View style={styles.bookingTabContainer}>
              <TouchableOpacity
                style={[styles.bookingTab, bookingTab === 'upcoming' && styles.activeBookingTab]}
                onPress={() => setBookingTab('upcoming')}
              >
                <Text style={[styles.bookingTabText, bookingTab === 'upcoming' && styles.activeBookingTabText]}>
                  Upcoming
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.bookingTab, bookingTab === 'past' && styles.activeBookingTab]}
                onPress={() => setBookingTab('past')}
              >
                <Text style={[styles.bookingTabText, bookingTab === 'past' && styles.activeBookingTabText]}>
                  Past
                </Text>
              </TouchableOpacity>
            </View>

            <BookingFilters
              filters={filters}
              onFiltersChange={setFilters}
              showStatusFilter={true}
            />

            <ScrollView
              style={styles.bookingScrollView}
              refreshControl={
                <RefreshControl refreshing={loading} onRefresh={refetch} />
              }
              showsVerticalScrollIndicator={false}
            >
              {sortedBookings.length === 0 ? (
                <View style={styles.emptyBookingContainer}>
                  <Text style={styles.emptyBookingTitle}>
                    {bookingTab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
                  </Text>
                  <Text style={styles.emptyBookingText}>
                    {bookingTab === 'upcoming'
                      ? 'When you book a trip, it will appear here.'
                      : 'Your completed bookings will appear here.'
                    }
                  </Text>
                </View>
              ) : (
                <View style={styles.bookingsList}>
                  {sortedBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      userRole="guest"
                      onPress={() => router.push(`/booking/${booking.id}/details` as any)}
                      onMessageHost={() => router.push(`/chat/${booking.id}` as any)}
                    />
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        );
      case "reviews":
        return (
          <View style={styles.tabContent}>
            <Text style={styles.emptyStateText}>No reviews yet</Text>
            <Text style={styles.emptyStateSubtext}>Share your experiences with others!</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 40 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover Image & Header */}
        <View style={styles.coverContainer}>
          <Image
            source={{ uri: userData.coverImage }}
            style={styles.coverImage}
            contentFit="cover"
          />

          {/* Header Overlay */}
          <View style={[styles.headerOverlay, { paddingTop: insets.top + 16 }]}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
                <Share size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton} onPress={handleSettings}>
                <Settings size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile Image */}
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: userData.profileImage }}
              style={styles.profileImage}
              contentFit="cover"
            />
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={16} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{userData.name}</Text>
            {userData.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedIcon}>✓</Text>
              </View>
            )}
          </View>

          <Text style={styles.username}>{userData.username}</Text>

          <View style={styles.membershipContainer}>
            <Award size={14} color="#138AFE" />
            <Text style={styles.membershipText}>{userData.membershipTier} Member</Text>
          </View>

          <Text style={styles.bio}>{userData.bio}</Text>

          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <MapPin size={14} color="#666" />
              <Text style={styles.metaText}>{userData.location}</Text>
            </View>
            <View style={styles.metaItem}>
              <Calendar size={14} color="#666" />
              <Text style={styles.metaText}>Joined {userData.joinDate}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
              <Edit3 size={16} color="#000" />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
              <MessageCircle size={16} color="white" />
            </TouchableOpacity>
          </View>

          {/* Host Dashboard Button */}
          {(profile?.user_type === 'host' || profile?.user_type === 'both') && (
            <View style={styles.hostSection}>
              <TouchableOpacity
                style={styles.hostButton}
                onPress={() => router.push('/(host)/listings/index' as any)}
              >
                <Text style={styles.hostButtonText}>Host Dashboard</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Stats */}
        {renderStatsCard()}

        {/* Badges */}
        {renderBadges()}

        {/* Interests */}
        {renderInterests()}

        {/* Recent Trips */}
        {renderRecentTrips()}

        {/* Content Tabs */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabsHeader}>
            {["posts", "bookings", "reviews"].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  activeTab === tab && styles.activeTab
                ]}
                onPress={() => handleTabPress(tab)}
              >
                <Text style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText
                ]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {renderTabContent()}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  coverContainer: {
    position: "relative",
    height: 200,
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImageContainer: {
    position: "absolute",
    bottom: -40,
    left: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#138AFE",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  profileInfo: {
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 24,
    color: "#000",
    marginRight: 8,
  },
  verifiedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#138AFE",
    justifyContent: "center",
    alignItems: "center",
  },
  verifiedIcon: {
    fontSize: 12,
    color: "#000",
    fontWeight: "bold",
  },
  username: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  membershipContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  membershipText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    color: "#138AFE",
    marginLeft: 6,
  },
  bio: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    color: "#000",
    lineHeight: 22,
    marginBottom: 16,
  },
  metaInfo: {
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  metaText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#138AFE",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  editButtonText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
    color: "#000",
    marginLeft: 8,
  },
  messageButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 16,
    paddingVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 20,
    color: "#000",
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#666",
  },
  section: {
    marginHorizontal: 20,
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 18,
    color: "#000",
  },
  viewAllText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    color: "#138AFE",
  },
  badgesContent: {
    paddingRight: 20,
  },
  badgeCard: {
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginRight: 12,
    minWidth: 80,
  },
  badgeIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  badgeName: {
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
    color: "#000",
    textAlign: "center",
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  interestChip: {
    backgroundColor: "#F8F9FA",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  interestText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#000",
  },
  tripsContent: {
    paddingRight: 20,
  },
  tripCard: {
    width: 140,
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tripImage: {
    width: "100%",
    height: 100,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  tripInfo: {
    padding: 12,
  },
  tripDestination: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: "#000",
    marginBottom: 4,
    lineHeight: 18,
  },
  tripDate: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  tripRating: {
    flexDirection: "row",
    gap: 2,
  },
  emptyTripCard: {
    width: 140,
    height: 140,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  emptyTripText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  tabsContainer: {
    marginTop: 32,
  },
  tabsHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#138AFE",
  },
  tabText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
    color: "#666",
  },
  activeTabText: {
    color: "#000",
  },
  tabContent: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 18,
    color: "#000",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  logoutSection: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: "center",
  },
  logoutButton: {
    padding: 12,
  },
  logoutText: {
    fontSize: 16,
    color: "#EF4444",
    fontWeight: "600",
  },
  bookingTabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 4,
  },
  bookingTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeBookingTab: {
    backgroundColor: '#138AFE',
  },
  bookingTabText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: '#666',
  },
  activeBookingTabText: {
    color: '#FFFFFF',
  },
  bookingScrollView: {
    flex: 1,
  },
  emptyBookingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyBookingTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
    color: '#000',
    marginBottom: 8,
  },
  emptyBookingText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  bookingsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  hostSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  hostButton: {
    backgroundColor: '#138AFE',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});