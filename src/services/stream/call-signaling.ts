import { NotificationService } from '../notifications';
import { supabase } from '../supabase/client';
import { videoService } from './video-service';

export interface CallData {
  id: string;
  callerId: string;
  calleeId: string;
  type: 'voice' | 'video';
  status: 'ringing' | 'accepted' | 'rejected' | 'ended' | 'missed';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  createdAt: Date;
}

export interface IncomingCallData {
  callId: string;
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  type: 'voice' | 'video';
}

export class CallSignalingService {
  private activeCalls = new Map<string, CallData>();
  private incomingCallListeners = new Set<(call: IncomingCallData) => void>();

  /**
   * Initiate a call to another user
   */
  async initiateCall(
    callerId: string,
    calleeId: string,
    type: 'voice' | 'video'
  ): Promise<{ success: boolean; callId?: string; error?: string }> {
    try {
      // Generate unique call ID
      const callId = `call_${callerId}_${calleeId}_${Date.now()}`;

      // Create call data
      const callData: CallData = {
        id: callId,
        callerId,
        calleeId,
        type,
        status: 'ringing',
        createdAt: new Date(),
      };

      // Store active call
      this.activeCalls.set(callId, callData);

      // Create Stream call
      const call = await videoService.createCall(callId, [callerId, calleeId]);

      // Send push notification to callee
      await this.sendCallNotification(calleeId, {
        callId,
        callerId,
        type,
        callerName: 'Unknown', // Will be resolved by notification service
      });

      // Set timeout for call ringing (30 seconds)
      setTimeout(() => {
        const call = this.activeCalls.get(callId);
        if (call && call.status === 'ringing') {
          this.endCall(callId, 'missed');
        }
      }, 30000);

      return { success: true, callId };
    } catch (error) {
      console.error('Failed to initiate call:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Accept an incoming call
   */
  async acceptCall(callId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const call = this.activeCalls.get(callId);
      if (!call) {
        return { success: false, error: 'Call not found' };
      }

      // Update call status
      call.status = 'accepted';
      call.startTime = new Date();

      // Join the call
      await videoService.joinCall(callId);

      // Notify caller that call was accepted
      await this.sendCallResponseNotification(call.callerId, callId, 'accepted');

      return { success: true };
    } catch (error) {
      console.error('Failed to accept call:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Reject an incoming call
   */
  async rejectCall(callId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const call = this.activeCalls.get(callId);
      if (!call) {
        return { success: false, error: 'Call not found' };
      }

      // Update call status
      call.status = 'rejected';

      // Notify caller that call was rejected
      await this.sendCallResponseNotification(call.callerId, callId, 'rejected');

      // Clean up call
      this.activeCalls.delete(callId);

      return { success: true };
    } catch (error) {
      console.error('Failed to reject call:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * End an active call
   */
  async endCall(callId: string, reason: 'ended' | 'missed' = 'ended'): Promise<{ success: boolean; error?: string }> {
    try {
      const call = this.activeCalls.get(callId);
      if (!call) {
        return { success: false, error: 'Call not found' };
      }

      // Update call status and timing
      call.status = reason;
      call.endTime = new Date();
      if (call.startTime) {
        call.duration = Math.floor((call.endTime.getTime() - call.startTime.getTime()) / 1000);
      }

      // Leave the call
      await videoService.leaveCall(callId);

      // Log call to database
      await this.logCallToDatabase(call);

      // Clean up
      this.activeCalls.delete(callId);

      return { success: true };
    } catch (error) {
      console.error('Failed to end call:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Send push notification for incoming call
   */
  private async sendCallNotification(
    calleeId: string,
    callData: { callId: string; callerId: string; type: 'voice' | 'video'; callerName: string }
  ): Promise<void> {
    try {
      // Get caller profile for name/avatar
      const { data: callerProfile } = await supabase
        .from('user_profiles')
        .select('first_name, last_name, avatar_url')
        .eq('id', callData.callerId)
        .single();

      const callerName = callerProfile
        ? `${callerProfile.first_name} ${callerProfile.last_name}`.trim()
        : 'Unknown Caller';

      // Send push notification
      await NotificationService.sendCallNotification(calleeId, {
        callId: callData.callId,
        callerName,
        callerAvatar: callerProfile?.avatar_url,
        type: callData.type,
      });

      // Also notify via real-time subscription
      this.notifyIncomingCall({
        callId: callData.callId,
        callerId: callData.callerId,
        callerName,
        callerAvatar: callerProfile?.avatar_url,
        type: callData.type,
      });
    } catch (error) {
      console.error('Failed to send call notification:', error);
    }
  }

  /**
   * Send notification about call response (accepted/rejected)
   */
  private async sendCallResponseNotification(
    callerId: string,
    callId: string,
    response: 'accepted' | 'rejected'
  ): Promise<void> {
    try {
      await NotificationService.sendCallResponseNotification(callerId, callId, response);
    } catch (error) {
      console.error('Failed to send call response notification:', error);
    }
  }

  /**
   * Log completed call to database
   */
  private async logCallToDatabase(call: CallData): Promise<void> {
    try {
      await supabase.from('call_logs').insert({
        id: call.id,
        caller_id: call.callerId,
        callee_id: call.calleeId,
        type: call.type,
        status: call.status,
        start_time: call.startTime?.toISOString(),
        end_time: call.endTime?.toISOString(),
        duration: call.duration,
        created_at: call.createdAt.toISOString(),
      });
    } catch (error) {
      console.error('Failed to log call to database:', error);
    }
  }

  /**
   * Listen for incoming calls
   */
  onIncomingCall(callback: (call: IncomingCallData) => void): () => void {
    this.incomingCallListeners.add(callback);
    return () => this.incomingCallListeners.delete(callback);
  }

  /**
   * Notify listeners of incoming call
   */
  private notifyIncomingCall(call: IncomingCallData): void {
    this.incomingCallListeners.forEach(listener => {
      try {
        listener(call);
      } catch (error) {
        console.error('Error in incoming call listener:', error);
      }
    });
  }

  /**
   * Get active call for user
   */
  getActiveCall(userId: string): CallData | null {
    for (const call of this.activeCalls.values()) {
      if ((call.callerId === userId || call.calleeId === userId) &&
          (call.status === 'ringing' || call.status === 'accepted')) {
        return call;
      }
    }
    return null;
  }

  /**
   * Check if user is in a call
   */
  isUserInCall(userId: string): boolean {
    return this.getActiveCall(userId) !== null;
  }

  /**
   * Get call history for user
   */
  async getCallHistory(userId: string, limit = 50): Promise<CallData[]> {
    try {
      const { data, error } = await supabase
        .from('call_logs')
        .select('*')
        .or(`caller_id.eq.${userId},callee_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map(row => ({
        id: row.id,
        callerId: row.caller_id,
        calleeId: row.callee_id,
        type: row.type,
        status: row.status,
        startTime: row.start_time ? new Date(row.start_time) : undefined,
        endTime: row.end_time ? new Date(row.end_time) : undefined,
        duration: row.duration,
        createdAt: new Date(row.created_at),
      }));
    } catch (error) {
      console.error('Failed to get call history:', error);
      return [];
    }
  }
}

export const callSignalingService = new CallSignalingService();