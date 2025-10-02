import { useMessageStore } from '@/src/stores/message-store';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  useFonts,
} from "@expo-google-fonts/poppins";
import {
  Call,
  CallContent,
  StreamCall,
  useStreamVideoClient
} from '@stream-io/video-react-native-sdk';
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Camera,
  Mic,
  PhoneOff,
  RotateCcw,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { callQualityMonitor } from '../../../src/services/stream/call-quality-monitor';
import { callSignalingService } from '../../../src/services/stream/call-signaling';
import { videoService } from '../../../src/services/stream/video-service';
import { useAuthStore } from '../../../src/stores/auth-store';

export default function VideoCallScreen() {
  const insets = useSafeAreaInsets();
  const { callId } = useLocalSearchParams();
  const { currentCall, updateCurrentCall } = useMessageStore();
  const { profile: currentUser } = useAuthStore();
  const videoClient = useStreamVideoClient();

  const [call, setCall] = useState<Call | null>(null);
  const [callData, setCallData] = useState<any>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  useEffect(() => {
    const initializeCall = async () => {
      try {
        if (!videoClient || !currentUser?.id || !callId) {
          console.error('Missing required data for call initialization');
          router.back();
          return;
        }

        // Get call data from signaling service
        const activeCall = callSignalingService.getActiveCall(currentUser.id);
        if (activeCall && activeCall.id === callId) {
          setCallData(activeCall);

          // Create Stream call instance
          const streamCall = videoClient.call('default', callId as string);

          // Get or create the call
          await streamCall.getOrCreate({
            data: {
              members: [
                { user_id: activeCall.callerId },
                { user_id: activeCall.calleeId }
              ],
              settings_override: {
                audio: { default_device: 'speaker' },
                video: { camera_default_on: true },
              },
            },
          });

          setCall(streamCall);

          // Join the call
          await streamCall.join();
          setIsConnected(true);

          // Start quality monitoring
          callQualityMonitor.startMonitoring(callId as string, streamCall);

          if (!currentCall) {
            // Initialize call session
            updateCurrentCall({
              id: activeCall.id,
              type: activeCall.type,
              status: 'connected',
              direction: activeCall.callerId === currentUser.id ? 'outgoing' : 'incoming',
              participantId: activeCall.callerId === currentUser.id ? activeCall.calleeId : activeCall.callerId,
              participantName: 'Participant', // Would be fetched from profile
              participantAvatar: undefined,
              startTime: activeCall.startTime || new Date(),
            });
          }
        } else {
          console.error('Call not found or not active');
          router.back();
          return;
        }
      } catch (error) {
        console.error('Failed to initialize call:', error);
        Alert.alert('Call Error', 'Failed to connect to the call. Please try again.');
        router.back();
      }
    };

    initializeCall();

    // Start call duration timer
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
      // Cleanup will be handled in handleEndCall
    };
  }, [currentUser?.id, callId, videoClient, currentCall, updateCurrentCall]);

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
              if (callData?.id) {
                await callSignalingService.endCall(callData.id, 'ended');
              }
            } catch (error) {
              console.error('Failed to end call:', error);
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
    // For now, just toggle local state
    // In a full implementation, this would control actual audio
    setIsMuted(!isMuted);
  };

  const handleCameraToggle = async () => {
    // For now, just toggle local state
    // In a full implementation, this would control actual video
    setIsCameraOn(!isCameraOn);
  };

  const handleSpeakerToggle = () => {
    setIsSpeakerOn(!isSpeakerOn);
    // Note: Speaker toggle might need additional implementation
  };

  const handleSwitchCamera = async () => {
    // For now, just log the action
    // In a full implementation, this would switch camera
    console.log('Switching camera');
  };

  if (!call || !isConnected) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {call ? 'Connecting...' : 'Initializing call...'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <StreamCall call={call}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar style="light" />

        {/* Stream Call Content */}
        <CallContent />

        {/* Custom Controls */}
        <CustomCallControls callId={callId as string} onEndCall={handleEndCall} />

        {/* Call Duration Overlay */}
        <View style={styles.callDurationOverlay}>
          <Text style={styles.callDuration}>{formatDuration(callDuration)}</Text>
        </View>
      </View>
    </StreamCall>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 18,
    color: "#FFF",
  },
  callDurationOverlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
});

// Custom Call Controls Component
const CustomCallControls: React.FC<{ callId: string; onEndCall: () => void }> = ({ callId, onEndCall }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.controls, { paddingBottom: insets.bottom + 40 }]}>
      <View style={styles.controlButtons}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => videoService.toggleAudio(callId)}
        >
          <Mic size={24} color="#FFF" />
          <Text style={styles.controlButtonText}>Mute</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => videoService.toggleVideo(callId)}
        >
          <Camera size={24} color="#FFF" />
          <Text style={styles.controlButtonText}>Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => videoService.switchCamera(callId)}
        >
          <RotateCcw size={24} color="#FFF" />
          <Text style={styles.controlButtonText}>Switch</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.endCallButton} onPress={onEndCall}>
        <PhoneOff size={28} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};