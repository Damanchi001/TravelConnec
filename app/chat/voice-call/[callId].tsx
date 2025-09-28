import { useMessageStore } from '@/src/stores/message-store';
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
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  VolumeX
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// Conditionally import video service only when available
let videoService: any = null;
try {
  const videoModule = require('../../../src/services/stream/video-service');
  videoService = videoModule.videoService;
} catch (error) {
  console.warn('Video service not available, using mock implementation');
  // Mock video service for Expo Go compatibility
  videoService = {
    joinCall: async () => ({ id: 'mock-call' }),
    leaveCall: async () => {},
    toggleAudio: async () => {},
    toggleVideo: async () => {},
    switchCamera: async () => {},
  };
}

export default function VoiceCallScreen() {
  const insets = useSafeAreaInsets();
  const { callId } = useLocalSearchParams();
  const { currentCall, updateCurrentCall } = useMessageStore();

  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [call, setCall] = useState<any>(null);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  // Mock call data - in real app this would come from the callId
  const callData = {
    id: callId as string,
    participantName: "Emily Rodriguez",
    participantAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face",
    type: "voice" as const,
    direction: "outgoing" as const,
    status: "connected" as const,
  };

  useEffect(() => {
    const initializeCall = async () => {
      try {
        // Join the call using Stream Video service
        const activeCall = await videoService.joinCall(callData.id);
        setCall(activeCall);

        if (!currentCall) {
          // Initialize call session
          updateCurrentCall({
            id: callData.id,
            type: callData.type,
            status: callData.status,
            direction: callData.direction,
            participantId: "participant-id",
            participantName: callData.participantName,
            participantAvatar: callData.participantAvatar,
            startTime: new Date(),
          });
        }
      } catch (error) {
        console.error('Failed to join call:', error);
        // Handle error - maybe navigate back or show error
      }
    };

    initializeCall();

    // Start call duration timer
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentCall, updateCurrentCall, callData.id, callData.type, callData.status, callData.direction, callData.participantName, callData.participantAvatar]);

  if (!fontsLoaded) {
    return null;
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    Alert.alert(
      "End Call",
      "Are you sure you want to end this call?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "End Call",
          style: "destructive",
          onPress: async () => {
            try {
              await videoService.leaveCall(callData.id);
            } catch (error) {
              console.error('Failed to leave call:', error);
            }
            updateCurrentCall({
              status: 'ended',
              endTime: new Date(),
              duration: callDuration
            });
            router.back();
          }
        }
      ]
    );
  };

  const handleMuteToggle = async () => {
    if (call) {
      try {
        await videoService.toggleAudio(callData.id);
        setIsMuted(!isMuted);
      } catch (error) {
        console.error('Failed to toggle audio:', error);
      }
    }
  };

  const handleSpeakerToggle = () => {
    setIsSpeakerOn(!isSpeakerOn);
    // Note: Speaker toggle might need additional implementation
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      {/* Background */}
      <View style={styles.background}>
        <Image
          source={{ uri: callData.participantAvatar }}
          style={styles.backgroundImage}
          contentFit="cover"
        />
        <View style={styles.backgroundOverlay} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.callType}>
          {callData.direction === 'outgoing' ? 'Outgoing call' : 'Incoming call'}
        </Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.participantContainer}>
          <Image
            source={{ uri: callData.participantAvatar }}
            style={styles.participantAvatar}
            contentFit="cover"
          />
          <Text style={styles.participantName}>{callData.participantName}</Text>
          <Text style={styles.callStatus}>
            {callData.status === 'connected' ? formatDuration(callDuration) : 'Connecting...'}
          </Text>
        </View>
      </View>

      {/* Call Controls */}
      <View style={[styles.controls, { paddingBottom: insets.bottom + 40 }]}>
        <View style={styles.controlButtons}>
          <TouchableOpacity
            style={[styles.controlButton, isMuted && styles.controlButtonActive]}
            onPress={handleMuteToggle}
          >
            {isMuted ? (
              <MicOff size={24} color="#FFF" />
            ) : (
              <Mic size={24} color="#FFF" />
            )}
            <Text style={styles.controlButtonText}>
              {isMuted ? 'Unmute' : 'Mute'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, isSpeakerOn && styles.controlButtonActive]}
            onPress={handleSpeakerToggle}
          >
            {isSpeakerOn ? (
              <VolumeX size={24} color="#FFF" />
            ) : (
              <Volume2 size={24} color="#FFF" />
            )}
            <Text style={styles.controlButtonText}>Speaker</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.endCallButton}
          onPress={handleEndCall}
        >
          <PhoneOff size={28} color="#FFF" />
        </TouchableOpacity>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  callType: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    color: "#FFF",
    textAlign: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  participantContainer: {
    alignItems: "center",
  },
  participantAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#FFF",
    marginBottom: 24,
  },
  participantName: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 28,
    color: "#FFF",
    marginBottom: 8,
    textAlign: "center",
  },
  callStatus: {
    fontFamily: "Poppins_400Regular",
    fontSize: 18,
    color: "#FFF",
    opacity: 0.8,
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
  controlButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  controlButtonActive: {
    backgroundColor: "#FFF",
  },
  controlButtonText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: "#FFF",
    marginTop: 4,
  },
  endCallButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
  },
});