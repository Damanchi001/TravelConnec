import { useMessageStore } from '@/src/stores/message-store';
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
  MessageCircle,
  Phone,
  PhoneOff,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { videoService } from '../../src/services/stream';

interface IncomingCallModalProps {
  callId: string;
  callerName: string;
  callerAvatar?: string;
  callType: 'voice' | 'video';
}

export default function IncomingCallModal() {
  const insets = useSafeAreaInsets();
  const { currentCall, updateCurrentCall } = useMessageStore();

  // Mock incoming call data - in real app this would come from props or route params
  const callData: IncomingCallModalProps = {
    callId: "incoming-call-123",
    callerName: "Emily Rodriguez",
    callerAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face",
    callType: "voice",
  };

  const [callDuration, setCallDuration] = useState(0);
  const [isRinging, setIsRinging] = useState(true);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  useEffect(() => {
    // Start vibration pattern for incoming call
    if (isRinging) {
      const vibrationPattern = [0, 1000, 1000]; // Wait 0ms, vibrate 1000ms, pause 1000ms
      Vibration.vibrate(vibrationPattern, true);
    }

    return () => {
      Vibration.cancel();
    };
  }, [isRinging]);

  useEffect(() => {
    if (!currentCall) {
      // Initialize incoming call session
      updateCurrentCall({
        id: callData.callId,
        type: callData.callType,
        status: 'ringing',
        direction: 'incoming',
        participantId: "caller-id",
        participantName: callData.callerName,
        participantAvatar: callData.callerAvatar,
      });
    }
  }, [currentCall, updateCurrentCall, callData.callId, callData.callType, callData.callerName, callData.callerAvatar]);

  if (!fontsLoaded) {
    return null;
  }

  const handleAcceptCall = async () => {
    setIsRinging(false);
    Vibration.cancel();

    try {
      // Join the call using Stream video service
      const call = await videoService.joinCall(callData.callId);

      updateCurrentCall({
        status: 'connected',
        startTime: new Date(),
      });

      // Navigate to appropriate call screen
      if (callData.callType === 'video') {
        router.push(`/chat/video-call/${callData.callId}` as any);
      } else {
        router.push(`/chat/voice-call/${callData.callId}` as any);
      }
    } catch (error) {
      console.error('Failed to join call:', error);
      updateCurrentCall({
        status: 'ended',
      });
    }
  };

  const handleDeclineCall = () => {
    setIsRinging(false);
    Vibration.cancel();

    updateCurrentCall({
      status: 'declined',
      endTime: new Date(),
    });

    router.back();
  };

  const handleMessageInstead = () => {
    setIsRinging(false);
    Vibration.cancel();

    updateCurrentCall({
      status: 'declined',
      endTime: new Date(),
    });

    // Navigate to chat instead
    router.push(`/chat?id=${callData.callId}` as any);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      {/* Background */}
      <View style={styles.background}>
        <Image
          source={{ uri: callData.callerAvatar }}
          style={styles.backgroundImage}
          contentFit="cover"
        />
        <View style={styles.backgroundOverlay} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.callerContainer}>
          <Image
            source={{ uri: callData.callerAvatar }}
            style={styles.callerAvatar}
            contentFit="cover"
          />
          <Text style={styles.callerName}>{callData.callerName}</Text>
          <Text style={styles.callType}>
            {callData.callType === 'video' ? 'Video call' : 'Voice call'}
          </Text>
          <Text style={styles.ringingText}>Ringing...</Text>
        </View>

        {/* Call Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.messageButton}
            onPress={handleMessageInstead}
          >
            <MessageCircle size={24} color="#FFF" />
            <Text style={styles.actionText}>Message</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.declineButton}
            onPress={handleDeclineCall}
          >
            <PhoneOff size={28} color="#FFF" />
            <Text style={styles.actionText}>Decline</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.acceptButton}
            onPress={handleAcceptCall}
          >
            <Phone size={28} color="#FFF" />
            <Text style={styles.actionText}>Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 100,
  },
  callerContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  callerAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#FFF",
    marginBottom: 24,
  },
  callerName: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 28,
    color: "#FFF",
    marginBottom: 8,
    textAlign: "center",
  },
  callType: {
    fontFamily: "Poppins_400Regular",
    fontSize: 18,
    color: "#FFF",
    opacity: 0.8,
    marginBottom: 16,
  },
  ringingText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
    color: "#FFF",
    opacity: 0.6,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 40,
  },
  messageButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  declineButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
  },
  acceptButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#34C759",
    justifyContent: "center",
    alignItems: "center",
  },
  actionText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#FFF",
    marginTop: 4,
    textAlign: "center",
  },
});