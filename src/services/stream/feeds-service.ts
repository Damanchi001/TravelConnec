import { StreamClient } from 'getstream';
import { feedsClient } from './clients';

export class FeedsService {
  private isMockToken = false;

  /**
   * Set the user for feeds operations
   */
  setUser(userId: string, token: string) {
    this.isMockToken = token.startsWith('mock-');
    if (feedsClient) {
      feedsClient.setUser({
        id: userId,
        token: token,
      });
    }
  }

  /**
   * Get the current feeds client (must be initialized with user token first)
   */
  private getClient(): StreamClient | null {
    return feedsClient;
  }

  /**
   * Get user feed (timeline)
   */
  async getUserFeed(userId: string, limit: number = 20, offset?: number) {
    const client = this.getClient();
    if (!client) {
      throw new Error('Stream feeds client not initialized - user token required');
    }
    const userFeed = client.feed('user', userId);
    return await userFeed.get({ limit, offset });
  }

  /**
   * Get timeline feed (aggregated feed for user)
   */
  async getTimelineFeed(userId: string, limit: number = 20, offset?: number) {
    const client = this.getClient();
    if (!client) {
      throw new Error('Stream feeds client not initialized');
    }

    // Check if user is properly authenticated
    if (!client.currentUser) {
      throw new Error('User not authenticated with Stream feeds client');
    }

    const timelineFeed = client.feed('timeline', userId);
    return await timelineFeed.get({ limit, offset });
  }

  /**
   * Add activity to user feed
   */
  async addActivity(
    userId: string,
    activity: {
      actor: string;
      verb: string;
      object: string;
      foreign_id?: string;
      time?: string;
      to?: string[];
      target?: string;
      data?: any;
    }
  ) {
    const client = this.getClient();
    if (!client) {
      throw new Error('Stream feeds client not initialized');
    }
    const userFeed = client.feed('user', userId);
    return await userFeed.addActivity(activity);
  }

  /**
   * Follow another user's feed
   */
  async followUser(followerId: string, followingId: string) {
    const client = this.getClient();
    if (!client) {
      throw new Error('Stream feeds client not initialized');
    }
    const timelineFeed = client.feed('timeline', followerId);
    return await timelineFeed.follow('user', followingId);
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(followerId: string, followingId: string) {
    const client = this.getClient();
    if (!client) {
      throw new Error('Stream feeds client not initialized');
    }
    const timelineFeed = client.feed('timeline', followerId);
    return await timelineFeed.unfollow('user', followingId);
  }

  /**
   * Get followers of a user
   */
  async getFollowers(userId: string, limit: number = 20, offset?: number) {
    const client = this.getClient();
    if (!client) {
      throw new Error('Stream feeds client not initialized');
    }
    const userFeed = client.feed('user', userId);
    return await userFeed.followers({ limit, offset });
  }

  /**
   * Get users that a user is following
   */
  async getFollowing(userId: string, limit: number = 20, offset?: number) {
    const client = this.getClient();
    if (!client) {
      throw new Error('Stream feeds client not initialized');
    }
    const userFeed = client.feed('user', userId);
    return await userFeed.following({ limit, offset });
  }

  /**
   * Add reaction to activity
   */
  async addReaction(
    activityId: string,
    kind: string,
    userId: string,
    data?: any
  ) {
    const client = this.getClient();
    if (!client) {
      throw new Error('Stream feeds client not initialized');
    }

    // Check if using mock token (for development)
    if (client.currentUser?.token?.startsWith('mock-')) {
      console.log('[FeedsService] Using mock token, skipping API call for addReaction');
      // Return mock reaction
      return {
        id: `mock-reaction-${activityId}-${kind}-${userId}`,
        kind,
        activity_id: activityId,
        user_id: userId,
        data,
        created_at: new Date().toISOString()
      };
    }

    const reaction = await client.reactions.add(
      kind,
      activityId,
      data,
      { userId }
    );
    return reaction;
  }

  /**
   * Remove reaction from activity
   */
  async removeReaction(reactionId: string) {
    const client = this.getClient();
    if (!client) {
      throw new Error('Stream feeds client not initialized');
    }
    return await client.reactions.delete(reactionId);
  }

  /**
   * Get reactions for activity
   */
  async getReactions(activityId: string, kind?: string, limit: number = 20) {
    const client = this.getClient();
    if (!client) {
      throw new Error('Stream feeds client not initialized');
    }

    // Check if using mock token (for development)
    if (client.currentUser?.token?.startsWith('mock-')) {
      console.log('[FeedsService] Using mock token, returning mock reactions for getReactions');
      // Return mock reactions
      return {
        results: [], // No reactions for mock
        next: null
      };
    }

    return await client.reactions.filter({
      activity_id: activityId,
      kind,
      limit,
    });
  }

  /**
   * Create notification feed for user
   */
  async getNotificationFeed(userId: string, limit: number = 20, offset?: number) {
    const client = this.getClient();
    if (!client) {
      throw new Error('Stream feeds client not initialized');
    }
    const notificationFeed = client.feed('notification', userId);
    return await notificationFeed.get({ limit, offset });
  }

  /**
   * Remove activity from feed
   */
  async removeActivity(userId: string, activityId: string) {
    const client = this.getClient();
    if (!client) {
      throw new Error('Stream feeds client not initialized');
    }
    const userFeed = client.feed('user', userId);
    return await userFeed.removeActivity(activityId);
  }
}

export const feedsService = new FeedsService();