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
  Image as ImageIcon,
  MoreVertical,
  Paperclip,
  Phone,
  Send,
  Smile
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthGuard } from '../src/hooks';
import { groupsService } from '../src/services/groups';
import { chatService, videoService } from '../src/services/stream';

interface ChatMessage {
  id: string;
  text: string;
  timestamp: Date;
  isSender: boolean;
  read: boolean;
}

// Mock chat messages
const mockMessages: ChatMessage[] = [
  {
    id: "1",
    text: "Hey! How was your trip to Santorini?",
    timestamp: new Date(Date.now() - 3600000),
    isSender: false,
    read: true,
  },
  {
    id: "2",
    text: "It was amazing! The views were incredible. You should definitely go there sometime.",
    timestamp: new Date(Date.now() - 3300000),
    isSender: true,
    read: true,
  },
  {
    id: "3",
    text: "I heard the food there is great too. Did you try any local restaurants?",
    timestamp: new Date(Date.now() - 3000000),
    isSender: false,
    read: true,
  },
  {
    id: "4",
    text: "Yes! We had the best Greek salad and fresh seafood. The sunsets were breathtaking.",
    timestamp: new Date(Date.now() - 2700000),
    isSender: true,
    read: true,
  },
  {
    id: "5",
    text: "Sounds perfect! I'm planning a trip to Europe next month. Any recommendations?",
    timestamp: new Date(Date.now() - 2400000),
    isSender: false,
    read: false,
  },
];

