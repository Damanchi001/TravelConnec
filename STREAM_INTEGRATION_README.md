# Stream.io Integration

This document outlines the Stream.io integration implemented for social timeline/feeds, messaging, and voice/video calling services.

## Overview

The application now integrates with Stream.io to provide:
- **Activity Feeds**: Social timeline with posts, likes, comments, and follows
- **Chat**: Real-time messaging between users
- **Video Calling**: Voice and video calls with screen sharing

## Architecture

### Services Structure
```
src/services/stream/
├── clients.ts          # Stream client configurations
├── auth-service.ts     # User authentication for Stream
├── chat-service.ts     # Chat functionality
├── feeds-service.ts    # Activity feeds functionality
├── video-service.ts    # Video calling functionality
└── index.ts           # Service exports
```

### Components Updated
- `ActivityFeed`: Now fetches from Stream feeds API
- `ChatScreen`: Integrated with Stream chat
- `IncomingCallModal`: Uses Stream video for calls

## Setup Instructions

### 1. Create Stream.io Account
1. Go to [Stream.io](https://getstream.io/)
2. Create a free account
3. Set up your applications for Chat, Feeds, and Video

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your Stream credentials:

```env
EXPO_PUBLIC_STREAM_CHAT_API_KEY=your_chat_api_key
EXPO_PUBLIC_STREAM_VIDEO_API_KEY=your_video_api_key
EXPO_PUBLIC_STREAM_FEEDS_API_KEY=your_feeds_api_key
EXPO_PUBLIC_STREAM_FEEDS_APP_ID=your_feeds_app_id
```

### 3. Install Dependencies
The required packages are already installed:
- `stream-chat`
- `@stream-io/video-react-native-sdk`
- `getstream`

## Features Implemented

### Activity Feeds
- Fetch user timeline
- Add new activities/posts
- Follow/unfollow users
- Like and comment on posts
- Real-time updates

### Chat
- Direct messaging between users
- Channel management
- Message reactions
- File uploads
- Typing indicators
- Read receipts

### Video Calling
- Create and join calls
- Voice and video toggle
- Screen sharing
- Camera switching
- Call management
- Push notifications for incoming calls

### Push Notifications
- Automatic device registration with Stream
- Push notifications for new chat messages
- Push notifications for incoming video calls
- Integration with Expo Notifications
- In-app notification handling

## Usage Examples

### Initialize Stream Services
```typescript
import { streamAuthService } from '../services/stream';

// Connect user to all Stream services
await streamAuthService.connectUser(userId);
```

### Send a Chat Message
```typescript
import { chatService } from '../services/stream';

// Send message to a channel
await chatService.sendMessage(channelId, 'Hello World!');
```

### Add Activity to Feed
```typescript
import { feedsService } from '../services/stream';

// Add a post to user's feed
await feedsService.addActivity(userId, {
  actor: userId,
  verb: 'post',
  object: 'Check out this amazing view!',
  data: { post_type: 'text' }
});
```

### Start a Video Call
```typescript
import { videoService } from '../services/stream';

// Create a call
const call = await videoService.createCall(callId, [userId, otherUserId]);

// Join the call
await videoService.joinCall(callId);
```

## Current Status

✅ **Completed:**
- Stream SDK installation and configuration
- Service layer implementation
- Component integration
- Basic error handling
- Environment setup

✅ **Completed:**
- Push notifications for messages/calls
- Advanced error handling
- Offline support
- Testing with real Stream credentials

## Next Steps

1. **Set up Stream Dashboard**: Configure your apps in Stream dashboard
2. **Add Environment Variables**: Set up your API keys
3. **Test Integration**: Verify all services work with real credentials
4. **Offline Support**: Add offline functionality and sync
5. **Error Handling**: Improve error handling and user feedback

## Troubleshooting

### Common Issues

1. **Missing API Keys**: Ensure all environment variables are set
2. **Authentication Errors**: Check user tokens are valid
3. **Network Issues**: Verify internet connection and Stream service status

### Fallback Behavior

The app includes fallback to mock data when Stream services are unavailable, ensuring the app remains functional during development or service outages.

## API Reference

For detailed API documentation, refer to:
- [Stream Chat Documentation](https://getstream.io/chat/docs/)
- [Stream Feeds Documentation](https://getstream.io/activity-feeds/docs/)
- [Stream Video Documentation](https://getstream.io/video/docs/)

## Support

For issues with Stream integration:
1. Check Stream dashboard for service status
2. Review API key configuration
3. Check application logs for error details
4. Refer to Stream documentation for specific features