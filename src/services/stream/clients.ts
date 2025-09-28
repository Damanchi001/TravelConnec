import { StreamVideoClient } from '@stream-io/video-react-native-sdk';
import { connect } from 'getstream';
import { StreamChat } from 'stream-chat';

// Chat client
const chatApiKey = process.env.EXPO_PUBLIC_STREAM_CHAT_API_KEY;
console.log('[StreamClients] Chat API key present:', !!chatApiKey, chatApiKey ? chatApiKey.substring(0, 10) + '...' : 'undefined');

let chatClient: StreamChat | null = null;

if (chatApiKey) {
  try {
    chatClient = StreamChat.getInstance(chatApiKey);
    console.log('[StreamClients] Chat client initialized successfully');
  } catch (error) {
    console.error('[StreamClients] Failed to initialize chat client:', error);
  }
} else {
  console.warn('[StreamClients] EXPO_PUBLIC_STREAM_CHAT_API_KEY is not set - chat features will be disabled');
}

export { chatClient };

// Video client
const videoApiKey = process.env.EXPO_PUBLIC_STREAM_VIDEO_API_KEY;
let videoClient: StreamVideoClient | null = null;
if (videoApiKey) {
  try {
    videoClient = new StreamVideoClient({
      apiKey: videoApiKey,
      user: { id: '' }, // Will be set when user connects
      token: '', // Will be set when user connects
    });
  } catch (error) {
    console.warn('Failed to initialize StreamVideoClient:', error);
  }
} else {
  console.warn('EXPO_PUBLIC_STREAM_VIDEO_API_KEY is not set - video features will be disabled');
}
export { videoClient };

// Feeds client - will be initialized with user when authenticated
const feedsApiKey = process.env.EXPO_PUBLIC_STREAM_FEEDS_API_KEY;
const feedsAppId = process.env.EXPO_PUBLIC_STREAM_FEEDS_APP_ID;
console.log('[StreamClients] Feeds API key present:', !!feedsApiKey, feedsApiKey ? feedsApiKey.substring(0, 10) + '...' : 'undefined');
console.log('[StreamClients] Feeds App ID present:', !!feedsAppId, feedsAppId ? feedsAppId : 'undefined');

let feedsClient: any = null;

if (feedsApiKey && feedsAppId) {
  try {
    feedsClient = connect(feedsApiKey, null, feedsAppId);
    console.log('[StreamClients] Feeds client initialized successfully');
  } catch (error) {
    console.warn('Failed to initialize Stream feeds client:', error);
  }
} else {
  console.warn('EXPO_PUBLIC_STREAM_FEEDS_API_KEY or EXPO_PUBLIC_STREAM_FEEDS_APP_ID is not set - feeds features will be disabled');
}

export { feedsClient };

export default {
  chatClient,
  videoClient,
  feedsClient,
};