// Contact data - in a real app, this would be fetched from user profiles
const getContactData = (otherUserId: string) => ({
  id: otherUserId,
  name: "Chat User", // Would be fetched from profile
  avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face",
  online: true, // Would be determined from presence
});

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState(mockMessages);
  const [channel, setChannel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  // Use auth guard to ensure user is authenticated
  const { isAuthenticated, user, isLoading: authLoading } = useAuthGuard();

  // Check if this is a group chat
  const { data: groupData } = useQuery({
    queryKey: ['group', id],
    queryFn: () => groupsService.getGroupDetails(id as string),
    enabled: !!id && isAuthenticated,
  });

  const isGroupChat = !!groupData;
  const channelId = id as string;

  // Get contact data for the other user (for direct messages)
  const contactData = getContactData(channelId);

  // Initialize chat channel
  useEffect(() => {
    let unsubscribeNewMessage: any = null;
    let unsubscribeMessageUpdate: any = null;

    const initializeChat = async () => {
      try {
        setLoading(true);

        if (!isAuthenticated || !user) {
          console.log('User not authenticated, skipping chat initialization');
          setLoading(false);
          return;
        }

        // Use actual user ID from auth
        const currentUserId = user.id;
        const otherUserId = id as string;

        if (!otherUserId) {
          console.error('No other user ID provided');
          setLoading(false);
          return;
        }

        console.log('[Chat] Initializing chat for channel:', channelId);

        let chatChannel;
        if (isGroupChat) {
          // For group chats, get the existing channel
          chatChannel = await chatService.getChannelById(channelId);
        } else {
          // For direct messages, get or create the channel
          const otherUserId = channelId; // For direct messages, channelId is the other user's ID
          chatChannel = await chatService.getOrCreateDirectMessage(currentUserId, otherUserId);
        }
        console.log('[Chat] Channel initialized:', chatChannel.id);
        setChannel(chatChannel);

        // Load message history
        const messageHistory = await chatService.getChannelMessages(chatChannel.id!);
        console.log('[Chat] Loaded message history:', messageHistory.messages?.length || 0, 'messages');

        const transformedMessages = messageHistory.messages?.map((msg: any) => ({
          id: msg.id,
          text: msg.text,
          timestamp: new Date(msg.created_at),
          isSender: msg.user.id === currentUserId,
          read: msg.read_by?.includes(currentUserId) || false,
        })) || [];

        // Only use real messages if we have them, otherwise keep empty array
        if (transformedMessages.length > 0) {
          setMessages(transformedMessages);
        } else {
          setMessages([]); // Start with empty chat
        }

        // Listen for new messages in real-time
        unsubscribeNewMessage = chatService.onChannelEvent(chatChannel.id!, 'message.new', (event) => {
          console.log('[Chat] New message received:', event.message);
          const newMessage = {
            id: event.message.id,
            text: event.message.text,
            timestamp: new Date(event.message.created_at),
            isSender: event.message.user.id === currentUserId,
            read: false,
          };
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(msg => msg.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
        });

        // Listen for message updates (read receipts, etc.)
        unsubscribeMessageUpdate = chatService.onChannelEvent(chatChannel.id!, 'message.updated', (event) => {
          console.log('[Chat] Message updated:', event.message);
          // Update message read status, etc.
        });

      } catch (error) {
        console.error('[Chat] Failed to initialize chat:', error);
        // Don't fall back to mock data - show empty chat
        setMessages([]);
        Alert.alert('Chat Error', 'Unable to load chat. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    if (fontsLoaded && !authLoading) {
      initializeChat();
    }

    // Cleanup function
    return () => {
      if (unsubscribeNewMessage) {
        unsubscribeNewMessage.unsubscribe?.();
      }
      if (unsubscribeMessageUpdate) {
        unsubscribeMessageUpdate.unsubscribe?.();
      }
    };
  }, [fontsLoaded, id, isAuthenticated, user, authLoading]);

  if (!fontsLoaded) {
    return null;
  }

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    if (!channel) {
      Alert.alert('Error', 'Chat not initialized. Please try again.');
      return;
    }

    try {
      console.log('[Chat] Sending message:', messageText.trim());

      // Send message via Stream Chat
      const sentMessage = await chatService.sendMessage(channel.id, messageText.trim());
      console.log('[Chat] Message sent successfully:', sentMessage);

      // Clear input immediately
      setMessageText("");

      // The message will be received via the real-time listener
      // No need to manually add to local state

      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (error) {
      console.error('[Chat] Failed to send message:', error);
      Alert.alert('Send Error', 'Failed to send message. Please check your connection and try again.');
    }
  };

  const handleAttachment = (type: string) => {
    console.log(`Attachment ${type} pressed`);
  };

  const handleCall = async () => {
    if (!user || !id) return;

    try {
      // Generate unique call ID
      const callId = `call_${user.id}_${id}_${Date.now()}`;

      // Create call with both users
      const call = await videoService.createCall(callId, [user.id, id as string]);

      // Navigate to voice call screen (default for chat)
      router.push(`/chat/voice-call/${callId}` as any);
    } catch (error) {
      console.error('Failed to start call:', error);
      Alert.alert('Error', 'Failed to start call. Please try again.');
    }
  };

  const handleGroupSettings = () => {
    if (isGroupChat && groupData) {
      // Navigate to group settings screen
      router.push(`/group-settings/${groupData.id}` as any);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderMessage = (message: ChatMessage, index: number) => {
    const showTimestamp = index === 0 ||
      messages[index - 1].timestamp.getTime() - message.timestamp.getTime() > 300000; // 5 minutes

    return (
      <View key={message.id} style={styles.messageContainer}>
        {showTimestamp && (
          <Text style={styles.timestamp}>
            {formatTime(message.timestamp)}
          </Text>
        )}
        <View style={[
          styles.messageBubble,
          message.isSender ? styles.sentMessage : styles.receivedMessage
        ]}>
          <Text style={[
            styles.messageText,
            message.isSender ? styles.sentMessageText : styles.receivedMessageText
          ]}>
            {message.text}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={[
              styles.messageTime,
              message.isSender ? styles.sentMessageTime : styles.receivedMessageTime
            ]}>
              {formatTime(message.timestamp)}
            </Text>
            {message.isSender && (
              <Text style={styles.readReceipt}>
                {message.read ? "✓✓" : "✓"}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: isGroupChat ? (groupData?.avatar_url || 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=60&h=60&fit=crop') : contactData.avatar }}
              style={styles.headerAvatar}
              contentFit="cover"
            />
            {!isGroupChat && contactData.online && <View style={styles.onlineIndicator} />}
          </View>
          <View>
            <Text style={styles.headerName}>
              {isGroupChat ? groupData?.name : contactData.name}
            </Text>
            <Text style={styles.headerStatus}>
              {isGroupChat ? `${groupData ? 'Group' : 'Loading...'}` : (contactData.online ? "Online" : "Offline")}
            </Text>
          </View>
        </View>

        {isGroupChat ? (
          <TouchableOpacity style={styles.callButton} onPress={handleGroupSettings}>
            <MoreVertical size={20} color="#000" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.callButton} onPress={handleCall}>
            <Phone size={20} color="#000" />
          </TouchableOpacity>
        )}
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
      >
        {messages.map(renderMessage)}
      </ScrollView>

      {/* Input Area */}
      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 10 }]}>
        <View style={styles.inputRow}>
          <TouchableOpacity
            style={styles.attachmentButton}
            onPress={() => handleAttachment("image")}
          >
            <ImageIcon size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.attachmentButton}
            onPress={() => handleAttachment("file")}
          >
            <Paperclip size={20} color="#666" />
          </TouchableOpacity>

          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              value={messageText}
              onChangeText={setMessageText}
              multiline
              placeholderTextColor="#666"
            />
            <TouchableOpacity
              style={styles.emojiButton}
              onPress={() => handleAttachment("emoji")}
            >
              <Smile size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!messageText.trim()}
          >
            <Send size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
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
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  headerName: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 18, // Larger
    color: "#000",
    lineHeight: 24,
  },
  headerStatus: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14, // Larger
    color: "#666",
    lineHeight: 18,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  timestamp: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14, // Larger
    color: "#666",
    textAlign: "center",
    marginBottom: 10, // More spacing
    lineHeight: 18,
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 18, // More padding
    paddingVertical: 14, // More padding
    borderRadius: 20, // More rounded
  },
  sentMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#138AFE",
    borderBottomRightRadius: 6, // More rounded
  },
  receivedMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#F3F4F6",
    borderBottomLeftRadius: 6, // More rounded
  },
  messageText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 17, // Larger
    lineHeight: 24, // Better line height
  },
  sentMessageText: {
    color: "#FFF",
  },
  receivedMessageText: {
    color: "#000",
  },
  messageFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 4,
  },
  messageTime: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13, // Larger
    lineHeight: 16,
  },
  sentMessageTime: {
    color: "rgba(255, 255, 255, 0.8)", // Better contrast
  },
  receivedMessageTime: {
    color: "#666",
  },
  readReceipt: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginLeft: 4,
  },
  inputContainer: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  attachmentButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  textInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  textInput: {
    flex: 1,
    fontFamily: "Poppins_400Regular",
    fontSize: 17, // Larger
    color: "#000",
    maxHeight: 100, // Allow more height
    lineHeight: 24, // Better line height
  },
  emojiButton: {
    marginLeft: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#138AFE",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#CCC",
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
});