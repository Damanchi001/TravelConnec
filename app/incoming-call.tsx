import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Phone, PhoneOff, Video } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { callSignalingService, IncomingCallData } from "../src/services/stream/call-signaling";
import { supabase } from "../src/services/supabase/client";
import { useAuthStore } from "../src/stores/auth-store";

const { width, height } = Dimensions.get("window");

export default function IncomingCallScreen() {
  const insets = useSafeAreaInsets();
  const { callId } = useLocalSearchParams();
  const { profile: currentUser } = useAuthStore();
  const [callData, setCallData] = useState<IncomingCallData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCallData = async () => {
      // Get call data from signaling service
      const activeCall = callSignalingService.getActiveCall(currentUser?.id || '');
      if (activeCall && activeCall.id === callId) {
        // Fetch caller profile
        const { data: callerProfile } = await supabase
          .from('user_profiles')
          .select('first_name, last_name, avatar_url')
          .eq('id', activeCall.callerId)
          .single();

        const callerName = callerProfile
          ? `${callerProfile.first_name} ${callerProfile.last_name}`.trim()
          : 'Unknown Caller';

        setCallData({
          callId: activeCall.id,
          callerId: activeCall.callerId,
          callerName,
          callerAvatar: callerProfile?.avatar_url,
          type: activeCall.type,
        });
      }
      setIsLoading(false);
    };

    if (currentUser?.id && callId) {
      fetchCallData();
    }

    // Auto-dismiss after 30 seconds if not answered
    const timeout = setTimeout(() => {
      if (callData) {
        handleRejectCall();
      }
    }, 30000);

    return () => clearTimeout(timeout);
  }, [callId, currentUser?.id]);

  const handleAcceptCall = async () => {
    try {
      const result = await callSignalingService.acceptCall(callId as string);
      if (result.success) {
        // Navigate to appropriate call screen
        if (callData?.type === 'video') {
          router.replace(`/chat/video-call/${callId}` as any);
        } else {
          router.replace(`/chat/voice-call/${callId}` as any);
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to accept call');
        router.back();
      }
    } catch (error) {
      console.error('Failed to accept call:', error);
      Alert.alert('Error', 'Failed to accept call');
      router.back();
    }
  };

  const handleRejectCall = async () => {
    try {
      await callSignalingService.rejectCall(callId as string);
    } catch (error) {
      console.error('Failed to reject call:', error);
    }
    router.back();
  };

  if (isLoading || !callData) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const callTypeText = callData.type === 'video' ? 'Video Call' : 'Voice Call';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      {/* Background */}
      <View style={styles.background}>
        <Image
          source={{ uri: callData.callerAvatar || "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face" }}
          style={styles.backgroundImage}
          contentFit="cover"
        />
        <View style={styles.backgroundOverlay} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.callerContainer}>
          <Image
            source={{ uri: callData.callerAvatar || "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face" }}
            style={styles.callerAvatar}
            contentFit="cover"
          />
          <Text style={styles.callerName}>{callData.callerName || 'Unknown Caller'}</Text>
          <Text style={styles.callType}>{callTypeText}</Text>
          <Text style={styles.callStatus}>Incoming call...</Text>
        </View>
      </View>

      {/* Call Controls */}
      <View style={[styles.controls, { paddingBottom: insets.bottom + 40 }]}>
        <View style={styles.controlButtons}>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={handleRejectCall}
          >
            <PhoneOff size={28} color="#FFF" />
            <Text style={styles.rejectButtonText}>Decline</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.acceptButton}
            onPress={handleAcceptCall}
          >
            {callData.type === 'video' ? (
              <Video size={28} color="#FFF" />
            ) : (
              <Phone size={28} color="#FFF" />
            )}
            <Text style={styles.acceptButtonText}>Accept</Text>
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
    justifyContent: "center",
    alignItems: "center",
  },
  callerContainer: {
    alignItems: "center",
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
    marginBottom: 4,
  },
  callStatus: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    color: "#FFF",
    opacity: 0.6,
  },
  controls: {
    paddingHorizontal: 40,
    alignItems: "center",
  },
  controlButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 40,
  },
  rejectButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
  },
  rejectButtonText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#FFF",
    marginTop: 4,
  },
  acceptButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#34C759",
    justifyContent: "center",
    alignItems: "center",
  },
  acceptButtonText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#FFF",
    marginTop: 4,
  },
});