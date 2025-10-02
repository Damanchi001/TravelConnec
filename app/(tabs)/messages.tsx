import { useMessageStore } from "@/src/stores/message-store";
import { Chat } from "@/src/types/messages";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { useQuery } from '@tanstack/react-query';
import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Edit3,
  MessageCircle,
  Phone,
  Plus,
  Search,
  User,
  Users
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { groupsService } from '../../src/services/groups';
import { useAuthStore } from '../../src/stores/auth-store';

// Initialize with mock data for now
const initializeMockData = () => {
  const mockChats = [
    {
      id: "1",
      type: "direct" as const,
      name: "Emily Rodriguez",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face",
      participants: [
        {
          id: "1",
          name: "Emily Rodriguez",
          avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face",
          online: true
        }
      ],
      lastMessage: {
        id: "msg1",
        senderId: "1",
        senderName: "Emily Rodriguez",
        content: "That hotel in Santorini looks amazing! When are you planning to go?",
        timestamp: new Date(Date.now() - 120000),
        read: false,
        type: "text" as const
      },
      unreadCount: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    },
    {
      id: "2",
      type: "direct" as const,
      name: "Marco Adventures",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face",
      participants: [
        {
          id: "2",
          name: "Marco Adventures",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face",
          online: true
        }
      ],
      lastMessage: {
        id: "msg2",
        senderId: "2",
        senderName: "Marco Adventures",
        content: "Thanks for the travel guide recommendation! 🙏",
        timestamp: new Date(Date.now() - 900000),
        read: true,
        type: "text" as const
      },
      unreadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    },
    {
      id: "3",
      type: "group" as const,
      name: "Bali Travel Group",
      avatar: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=60&h=60&fit=crop",
      participants: [
        {
          id: "3a",
          name: "Alex",
          online: false
        },
        {
          id: "3b",
          name: "Sarah",
          online: true
        }
      ],
      lastMessage: {
        id: "msg3",
        senderId: "3a",
        senderName: "Alex",
        content: "Don't forget to pack light clothes for the beach!",
        timestamp: new Date(Date.now() - 3600000),
        read: false,
        type: "text" as const
      },
      unreadCount: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    }
  ];

  return mockChats;
};

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showNewMessageOptions, setShowNewMessageOptions] = useState(false);

  const { chats, setChats } = useMessageStore();
  const { profile } = useAuthStore();

  // Fetch user groups
  const { data: userGroups, isLoading: groupsLoading } = useQuery({
    queryKey: ['user-groups', profile?.id],
    queryFn: () => groupsService.getUserGroups(profile?.id || ''),
    enabled: !!profile?.id,
  });

  // Convert groups to Chat format and merge with existing chats
  const allChats = useMemo(() => {
    const existingChats = [...chats];

    if (userGroups) {
      userGroups.forEach(group => {
        const groupChat: Chat = {
          id: group.stream_channel_id,
          type: 'group',
          name: group.group_name,
          avatar: group.group_avatar_url || 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=60&h=60&fit=crop',
          participants: [], // We'll need to fetch this separately if needed
          lastMessage: undefined, // We'll need to fetch this from Stream
          unreadCount: 0, // We'll need to implement this
          createdAt: new Date(group.joined_at),
          updatedAt: new Date(group.joined_at),
          isActive: true,
        };

        // Check if this group chat already exists
        const existingIndex = existingChats.findIndex(chat => chat.id === group.stream_channel_id);
        if (existingIndex >= 0) {
          // Update existing
          existingChats[existingIndex] = { ...existingChats[existingIndex], ...groupChat };
        } else {
          // Add new
          existingChats.unshift(groupChat); // Add to beginning
        }
      });
    }

    return existingChats;
  }, [chats, userGroups]);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  // Initialize mock data on first load
  useEffect(() => {
    if (chats.length === 0) {
      const mockData = initializeMockData();
      setChats(mockData);
    }
  }, [chats.length, setChats]);

  if (!fontsLoaded) {
    return null;
  }

  const handleProfilePress = () => {
    router.push("/profile");
  };

  const handleNewMessage = () => {
    setShowNewMessageOptions(!showNewMessageOptions);
  };

  const handleCreateGroup = () => {
    setShowNewMessageOptions(false);
    router.push("/create-group" as any);
  };

  const handleNewDirectMessage = () => {
    setShowNewMessageOptions(false);
    router.push("/new-chat" as any);
  };

  const handleCallLogs = () => {
    router.push("/call-logs" as any);
  };

  const handleMessagePress = (chat: Chat) => {
    router.push(`/chat?id=${chat.id}` as any);
  };

  const filteredChats = allChats.filter((chat: Chat) => {
    const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (chat.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "unread") return matchesSearch && chat.unreadCount > 0;
    if (activeTab === "groups") return matchesSearch && chat.type === "group";
    return matchesSearch;
  });

  const renderMessageItem = (chat: Chat) => {
    const formatTime = (date: Date) => {
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (minutes < 1) return 'now';
      if (minutes < 60) return `${minutes}m`;
      if (hours < 24) return `${hours}h`;
      if (days < 7) return `${days}d`;
      return date.toLocaleDateString();
    };

    return (
      <TouchableOpacity
        key={chat.id}
        style={styles.messageItem}
        onPress={() => handleMessagePress(chat)}
      >
        <View style={styles.messageLeft}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: chat.avatar }}
              style={styles.avatar}
              contentFit="cover"
            />
            {chat.participants.some(p => p.online) && <View style={styles.onlineIndicator} />}
          </View>

          <View style={styles.messageContent}>
            <View style={styles.messageHeader}>
              <Text style={[
                styles.messageName,
                chat.unreadCount > 0 && styles.unreadName
              ]}>
                {chat.name}
              </Text>
              <Text style={[
                styles.messageTime,
                chat.unreadCount > 0 && styles.unreadTime
              ]}>
                {chat.lastMessage ? formatTime(chat.lastMessage.timestamp) : ''}
              </Text>
            </View>

            <View style={styles.lastMessageContainer}>
              <Text style={[
                styles.lastMessage,
                chat.unreadCount > 0 && styles.unreadMessage
              ]} numberOfLines={1}>
                {chat.lastMessage ? chat.lastMessage.content : 'No messages yet'}
              </Text>

              {chat.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadCount}>
                    {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Messages</Text>
          <Text style={styles.headerSubtitle}>Stay connected with travelers</Text>
        </View>

        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton} onPress={handleCallLogs}>
            <Phone size={20} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton} onPress={handleProfilePress}>
            <User size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search messages..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
          />
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {["all", "unread", "groups"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab && styles.activeTabText
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
            {tab === "unread" && allChats.filter(c => c.unreadCount > 0).length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>
                  {allChats.filter(c => c.unreadCount > 0).length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Messages List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 100 }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
      >
        {filteredChats.length > 0 ? (
          <View style={styles.messagesList}>
            {filteredChats.map(renderMessageItem)}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MessageCircle size={48} color="#E5E7EB" />
            <Text style={styles.emptyStateTitle}>No messages found</Text>
            <Text style={styles.emptyStateSubtitle}>
              {searchQuery ? "Try adjusting your search" : "Start a conversation with fellow travelers"}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* New Message Options */}
      {showNewMessageOptions && (
        <View style={styles.newMessageOptions}>
          <TouchableOpacity
            style={styles.newMessageOption}
            onPress={handleCreateGroup}
          >
            <View style={styles.optionIcon}>
              <Users size={20} color="#138AFE" />
            </View>
            <Text style={styles.optionText}>Create Group</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.newMessageOption}
            onPress={handleNewDirectMessage}
          >
            <View style={styles.optionIcon}>
              <MessageCircle size={20} color="#138AFE" />
            </View>
            <Text style={styles.optionText}>New Message</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, showNewMessageOptions && styles.fabActive]}
        onPress={handleNewMessage}
      >
        {showNewMessageOptions ? (
          <Plus size={24} color="#000" style={{ transform: [{ rotate: '45deg' }] }} />
        ) : (
          <Edit3 size={24} color="#000" />
        )}
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
    paddingVertical: 20,
  },
  headerTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 28,
    color: "#000",
  },
  headerSubtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#138AFE",
    justifyContent: "center",
    alignItems: "center",
  },
  headerButtons: {
    flexDirection: "row",
    gap: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
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
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
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
  tabBadge: {
    backgroundColor: "#138AFE",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
    minWidth: 20,
    alignItems: "center",
  },
  tabBadgeText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    color: "#000",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  messagesList: {
    gap: 4,
  },
  messageItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  messageLeft: {
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
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  messageName: {
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
    color: "#000",
    flex: 1,
  },
  unreadName: {
    fontFamily: "Poppins_600SemiBold",
  },
  messageTime: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#666",
  },
  unreadTime: {
    color: "#138AFE",
    fontFamily: "Poppins_500Medium",
  },
  lastMessageContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lastMessage: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#666",
    flex: 1,
    marginRight: 8,
  },
  unreadMessage: {
    color: "#000",
    fontFamily: "Poppins_500Medium",
  },
  unreadBadge: {
    backgroundColor: "#138AFE",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: "center",
  },
  unreadCount: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 12,
    color: "#000",
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
  fab: {
    position: "absolute",
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#138AFE",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  fabActive: {
    backgroundColor: "#E5E7EB",
  },
  newMessageOptions: {
    position: "absolute",
    bottom: 170,
    right: 20,
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 180,
  },
  newMessageOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  optionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(19, 138, 254, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  optionText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
    color: "#000",
  },
});