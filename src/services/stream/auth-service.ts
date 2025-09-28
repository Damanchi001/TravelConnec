import { supabase } from '../supabase/client';
import { chatClient, feedsClient, videoClient } from './clients';

export class StreamAuthService {
  private chatToken: string | null = null;
  private videoToken: string | null = null;
  private feedsToken: string | null = null;

  /**
   * Connect user to all Stream services
   */
  async connectUser(userId: string) {
    try {
      console.log('[StreamAuthService] Connecting user to Stream services:', userId);

      // Get tokens from backend (you'll need to implement this endpoint)
      const tokens = await this.getStreamTokens(userId);
      console.log('[StreamAuthService] Retrieved tokens:', {
        hasChatToken: !!tokens.chatToken,
        hasVideoToken: !!tokens.videoToken,
        hasFeedsToken: !!tokens.feedsToken
      });

      // Connect to chat
      if (tokens.chatToken && chatClient) {
        console.log('[StreamAuthService] Connecting to chat service');
        await chatClient.connectUser(
          { id: userId },
          tokens.chatToken
        );
        this.chatToken = tokens.chatToken;
        console.log('[StreamAuthService] Successfully connected to chat');
      } else if (!chatClient) {
        console.warn('[StreamAuthService] Chat client not initialized - skipping chat connection');
      }

      // Connect to video
      if (tokens.videoToken && videoClient) {
        console.log('[StreamAuthService] Connecting to video service');
        videoClient.connectUser(
          { id: userId },
          tokens.videoToken
        );
        this.videoToken = tokens.videoToken;
        console.log('[StreamAuthService] Successfully connected to video');
      }

      // Connect to feeds
      if (tokens.feedsToken && feedsClient) {
        feedsClient.setUser({
          id: userId,
          token: tokens.feedsToken,
        });
        this.feedsToken = tokens.feedsToken;
      }

      console.log('[StreamAuthService] All Stream services connected successfully');
      return { success: true };
    } catch (error) {
      console.error('[StreamAuthService] Failed to connect user to Stream services:', error);
      return { success: false, error };
    }
  }

  /**
   * Disconnect user from all Stream services
   */
  async disconnectUser() {
    try {
      if (chatClient) {
        await chatClient.disconnectUser();
      }
      if (videoClient) {
        await videoClient.disconnectUser();
      }
      // feedsClient doesn't have a disconnect method, just clear the user
      if (feedsClient) {
        feedsClient.user = null;
      }

      this.chatToken = null;
      this.videoToken = null;
      this.feedsToken = null;

      return { success: true };
    } catch (error) {
      console.error('Failed to disconnect user from Stream services:', error);
      return { success: false, error };
    }
  }

  /**
   * Get Stream tokens from backend
   * This should be implemented as a Supabase Edge Function or API endpoint
   */
  private async getStreamTokens(userId: string) {
    console.log(`[StreamAuthService] Attempting to get tokens for user ${userId}`);

    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('[StreamAuthService] Current user auth status:', {
        isAuthenticated: !!user,
        userId: user?.id,
        authError: authError?.message
      });

      if (authError || !user) {
        console.error('[StreamAuthService] User not authenticated:', authError);
        throw new Error('User not authenticated');
      }

      console.log('[StreamAuthService] Calling supabase function get-stream-tokens');
      // For now, return mock tokens - replace with actual backend call
      try {
        const response = await supabase.functions.invoke('get-stream-tokens', {
          body: { userId }
        });

        console.log('[StreamAuthService] Supabase response data:', response.data);
        console.log('[StreamAuthService] Supabase response error:', response.error);

        if (response.error) {
          console.error('[StreamAuthService] Supabase function error:', response.error);
          throw response.error;
        }

        console.log('[StreamAuthService] Successfully got tokens from backend');
        return response.data;
      } catch (funcError) {
        console.warn('[StreamAuthService] Supabase function failed, using mock tokens for development:', funcError);
        // Return mock tokens for development
        return {
          chatToken: 'mock-chat-token-' + userId,
          videoToken: 'mock-video-token-' + userId,
          feedsToken: 'mock-feeds-token-' + userId
        };
      }
    } catch (error) {
      console.error('[StreamAuthService] Backend token generation failed:', error);
      if (error instanceof Error) {
        console.error('[StreamAuthService] Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      throw new Error('Failed to generate Stream tokens. Please check server configuration.');
    }
  }


  /**
   * Check if user is connected to Stream services
   */
  isConnected(): boolean {
    return (chatClient?.userID !== null && chatClient?.userID !== undefined) || this.videoToken !== null;
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): string | null {
    return chatClient?.userID || null;
  }
}

export const streamAuthService = new StreamAuthService();