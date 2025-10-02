import { Call } from '@stream-io/video-react-native-sdk';

export interface CallQualityMetrics {
  callId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  audioQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
  videoQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
  connectionStability: 'stable' | 'unstable' | 'dropped';
  networkLatency: number; // in ms
  packetLoss: number; // percentage
  bandwidth: number; // kbps
  errors: CallError[];
}

export interface CallError {
  timestamp: Date;
  type: 'network' | 'audio' | 'video' | 'permission' | 'unknown';
  message: string;
  recoverable: boolean;
}

export class CallQualityMonitor {
  private activeCalls = new Map<string, CallQualityMetrics>();
  private monitoringIntervals = new Map<string, NodeJS.Timeout>();

  /**
   * Start monitoring a call
   */
  startMonitoring(callId: string, call: Call): void {
    const metrics: CallQualityMetrics = {
      callId,
      startTime: new Date(),
      audioQuality: 'good',
      videoQuality: 'good',
      connectionStability: 'stable',
      networkLatency: 0,
      packetLoss: 0,
      bandwidth: 0,
      errors: [],
    };

    this.activeCalls.set(callId, metrics);

    // Monitor call quality every 5 seconds
    const interval = setInterval(() => {
      this.updateQualityMetrics(callId, call);
    }, 5000);

    this.monitoringIntervals.set(callId, interval);

    // Listen for call events
    this.setupCallEventListeners(callId, call);
  }

  /**
   * Stop monitoring a call
   */
  stopMonitoring(callId: string): CallQualityMetrics | null {
    const interval = this.monitoringIntervals.get(callId);
    if (interval) {
      clearInterval(interval);
      this.monitoringIntervals.delete(callId);
    }

    const metrics = this.activeCalls.get(callId);
    if (metrics) {
      metrics.endTime = new Date();
      metrics.duration = (metrics.endTime.getTime() - metrics.startTime.getTime()) / 1000;
      this.activeCalls.delete(callId);
      return metrics;
    }

    return null;
  }

  /**
   * Update quality metrics for a call
   */
  private updateQualityMetrics(callId: string, call: Call): void {
    const metrics = this.activeCalls.get(callId);
    if (!metrics) return;

    try {
      // Get basic call state information
      const callState = call.state;
      const isConnected = callState.callingState === 'joined';
      const participantCount = callState.participants.length;

      // Basic quality assessment based on call state
      if (!isConnected) {
        metrics.connectionStability = 'dropped';
        metrics.audioQuality = 'disconnected';
        metrics.videoQuality = 'disconnected';
      } else if (participantCount <= 1) {
        // Call connected but only current user or no other participants
        metrics.connectionStability = 'stable';
        metrics.audioQuality = 'good';
        metrics.videoQuality = 'good';
      } else {
        // Call is active with multiple participants
        metrics.connectionStability = 'stable';
        metrics.audioQuality = 'excellent'; // Assume good quality
        metrics.videoQuality = 'excellent'; // Assume good quality
      }

      // Set default network metrics (would be populated by actual stats in production)
      metrics.networkLatency = 50; // mock value
      metrics.packetLoss = 0; // mock value
      metrics.bandwidth = 1000; // mock value

    } catch (error) {
      console.error('Failed to update call quality metrics:', error);
      this.recordError(callId, 'unknown', 'Failed to update quality metrics');
    }
  }

  /**
   * Setup call event listeners
   */
  private setupCallEventListeners(callId: string, call: Call): void {
    // Basic error monitoring - in a production app, you'd set up proper event listeners
    // For now, we'll rely on periodic quality checks
    console.log(`Started monitoring call: ${callId}`);
  }

  /**
   * Record an error during the call
   */
  recordError(callId: string, type: CallError['type'], message: string, recoverable = true): void {
    const metrics = this.activeCalls.get(callId);
    if (metrics) {
      metrics.errors.push({
        timestamp: new Date(),
        type,
        message,
        recoverable,
      });
    }
  }

  /**
   * Get current metrics for a call
   */
  getMetrics(callId: string): CallQualityMetrics | null {
    return this.activeCalls.get(callId) || null;
  }

  /**
   * Get all active call metrics
   */
  getAllActiveMetrics(): CallQualityMetrics[] {
    return Array.from(this.activeCalls.values());
  }

  /**
   * Check if call quality is poor
   */
  isCallQualityPoor(callId: string): boolean {
    const metrics = this.activeCalls.get(callId);
    if (!metrics) return false;

    return (
      metrics.audioQuality === 'poor' ||
      metrics.videoQuality === 'poor' ||
      metrics.connectionStability === 'unstable' ||
      metrics.networkLatency > 300 ||
      metrics.packetLoss > 8
    );
  }

  /**
   * Get quality recommendations
   */
  getQualityRecommendations(callId: string): string[] {
    const metrics = this.activeCalls.get(callId);
    if (!metrics) return [];

    const recommendations: string[] = [];

    if (metrics.networkLatency > 300) {
      recommendations.push('High latency detected. Try switching to a better network connection.');
    }

    if (metrics.packetLoss > 8) {
      recommendations.push('Packet loss detected. Check your internet connection.');
    }

    if (metrics.audioQuality === 'poor') {
      recommendations.push('Audio quality is poor. Try moving closer to your router or switching networks.');
    }

    if (metrics.videoQuality === 'poor') {
      recommendations.push('Video quality is poor. Reduce video resolution or check your camera.');
    }

    if (metrics.connectionStability === 'unstable') {
      recommendations.push('Connection is unstable. Try restarting your call or switching networks.');
    }

    return recommendations;
  }
}

export const callQualityMonitor = new CallQualityMonitor();