import { create } from 'zustand';
import {
  MessageStoreActions,
  MessageStoreState
} from '../types/messages';

type MessageStore = MessageStoreState & MessageStoreActions;

let AsyncStorage;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  console.warn('AsyncStorage not available, messages will not persist');
  AsyncStorage = null;
}

const storeConfig = (set: any, get: any) => ({
  // Initial state
  chats: [],
  activeChatId: null,
  callLogs: [],
  currentCall: null,
  unreadCount: 0,
  isLoading: false,

  // Chat actions
  setChats: (chats: any[]) => {
    const unreadCount = chats.reduce((total: number, chat: any) => total + chat.unreadCount, 0);
    set({ chats, unreadCount });
  },

  addChat: (chat: any) => {
    set((state: any) => {
      const existingChatIndex = state.chats.findIndex((c: any) => c.id === chat.id);
      let newChats;

      if (existingChatIndex >= 0) {
        // Update existing chat
        newChats = [...state.chats];
        newChats[existingChatIndex] = { ...newChats[existingChatIndex], ...chat };
      } else {
        // Add new chat
        newChats = [chat, ...state.chats];
      }

      const unreadCount = newChats.reduce((total: number, c: any) => total + c.unreadCount, 0);
      return { chats: newChats, unreadCount };
    });
  },

  updateChat: (chatId: string, updates: any) => {
    set((state: any) => {
      const newChats = state.chats.map((chat: any) =>
        chat.id === chatId ? { ...chat, ...updates } : chat
      );
      const unreadCount = newChats.reduce((total: number, chat: any) => total + chat.unreadCount, 0);
      return { chats: newChats, unreadCount };
    });
  },

  removeChat: (chatId: string) => {
    set((state: any) => {
      const newChats = state.chats.filter((chat: any) => chat.id !== chatId);
      const unreadCount = newChats.reduce((total: number, chat: any) => total + chat.unreadCount, 0);
      return { chats: newChats, unreadCount };
    });
  },

  setActiveChat: (chatId: string | null) => {
    set({ activeChatId: chatId });
    // Mark messages as read when opening chat
    if (chatId) {
      get().markMessagesAsRead(chatId);
    }
  },

  // Message actions
  addMessage: (chatId: string, message: any) => {
    set((state: any) => {
      const newChats = state.chats.map((chat: any) => {
        if (chat.id === chatId) {
          const isCurrentUser = message.senderId === 'current-user'; // TODO: Get from auth store
          const unreadIncrement = !isCurrentUser && chat.id !== state.activeChatId ? 1 : 0;

          return {
            ...chat,
            lastMessage: message,
            unreadCount: chat.unreadCount + unreadIncrement,
            updatedAt: new Date()
          };
        }
        return chat;
      });

      const unreadCount = newChats.reduce((total: number, chat: any) => total + chat.unreadCount, 0);
      return { chats: newChats, unreadCount };
    });
  },

  markMessagesAsRead: (chatId: string) => {
    set((state: any) => {
      const newChats = state.chats.map((chat: any) =>
        chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
      );
      const unreadCount = newChats.reduce((total: number, chat: any) => total + chat.unreadCount, 0);
      return { chats: newChats, unreadCount };
    });
  },

  // Call actions
  setCallLogs: (logs: any[]) => {
    set({ callLogs: logs });
  },

  addCallLog: (log: any) => {
    set((state: any) => ({
      callLogs: [log, ...state.callLogs]
    }));
  },

  setCurrentCall: (call: any) => {
    set({ currentCall: call });
  },

  updateCurrentCall: (updates: any) => {
    set((state: any) => ({
      currentCall: state.currentCall ? { ...state.currentCall, ...updates } : null
    }));
  },

  // Utility actions
  getUnreadCount: () => {
    return get().unreadCount;
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  }
});

export const useMessageStore = create<MessageStore>()(storeConfig);