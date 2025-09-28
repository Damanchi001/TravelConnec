import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NotificationService } from '../src/services/notifications';
import { useNotificationStore } from '../src/stores/notification-store';

interface LegacyNotification {
  id: number;
  type: 'message' | 'call' | 'request';
  title: string;
  message: string;
  time: string;
  read: boolean;
  avatar?: string;
}

interface CombinedNotification {
  id: string | number;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  avatar?: string;
}

// Mock notifications data for backward compatibility
const legacyNotificationsData: LegacyNotification[] = [
  {
    id: 1,
    type: 'message',
    title: 'New Message',
    message: 'Emily Rodriguez sent you a message about your trip to Santorini',
    time: '2m ago',
    read: false,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face',
  },
  {
    id: 2,
    type: 'call',
    title: 'Missed Call',
    message: 'Marco Adventures tried to call you',
    time: '15m ago',
    read: false,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face',
  },
  {
    id: 3,
    type: 'request',
    title: 'New Booking Request',
    message: 'Someone wants to book your Bali listing for next week',
    time: '1h ago',
    read: false,
  },
  {
    id: 4,
    type: 'message',
    title: 'New Message',
    message: 'Sarah Chen commented on your Kyoto photos',
    time: '3h ago',
    read: true,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face',
  },
  {
    id: 5,
    type: 'request',
    title: 'Group Invitation',
    message: 'European Backpackers invited you to join their Prague meetup',
    time: '5h ago',
    read: true,
  },
  {
    id: 6,
    type: 'call',
    title: 'Missed Call',
    message: 'David Kim called while you were away',
    time: '1d ago',
    read: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face',
  },
];

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("all");

  // Use the notification store
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification
  } = useNotificationStore();

  // Combine with legacy notifications for now
  const allNotifications: CombinedNotification[] = [
    ...notifications.map(n => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      time: NotificationService.formatTimeAgo(n.time),
      read: n.read,
      avatar: n.avatar,
    })),
    ...legacyNotificationsData
  ];

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

  const handleNotificationPress = (notification: CombinedNotification) => {
    // Mark as read if it's from the new system
    if ('id' in notification && typeof notification.id === 'string') {
      markAsRead(notification.id);
    }

    // Navigate based on type
    if (notification.type === 'message') {
      router.push('/messages' as any);
    } else if (notification.type === 'call') {
      // Could navigate to call history or something
    } else if (notification.type === 'request') {
      // Could navigate to bookings or requests
    }
    // For now, only handle basic navigation for legacy notifications
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const filteredNotifications = allNotifications.filter((notification) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.read;
    return notification.type === activeTab;
  });

  const getNotificationIcon = (type: string) => {
    // Handle legacy notification types
    switch (type) {
      case 'message':
        return 'chatbubble-outline';
      case 'call':
        return 'call-outline';
      case 'request':
        return 'document-outline';
      default:
        return NotificationService.getNotificationIcon(type as any);
    }
  };

  const renderNotificationItem = (notification: CombinedNotification) => (
    <TouchableOpacity
      key={notification.id}
      style={[styles.notificationItem, !notification.read && styles.unreadItem]}
      onPress={() => handleNotificationPress(notification)}
    >
      <View style={styles.notificationIcon}>
        <Ionicons
          name={getNotificationIcon(notification.type) as any}
          size={24}
          color="#138AFE"
        />
      </View>

      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={[
            styles.notificationTitle,
            !notification.read && styles.unreadTitle
          ]}>
            {notification.title}
          </Text>
          <Text style={styles.notificationTime}>
            {typeof notification.time === 'string' ? notification.time : NotificationService.formatTimeAgo(notification.time)}
          </Text>
        </View>

        <Text style={[
          styles.notificationMessage,
          !notification.read && styles.unreadMessage
        ]} numberOfLines={2}>
          {notification.message}
        </Text>
      </View>

      {!notification.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );


  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>Stay updated on your activities</Text>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markReadButton} onPress={handleMarkAllRead}>
            <Text style={styles.markReadText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {["all", "unread", "messages", "calls", "requests"].map((tab) => (
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
            {tab === "unread" && unreadCount > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>
                  {unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Notifications List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 100 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {filteredNotifications.length > 0 ? (
          <View style={styles.notificationsList}>
            {filteredNotifications.map(renderNotificationItem)}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={48} color="#E5E7EB" />
            <Text style={styles.emptyStateTitle}>No notifications</Text>
            <Text style={styles.emptyStateSubtitle}>
              {activeTab === "unread" ? "All caught up!" : "You'll see your notifications here"}
            </Text>
          </View>
        )}
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 24,
    color: "#000",
  },
  headerSubtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  markReadButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markReadText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    color: "#138AFE",
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
    paddingVertical: 10,
    paddingHorizontal: 2,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#138AFE",
  },
  tabText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
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
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  notificationsList: {
    gap: 8,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  unreadItem: {
    backgroundColor: "#F8F9FF",
    borderColor: "#E3E8FF",
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F8FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  notificationTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: "#000",
  },
  unreadTitle: {
    color: "#000",
  },
  notificationTime: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#666",
  },
  notificationMessage: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  unreadMessage: {
    color: "#000",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#138AFE",
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