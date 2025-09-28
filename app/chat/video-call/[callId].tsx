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
  Camera,
  CameraOff,
  Mic,
  MicOff,
  PhoneOff,
  RotateCcw,
  Volume2,
  VolumeX,
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

export default function VideoCallScreen() {
  const insets = useSafeAreaInsets();
  const { callId } = useLocalSearchParams();
  const { currentCall, updateCurrentCall } = useMessageStore();

  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
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
    type: "video" as const,
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
      "Are you sure you want to end this video call?",
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

  const handleCameraToggle = async () => {
    if (call) {
      try {
        await videoService.toggleVideo(callData.id);
        setIsCameraOn(!isCameraOn);
      } catch (error) {
        console.error('Failed to toggle video:', error);
      }
    }
  };

  const handleSpeakerToggle = () => {
    setIsSpeakerOn(!isSpeakerOn);
    // Note: Speaker toggle might need additional implementation
  };

  const handleSwitchCamera = async () => {
    if (call) {
      try {
        await videoService.switchCamera(callData.id);
      } catch (error) {
        console.error('Failed to switch camera:', error);
      }
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      {/* Remote Video (Main) */}
      <View style={styles.remoteVideoContainer}>
        <Image
          source={{ uri: callData.participantAvatar }}
          style={styles.remoteVideo}
          contentFit="cover"
        />
        <View style={styles.remoteVideoOverlay}>
          <Text style={styles.callDuration}>{formatDuration(callDuration)}</Text>
        </View>
      </View>

      {/* Local Video (Small) */}
      <View style={styles.localVideoContainer}>
        {isCameraOn ? (
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" }}
            style={styles.localVideo}
            contentFit="cover"
          />
        ) : (
          <View style={styles.localVideoPlaceholder}>
            <CameraOff size={24} color="#666" />
          </View>
        )}
      </View>

      {/* Participant Info */}
      <View style={styles.participantInfo}>
        <Text style={styles.participantName}>{callData.participantName}</Text>
        <Text style={styles.callType}>
          {callData.direction === 'outgoing' ? 'Outgoing video call' : 'Incoming video call'}
        </Text>
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
            style={[styles.controlButton, !isCameraOn && styles.controlButtonActive]}
            onPress={handleCameraToggle}
          >
            {isCameraOn ? (
              <Camera size={24} color="#FFF" />
            ) : (
              <CameraOff size={24} color="#FFF" />
            )}
            <Text style={styles.controlButtonText}>
              {isCameraOn ? 'Turn Off' : 'Turn On'}
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

          {isCameraOn && (
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleSwitchCamera}
            >
              <RotateCcw size={24} color="#FFF" />
              <Text style={styles.controlButtonText}>Switch</Text>
            </TouchableOpacity>
          )}
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
  remoteVideoContainer: {
    flex: 1,
    position: "relative",
  },
  remoteVideo: {
    width: '100%',
    height: '100%',
  },
  remoteVideoOverlay: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  callDuration: {
    fontFamily: "Poppins_500Medium",
    fontSize: 16,
    color: "#FFF",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  localVideoContainer: {
    position: "absolute",
    top: 100,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  localVideo: {
    width: '100%',
    height: '100%',
  },
  localVideoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  participantInfo: {
    position: "absolute",
    bottom: 200,
    left: 20,
    right: 20,
  },
  participantName: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 24,
    color: "#FFF",
    textAlign: "center",
    marginBottom: 4,
  },
  callType: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    color: "#FFF",
    textAlign: "center",
    opacity: 0.8,
  },
  controls: {
    paddingHorizontal: 20,
    alignItems: "center",
  },
  controlButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 30,
    flexWrap: "wrap",
    gap: 20,
  },
  controlButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
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
    fontSize: 11,
    color: "#FFF",
    marginTop: 2,
    textAlign: "center",
  },
  endCallButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
  },
});