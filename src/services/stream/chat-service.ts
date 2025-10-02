import { Channel } from 'stream-chat';
import { chatClient } from './clients';

export class ChatService {
  async connectUser(user: any, token: string) {
    if (!chatClient) {
      throw new Error('Chat client not initialized');
    }

    console.log('[ChatService] Connecting user to Stream Chat:', {
      id: user.id,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      hasImage: !!user.avatar_url
    });

    await chatClient.connectUser(
      {
        id: user.id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User',
        image: user.avatar_url || undefined,
        role: user.role || 'user',
      },
      token
    );

    console.log('[ChatService] User connected to Stream Chat successfully');
  }

  async disconnectUser() {
    if (!chatClient) {
      console.warn('Chat client not initialized - cannot disconnect');
      return;
    }
    await chatClient.disconnectUser();
  }

  async createChannel(
    type: string,
    members: string[],
    data?: {
      name?: string;
      image?: string;
      booking_id?: string;
      listing_id?: string;
    }
  ): Promise<Channel> {
    if (!chatClient) {
      throw new Error('Chat client not initialized');
    }
    const channel = chatClient.channel(type, {
      members,
      ...data,
    });

    await channel.create();
    return channel;
  }

  async getOrCreateDirectMessage(userId: string, otherUserId: string): Promise<Channel> {
    if (!chatClient) {
      throw new Error('Chat client not initialized');
    }

    // Check if user is connected to chat
    if (!chatClient.userID) {
      throw new Error('User not connected to chat. Call connectUser first.');
    }

    // Ensure the connected user matches the requested user
    if (chatClient.userID !== userId) {
      throw new Error(`Connected user (${chatClient.userID}) does not match requested user (${userId})`);
    }

    const channelId = [userId, otherUserId].sort().join('-');

    console.log('[ChatService] Creating/getting direct message channel:', channelId);

    const channel = chatClient.channel('messaging', channelId, {
      members: [userId, otherUserId],
    });

    await channel.create();
    console.log('[ChatService] Channel created successfully:', channel.id);

    return channel;
  }

  async getUserChannels(userId: string): Promise<Channel[]> {
    if (!chatClient) {
      throw new Error('Chat client not initialized');
    }
    const filter = { members: { $in: [userId] } };

    const channels = await chatClient.queryChannels(filter, undefined, {
      watch: true,
      presence: true,
    });

    return channels;
  }

  async getChannelById(channelId: string, type: string = 'messaging'): Promise<Channel> {
    if (!chatClient) {
      throw new Error('Chat client not initialized');
    }
    const channel = chatClient.channel(type, channelId);
    await channel.watch();
    return channel;
  }

  async markChannelRead(channelId: string) {
    if (!chatClient) {
      throw new Error('Chat client not initialized');
    }
    const channel = chatClient.channel('messaging', channelId);
    await channel.markRead();
  }

  // Message reactions
  async addReaction(channelId: string, messageId: string, type: string) {
    if (!chatClient) {
      throw new Error('Chat client not initialized');
    }
    const channel = chatClient.channel('messaging', channelId);
    await channel.sendReaction(messageId, { type });
  }

  async removeReaction(channelId: string, messageId: string, type: string) {
    if (!chatClient) {
      throw new Error('Chat client not initialized');
    }
    const channel = chatClient.channel('messaging', channelId);
    await channel.deleteReaction(messageId, type);
  }

  // File uploads
  async uploadFile(channelId: string, file: any): Promise<string> {
    if (!chatClient) {
      throw new Error('Chat client not initialized');
    }
    const channel = chatClient.channel('messaging', channelId);
    const response = await channel.sendFile(file);
    return response.file;
  }

  // Typing indicators
  async startTyping(channelId: string) {
    if (!chatClient) {
      throw new Error('Chat client not initialized');
    }
    const channel = chatClient.channel('messaging', channelId);
    await channel.keystroke();
  }

  async stopTyping(channelId: string) {
    if (!chatClient) {
      throw new Error('Chat client not initialized');
    }
    const channel = chatClient.channel('messaging', channelId);
    await channel.stopTyping();
  }

  // Send message
  async sendMessage(channelId: string, message: string, attachments?: any[]) {
    if (!chatClient) {
      throw new Error('Chat client not initialized');
    }
    const channel = chatClient.channel('messaging', channelId);
    return await channel.sendMessage({
      text: message,
      attachments: attachments || [],
    });
  }

  // Get channel messages
  async getChannelMessages(channelId: string, limit: number = 50) {
    if (!chatClient) {
      throw new Error('Chat client not initialized');
    }
    const channel = chatClient.channel('messaging', channelId);
    return await channel.query({
      messages: { limit },
    });
  }

  // Listen to channel events
  onChannelEvent(channelId: string, eventType: any, callback: (event: any) => void) {
    if (!chatClient) {
      throw new Error('Chat client not initialized');
    }
    const channel = chatClient.channel('messaging', channelId);
    return channel.on(eventType, callback);
  }

  // Listen to client events
  onClientEvent(eventType: any, callback: (event: any) => void) {
    if (!chatClient) {
      throw new Error('Chat client not initialized');
    }
    return chatClient.on(eventType, callback);
  }
}

export const chatService = new ChatService();