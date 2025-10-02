import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { useQuery } from '@tanstack/react-query';
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  MessageCircle,
  Search,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { groupsService } from '../src/services/groups';
import { useAuthStore } from '../src/stores/auth-store';

interface Contact {
  user_id: string;
  first_name: string;
  last_name: string;
  username: string;
  avatar_url: string;
  bio?: string;
  is_verified: boolean;
  location?: {
    city?: string;
    country?: string;
  };
}

export default function NewChatScreen() {
  const insets = useSafeAreaInsets();
  const { userId } = useLocalSearchParams<{ userId?: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const { profile } = useAuthStore();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  // Fetch mutual followers
  const {
    data: mutualFollowers,
    isLoading: followersLoading,
    error: followersError,
    refetch: refetchFollowers
  } = useQuery({
    queryKey: ['mutual-followers', profile?.id, searchQuery],
    queryFn: () => groupsService.getMutualFollowers(profile?.id || ''),
    enabled: !!profile?.id,
  });

  // Handle direct chat initiation from userId parameter
  useEffect(() => {
    if (userId && profile?.id && mutualFollowers) {
      // Validate that the userId is a mutual follower
      const targetUser = mutualFollowers.find(follower => follower.user_id === userId);

      if (targetUser) {
        // Valid mutual follower, navigate to chat
        router.replace(`/chat?id=${userId}` as any);
      } else {
        // Not a mutual follower, show error
        Alert.alert(
          'Cannot Start Chat',
          'You can only start direct messages with mutual followers.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    }
  }, [userId, profile?.id, mutualFollowers]);

  if (!fontsLoaded) {
    return null;
  }

  // Show loading if fetching followers
  if (followersLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Chat</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#138AFE" />
          <Text style={styles.loadingText}>Loading contacts...</Text>
        </View>
      </View>
    );
  }

  // Show error if fetching failed
  if (followersError) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Chat</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load contacts</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetchFollowers()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const filteredContacts = mutualFollowers?.filter(contact =>
    `${contact.first_name} ${contact.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.username.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleContactPress = (contact: Contact) => {
    router.push(`/chat?id=${contact.user_id}` as any);
  };

  const renderContactItem = ({ item }: { item: Contact }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => handleContactPress(item)}
    >
      <View style={styles.contactLeft}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: item.avatar_url }}
            style={styles.avatar}
            contentFit="cover"
          />
          {/* Note: Online status would need to be fetched separately */}
        </View>

        <View style={styles.contactInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.contactName}>
              {item.first_name} {item.last_name}
            </Text>
            {item.is_verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedCheck}>✓</Text>
              </View>
            )}
          </View>
          <Text style={styles.contactUsername}>@{item.username}</Text>
          {item.bio && (
            <Text style={styles.contactBio} numberOfLines={1}>
              {item.bio}
            </Text>
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.messageButton}>
        <MessageCircle size={20} color="#138AFE" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Chat</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
          />
        </View>
      </View>

      {/* Contacts List */}
      <FlatList
        data={filteredContacts}
        renderItem={renderContactItem}
        keyExtractor={(item) => item.user_id}
        contentContainerStyle={[
          styles.contactsList,
          { paddingBottom: insets.bottom + 20 }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MessageCircle size={48} color="#E5E7EB" />
            <Text style={styles.emptyStateTitle}>No contacts found</Text>
            <Text style={styles.emptyStateSubtitle}>
              Try adjusting your search
            </Text>
          </View>
        }
      />
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
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 20,
    color: "#000",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    color: "#000",
    marginLeft: 12,
  },
  contactsList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  contactLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
    color: "#000",
    marginBottom: 2,
  },
  contactStatus: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#666",
  },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  verifiedBadge: {
    backgroundColor: "rgba(19, 138, 254, 0.1)",
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginLeft: 6,
  },
  verifiedCheck: {
    fontSize: 10,
    color: "#138AFE",
    fontWeight: "bold",
  },
  contactUsername: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  contactBio: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: "#888",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    color: "#666",
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    color: "#000",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#138AFE",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 18,
    color: "#000",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
});