// Message and Chat Types
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  read: boolean;
  type: 'text' | 'image' | 'file' | 'system';
  metadata?: {
    fileName?: string;
    fileSize?: number;
    imageUrl?: string;
    [key: string]: any;
  };
}

export interface ChatParticipant {
  id: string;
  name: string;
  avatar?: string;
  role?: 'admin' | 'member';
  online: boolean;
  lastSeen?: Date;
}

export interface Chat {
  id: string;
  type: 'direct' | 'group';
  name: string;
  avatar?: string;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface CallLog {
  id: string;
  type: 'voice' | 'video';
  direction: 'incoming' | 'outgoing';
  status: 'completed' | 'missed' | 'declined' | 'failed';
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  duration?: number; // in seconds
  timestamp: Date;
}

export interface CallSession {
  id: string;
  type: 'voice' | 'video';
  status: 'ringing' | 'connecting' | 'connected' | 'ended' | 'declined' | 'missed';
  direction: 'incoming' | 'outgoing';
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
}

export type CallStatus = 'idle' | 'ringing' | 'connecting' | 'connected' | 'ended';

export interface MessageStoreState {
  chats: Chat[];
  activeChatId: string | null;
  callLogs: CallLog[];
  currentCall: CallSession | null;
  unreadCount: number;
  isLoading: boolean;
}

export interface MessageStoreActions {
  // Chat actions
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  updateChat: (chatId: string, updates: Partial<Chat>) => void;
  removeChat: (chatId: string) => void;
  setActiveChat: (chatId: string | null) => void;

  // Message actions
  addMessage: (chatId: string, message: ChatMessage) => void;
  markMessagesAsRead: (chatId: string) => void;

  // Call actions
  setCallLogs: (logs: CallLog[]) => void;
  addCallLog: (log: CallLog) => void;
  setCurrentCall: (call: CallSession | null) => void;
  updateCurrentCall: (updates: Partial<CallSession>) => void;

  // Utility actions
  getUnreadCount: () => number;
  setLoading: (loading: boolean) => void;
}