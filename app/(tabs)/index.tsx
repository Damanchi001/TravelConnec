import { ActivityFeed } from '@/src/components/social/activity-feed';
import { useAuthStore } from '@/src/stores/auth-store';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { Ionicons } from '@expo/vector-icons';
import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: screenWidth } = Dimensions.get("window");


// Type definitions
interface Story {
  id: number;
  user: string;
  avatar: string;
  isOwn?: boolean;
}

// Sample stories data
const stories = [
  { id: 1, user: "Your Story", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face", isOwn: true },
  { id: 2, user: "Sarah Chen", avatar: "https://images.unsplash.com/photo-1494790108755-2616b4f04e31?w=80&h=80&fit=crop&crop=face" },
  { id: 3, user: "Marco Silva", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" },
  { id: 4, user: "Emma Rodriguez", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face" },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const handleProfilePress = () => {
    router.push("/profile");
  };

  const handleNotificationPress = () => {
    router.push("/notifications");
  };

  const handleCreatePost = () => {
    router.push("/(modals)/post-composer");
  };

  const renderStory = (story: Story) => (
    <TouchableOpacity key={story.id} style={styles.storyItem}>
      <View style={[styles.storyAvatar, story.isOwn && styles.ownStory]}>
        <Image
          source={{ uri: story.avatar }}
          style={styles.storyImage}
          contentFit="cover"
        />
        {story.isOwn && (
          <View style={styles.addStoryIcon}>
            <Ionicons name="add-circle" size={12} color="#FFF" />
          </View>
        )}
      </View>
      <Text style={styles.storyUser}>{story.user}</Text>
    </TouchableOpacity>
  );


  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>TravelConnec</Text>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleNotificationPress}
          >
            <Ionicons name="notifications-outline" size={24} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileButton}
            onPress={handleProfilePress}
          >
            <Ionicons name="person" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.storiesContainer}
        contentContainerStyle={styles.storiesContent}
      >
        {stories.map(renderStory)}
      </ScrollView>



      {/* Social Feed */}
      <View style={styles.feedContainer}>
        <ActivityFeed
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            setTimeout(() => setRefreshing(false), 1500);
          }}
          onUserPress={(userId) => router.push(`/profile/${userId}` as any)}
        />
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreatePost}
        accessibilityLabel="Create new post"
        accessibilityRole="button"
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 24, // Larger for better visibility
    color: "#000",
    lineHeight: 32,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#138AFE",
    justifyContent: "center",
    alignItems: "center",
  },
  storiesContainer: {
    maxHeight: 110,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  storiesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  storyItem: {
    alignItems: "center",
    marginRight: 20,
  },
  storyAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ownStory: {
    borderColor: "#138AFE",
  },
  storyImage: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  addStoryIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#138AFE",
    justifyContent: "center",
    alignItems: "center",
  },
  storyUser: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14, // Larger
    color: "#000",
    marginTop: 6, // More spacing
    lineHeight: 18,
  },
  createPostContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  createPostButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  createPostText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    color: "#666",
    marginLeft: 12,
  },
  feedContainer: {
    flex: 1,
  },
  feedContent: {
    paddingTop: 16,
    paddingHorizontal: 0,
  },
  postCard: {
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
    marginHorizontal: 16,
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 0,
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  userName: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: "#000",
    marginRight: 4,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#138AFE",
    justifyContent: "center",
    alignItems: "center",
  },
  verifiedIcon: {
    fontSize: 10,
    color: "#000",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  location: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  timestamp: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#999",
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  postContent: {
    fontFamily: "Poppins_400Regular",
    fontSize: 15,
    color: "#000",
    lineHeight: 22,
    paddingHorizontal: 0,
    marginBottom: 12,
  },
  postImage: {
    width: screenWidth - 32,
    height: (screenWidth - 32) * 0.8,
    marginBottom: 12,
    borderRadius: 12,
  },
  postActions: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 0,
    gap: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    color: "#666",
  },
  likedText: {
    color: "#FF6B6B",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 18,
    color: "#000",
    marginBottom: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  cancelButton: {
    padding: 12,
  },
  cancelText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
    color: "#666",
  },
  submitButton: {
    backgroundColor: "#138AFE",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  submitText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: "#000",
  },
  commentsList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  commentItem: {
    marginBottom: 8,
  },
  commentUser: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: "#000",
  },
  commentText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#000",
  },
  commentTime: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#999",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#DDD",
    paddingTop: 12,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  closeButton: {
    marginTop: 16,
    alignSelf: "center",
  },
  closeText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
    color: "#666",
  },
  mediaButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  mediaButton: {
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    minWidth: 80,
  },
  mediaButtonText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#138AFE",
    marginTop: 4,
  },
  imagePreview: {
    position: "relative",
    marginBottom: 16,
    borderRadius: 8,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 12,
  },
  locationPreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F8FF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  locationText: {
    flex: 1,
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#138AFE",
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: "#CCC",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#138AFE",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#138AFE",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  clearButton: {
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 20,
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});