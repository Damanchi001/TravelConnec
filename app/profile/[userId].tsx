import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Award,
  Calendar,
  MapPin,
  MessageCircle,
  Phone,
  Share,
  Star,
  UserMinus,
  UserPlus,
  Video
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
import { useFollowStatus, useUserProfile } from "../../src/hooks";
import { useBookings } from "../../src/hooks/useBookings";
import { chatService } from "../../src/services/stream";
import { callSignalingService } from "../../src/services/stream/call-signaling";
import { useAuthStore } from "../../src/stores/auth-store";
import { useSubscriptionStore } from "../../src/stores/subscription-store";

const { width: screenWidth } = Dimensions.get("window");

type BookingTab = 'upcoming' | 'past';

export default function UserProfileScreen() {
  const insets = useSafeAreaInsets();
  const { userId } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState("posts");
  const [bookingTab, setBookingTab] = useState<BookingTab>('upcoming');
  const [filters, setFilters] = useState({
    status: 'all' as 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled',
    sortBy: 'check_in' as 'check_in' | 'created_at' | 'total_amount',
    sortOrder: 'desc' as 'asc' | 'desc',
  });
  const { profile: currentUserProfile } = useAuthStore();
  const { status } = useSubscriptionStore();

  // Use hooks for profile and follow status
  const { profile: viewedUserProfile, loading: profileLoading, error: profileError } = useUserProfile(userId as string);
  const { isFollowing, loading: followLoading, toggleFollow } = useFollowStatus(userId as string);

  const { bookings, loading: bookingsLoading, error, refetch } = useBookings({
    userId: userId as string,
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

  if (!fontsLoaded || profileLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!viewedUserProfile) {
    return (
      <View style={styles.container}>
        <Text>User not found</Text>
      </View>
    );
  }

  const handleBackPress = () => {
    router.back();
  };

  const handleFollow = async () => {
    await toggleFollow();
  };

  const handleMessage = async () => {
    if (!currentUserProfile?.id || !userId) return;

    try {
      // Create or get direct message channel
      const channel = await chatService.getOrCreateDirectMessage(currentUserProfile.id, userId as string);
      // Navigate to chat
      router.push(`/chat/${channel.id}` as any);
    } catch (error) {
      console.error('Failed to start chat:', error);
      Alert.alert('Error', 'Failed to start conversation');
    }
  };

  const handleCall = async (callType: 'voice' | 'video') => {
    if (!currentUserProfile?.id || !userId) return;

    try {
      // Check subscription permissions for video calls
      if (callType === 'video' && status.tier === 'traveler') {
        Alert.alert(
          'Premium Feature',
          'Video calling requires a premium subscription. Upgrade to make video calls.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Upgrade', onPress: () => router.push('/(subscription)/plans' as any) }
          ]
        );
        return;
      }

      // Check if user is already in a call
      if (callSignalingService.isUserInCall(currentUserProfile.id)) {
        Alert.alert('Call in Progress', 'You are already in a call. Please end the current call first.');
        return;
      }

      // Check if target user is already in a call
      if (callSignalingService.isUserInCall(userId as string)) {
        Alert.alert('User Busy', 'The user is currently in another call.');
        return;
      }

      // Check if target user has video calling disabled (if video call)
      if (callType === 'video') {
        // This would check user preferences for video calling availability
        // For now, assume all users can receive video calls
      }

      // Initiate call using signaling service
      const result = await callSignalingService.initiateCall(
        currentUserProfile.id,
        userId as string,
        callType
      );

      if (result.success && result.callId) {
        // Navigate to appropriate call screen
        if (callType === 'video') {
          router.push(`/chat/video-call/${result.callId}` as any);
        } else {
          router.push(`/chat/voice-call/${result.callId}` as any);
        }
      } else {
        Alert.alert('Call Failed', result.error || 'Failed to start call. Please try again.');
      }
    } catch (error) {
      console.error('Failed to start call:', error);
      Alert.alert('Error', 'Failed to start call. Please try again.');
    }
  };

  const handleShare = () => {
    console.log("Share profile pressed");
  };

  const handleFollowersPress = () => {
    console.log("Followers pressed");
  };

  const handleFollowingPress = () => {
    console.log("Following pressed");
  };

  const handleTripPress = (trip: any) => {
    console.log("Trip pressed:", trip.destination);
  };

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
  };

  // Check if viewing own profile
  const isOwnProfile = currentUserProfile?.id === userId;

  // Get user data from viewed profile
  const userData = {
    name: `${viewedUserProfile.first_name || ''} ${viewedUserProfile.last_name || ''}`.trim() || 'User',
    username: viewedUserProfile.username || `@${viewedUserProfile.first_name?.toLowerCase() || 'user'}`,
    bio: viewedUserProfile.bio || "Digital nomad exploring the world ✈️",
    profileImage: viewedUserProfile.avatar_url || "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face",
    coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop",
    location: viewedUserProfile.location?.city ? `${viewedUserProfile.location.city}, ${viewedUserProfile.location.country}` : "Location not set",
    joinDate: viewedUserProfile.created_at ? new Date(viewedUserProfile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : "Recently",
    membershipTier: status.tier === 'entrepreneur' ? 'Entrepreneur' : status.tier === 'traveler' ? 'Traveler' : 'Social',
    verified: viewedUserProfile.is_verified || false,
    stats: {
      posts: 0, // TODO: Get from database
      followers: 0, // TODO: Get from database
      following: 0, // TODO: Get from database
      countriesVisited: viewedUserProfile.preferences?.countriesVisited?.length || 0,
    },
    badges: [
      { id: 1, name: "Explorer", icon: "🗺️", description: `Visited ${viewedUserProfile.preferences?.countriesVisited?.length || 0} countries` },
      { id: 2, name: "Photographer", icon: "📸", description: "Travel photographer" },
      { id: 3, name: "Community Builder", icon: "👥", description: "Active traveler" },
    ],
    interests: viewedUserProfile.preferences?.interests || [],
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
            <Text style={styles.emptyStateSubtext}>Posts will appear here!</Text>
          </View>
        );
      case "trips":
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
                <RefreshControl refreshing={bookingsLoading} onRefresh={refetch} />
              }
              showsVerticalScrollIndicator={false}
            >
              {sortedBookings.length === 0 ? (
                <View style={styles.emptyBookingContainer}>
                  <Text style={styles.emptyBookingTitle}>
                    {bookingTab === 'upcoming' ? 'No upcoming trips' : 'No past trips'}
                  </Text>
                  <Text style={styles.emptyBookingText}>
                    {bookingTab === 'upcoming'
                      ? 'Upcoming trips will appear here.'
                      : 'Past trips will appear here.'
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
            <Text style={styles.emptyStateSubtext}>Reviews will appear here!</Text>
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
            </View>
          </View>

          {/* Profile Image */}
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: userData.profileImage }}
              style={styles.profileImage}
              contentFit="cover"
            />
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
            {!isOwnProfile && (
              <>
                <TouchableOpacity
                  style={[styles.followButton, isFollowing && styles.followingButton]}
                  onPress={handleFollow}
                  disabled={followLoading}
                >
                  {isFollowing ? (
                    <>
                      <UserMinus size={16} color="white" />
                      <Text style={styles.followButtonText}>Unfollow</Text>
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} color="white" />
                      <Text style={styles.followButtonText}>Follow</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.callButton} onPress={() => handleCall('voice')}>
                  <Phone size={16} color="white" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.videoCallButton} onPress={() => handleCall('video')}>
                  <Video size={16} color="white" />
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
              <MessageCircle size={16} color="white" />
            </TouchableOpacity>
          </View>
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
            {["posts", "trips", "reviews"].map((tab) => (
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
    fontSize: 26, // Larger
    color: "#000",
    marginRight: 10, // More spacing
    lineHeight: 32,
  },
  verifiedBadge: {
    width: 22, // Slightly larger
    height: 22,
    borderRadius: 11,
    backgroundColor: "#138AFE",
    justifyContent: "center",
    alignItems: "center",
  },
  verifiedIcon: {
    fontSize: 13, // Larger
    color: "#000",
    fontWeight: "bold",
  },
  username: {
    fontFamily: "Poppins_400Regular",
    fontSize: 17, // Larger
    color: "#666",
    marginBottom: 10, // More spacing
    lineHeight: 22,
  },
  membershipContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  membershipText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 15, // Larger
    color: "#138AFE",
    marginLeft: 8, // More spacing
    lineHeight: 20,
  },
  bio: {
    fontFamily: "Poppins_400Regular",
    fontSize: 17, // Larger
    color: "#000",
    lineHeight: 26, // Better line height
    marginBottom: 20, // More spacing
  },
  metaInfo: {
    marginBottom: 24, // More spacing
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8, // More spacing
  },
  metaText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 15, // Larger
    color: "#666",
    marginLeft: 10, // More spacing
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  followButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#138AFE",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  followingButton: {
    backgroundColor: "#666",
  },
  followButtonText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 17, // Larger
    color: "#000",
    marginLeft: 10, // More spacing
    lineHeight: 20,
  },
  messageButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  callButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  videoCallButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#2196F3",
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
    fontSize: 22, // Larger
    color: "#000",
    marginBottom: 6, // More spacing
    lineHeight: 26,
  },
  statLabel: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14, // Larger
    color: "#666",
    lineHeight: 18,
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
    fontSize: 20, // Larger
    color: "#000",
    lineHeight: 26,
  },
  viewAllText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 15, // Larger
    color: "#138AFE",
    lineHeight: 20,
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
    fontSize: 17, // Larger
    color: "#666",
    lineHeight: 22,
  },
  activeTabText: {
    color: "#000",
  },
  tabContent: {
    alignItems: "center",
    paddingVertical: 50, // More padding
    paddingHorizontal: 24, // More padding
  },
  emptyStateText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 20, // Larger
    color: "#000",
    marginBottom: 12, // More spacing
    lineHeight: 26,
  },
  emptyStateSubtext: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16, // Larger
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
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
});