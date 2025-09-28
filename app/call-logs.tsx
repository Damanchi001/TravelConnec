import { useMessageStore } from '@/src/stores/message-store';
import { CallLog } from '@/src/types/messages';
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
    Clock,
    Phone,
    PhoneMissed,
    Video,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CallLogsScreen() {
  const insets = useSafeAreaInsets();
  const { callLogs, setCallLogs } = useMessageStore();

  const [activeTab, setActiveTab] = useState("all");

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  // Initialize with mock data
  useEffect(() => {
    if (callLogs.length === 0) {
      const mockCallLogs: CallLog[] = [
        {
          id: "call1",
          type: "voice",
          direction: "incoming",
          status: "missed",
          participantId: "1",
          participantName: "Emily Rodriguez",
          participantAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face",
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        },
        {
          id: "call2",
          type: "video",
          direction: "outgoing",
          status: "completed",
          participantId: "2",
          participantName: "Marco Adventures",
          participantAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face",
          duration: 420, // 7 minutes
          timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        },
        {
          id: "call3",
          type: "voice",
          direction: "incoming",
          status: "completed",
          participantId: "3",
          participantName: "Bali Travel Group",
          participantAvatar: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=60&h=60&fit=crop",
          duration: 180, // 3 minutes
          timestamp: new Date(Date.now() - 86400000), // 1 day ago
        },
        {
          id: "call4",
          type: "voice",
          direction: "outgoing",
          status: "missed",
          participantId: "4",
          participantName: "Sarah Chen",
          participantAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face",
          timestamp: new Date(Date.now() - 172800000), // 2 days ago
        },
      ];
      setCallLogs(mockCallLogs);
    }
  }, [callLogs.length, setCallLogs]);

  if (!fontsLoaded) {
    return null;
  }

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredLogs = callLogs.filter((log) => {
    if (activeTab === "all") return true;
    if (activeTab === "missed") return log.status === "missed";
    return log.type === activeTab;
  });

  const getCallIcon = (log: CallLog) => {
    if (log.status === "missed") {
      return <PhoneMissed size={20} color="#FF3B30" />;
    }
    return log.type === "video" ? (
      <Video size={20} color="#138AFE" />
    ) : (
      <Phone size={20} color="#138AFE" />
    );
  };

  const renderCallLogItem = ({ item: log }: { item: CallLog }) => (
    <TouchableOpacity
      style={styles.callLogItem}
      onPress={() => {
        // Could navigate to call details or start new call
        console.log('Call log pressed:', log.id);
      }}
    >
      <View style={styles.callLogLeft}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: log.participantAvatar }}
            style={styles.avatar}
            contentFit="cover"
          />
        </View>

        <View style={styles.callLogContent}>
          <Text style={[
            styles.participantName,
            log.status === "missed" && styles.missedCall
          ]}>
            {log.participantName}
          </Text>
          <View style={styles.callLogDetails}>
            {getCallIcon(log)}
            <Text style={styles.callDirection}>
              {log.direction === 'incoming' ? 'Incoming' : 'Outgoing'}
            </Text>
            {log.duration && (
              <>
                <Clock size={14} color="#666" style={styles.clockIcon} />
                <Text style={styles.callDuration}>
                  {formatDuration(log.duration)}
                </Text>
              </>
            )}
          </View>
        </View>
      </View>

      <Text style={styles.callTime}>
        {formatTime(log.timestamp)}
      </Text>
    </TouchableOpacity>
  );

  const getTabCount = (tab: string) => {
    if (tab === "all") return callLogs.length;
    if (tab === "missed") return callLogs.filter(l => l.status === "missed").length;
    return callLogs.filter(l => l.type === tab).length;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Call History</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {["all", "missed", "voice", "video"].map((tab) => (
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
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>
                {getTabCount(tab)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Call Logs List */}
      <FlatList
        data={filteredLogs}
        renderItem={renderCallLogItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.callLogsList,
          { paddingBottom: insets.bottom + 20 }
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Phone size={48} color="#E5E7EB" />
            <Text style={styles.emptyStateTitle}>No call history</Text>
            <Text style={styles.emptyStateSubtitle}>
              Your call history will appear here
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
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
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
    fontSize: 14,
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
    color: "#FFF",
  },
  callLogsList: {
    paddingHorizontal: 16,
  },
  callLogItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  callLogLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  callLogContent: {
    flex: 1,
  },
  participantName: {
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
    color: "#000",
    marginBottom: 4,
  },
  missedCall: {
    color: "#FF3B30",
  },
  callLogDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  callDirection: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
  },
  clockIcon: {
    marginLeft: 12,
  },
  callDuration: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  callTime: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#666",
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