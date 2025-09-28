import { Call, StreamVideoClient } from '@stream-io/video-react-native-sdk';
import { videoClient } from './clients';

export class VideoService {
  private client: StreamVideoClient | null;

  constructor() {
    this.client = videoClient;
  }

  async createCall(callId: string, members: string[]): Promise<Call> {
    if (!this.client) {
      throw new Error('Stream video client not initialized');
    }
    const call = this.client.call('default', callId);

    await call.getOrCreate({
      data: {
        members: members.map(id => ({ user_id: id })),
        settings_override: {
          audio: { default_device: 'speaker' },
          video: { camera_default_on: true },
        },
      },
    });

    return call;
  }

  async joinCall(callId: string): Promise<Call> {
    if (!this.client) {
      throw new Error('Stream video client not initialized');
    }
    const call = this.client.call('default', callId);
    await call.join();
    return call;
  }

  async leaveCall(callId: string) {
    if (!this.client) {
      throw new Error('Stream video client not initialized');
    }
    const call = this.client.call('default', callId);
    await call.leave();
  }

  async toggleAudio(callId: string) {
    if (!this.client) {
      throw new Error('Stream video client not initialized');
    }
    const call = this.client.call('default', callId);
    await call.microphone.toggle();
  }

  async toggleVideo(callId: string) {
    if (!this.client) {
      throw new Error('Stream video client not initialized');
    }
    const call = this.client.call('default', callId);
    await call.camera.toggle();
  }

  async switchCamera(callId: string) {
    if (!this.client) {
      throw new Error('Stream video client not initialized');
    }
    const call = this.client.call('default', callId);
    await call.camera.flip();
  }

  async toggleScreenShare(callId: string) {
    if (!this.client) {
      throw new Error('Stream video client not initialized');
    }
    const call = this.client.call('default', callId);
    await call.screenShare.toggle();
  }

  // Get active call
  getActiveCall(callId: string): Call | null {
    if (!this.client) {
      return null;
    }
    try {
      return this.client.call('default', callId);
    } catch {
      return null;
    }
  }

  // Check if call is active
  isCallActive(callId: string): boolean {
    const call = this.getActiveCall(callId);
    return call?.state.callingState === 'joined';
  }

  // Get call participants
  getCallParticipants(callId: string) {
    const call = this.getActiveCall(callId);
    return call?.state.participants || [];
  }
}

export const videoService = new VideoService();