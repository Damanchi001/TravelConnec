import { Conversation } from "@/src/types";

export const conversations: Conversation[] = [
  {
    id: "conv1",
    isGroup: false,
    participants: [
      { id: "user1", name: "You", avatar: "https://example.com/avatar1.jpg" },
      { id: "user2", name: "Alice Johnson", avatar: "https://example.com/avatar2.jpg" }
    ],
    lastMessage: {
      id: "msg1",
      senderId: "user2",
      content: "Hey! Are you still planning that trip to Paris?",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
    },
    recentMessages: [
      {
        id: "msg2",
        senderId: "user1",
        content: "Yes! I'm so excited. Flights are booked.",
        timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString()
      },
      {
        id: "msg1",
        senderId: "user2",
        content: "Hey! Are you still planning that trip to Paris?",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
      }
    ],
    unreadCount: 2,
    isMuted: false,
    isPinned: true
  },
  {
    id: "conv2",
    isGroup: true,
    groupName: "Europe Trip 2024",
    groupAvatar: "https://example.com/group1.jpg",
    participants: [
      { id: "user1", name: "You", avatar: "https://example.com/avatar1.jpg" },
      { id: "user3", name: "Bob Smith", avatar: "https://example.com/avatar3.jpg" },
      { id: "user4", name: "Charlie Brown", avatar: "https://example.com/avatar4.jpg" },
      { id: "user5", name: "Diana Prince", avatar: "https://example.com/avatar5.jpg" }
    ],
    lastMessage: {
      id: "msg3",
      senderId: "user3",
      content: "The hotel in Rome looks amazing! Let's book it.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
    },
    recentMessages: [
      {
        id: "msg4",
        senderId: "user4",
        content: "I agree, the reviews are great!",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5).toISOString()
      },
      {
        id: "msg3",
        senderId: "user3",
        content: "The hotel in Rome looks amazing! Let's book it.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
      }
    ],
    unreadCount: 0,
    isMuted: true,
    isPinned: false
  },
  {
    id: "conv3",
    isGroup: false,
    participants: [
      { id: "user1", name: "You", avatar: "https://example.com/avatar1.jpg" },
      { id: "user6", name: "Eva Green", avatar: "https://example.com/avatar6.jpg" }
    ],
    lastMessage: {
      id: "msg5",
      senderId: "user1",
      content: "Thanks for the restaurant recommendation!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
    },
    recentMessages: [
      {
        id: "msg6",
        senderId: "user6",
        content: "You're welcome! It's my favorite spot in the city.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24.5).toISOString()
      },
      {
        id: "msg5",
        senderId: "user1",
        content: "Thanks for the restaurant recommendation!",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
      }
    ],
    unreadCount: 1,
    isMuted: false,
    isPinned: false
  },
  {
    id: "conv4",
    isGroup: true,
    groupName: "Beach Vacation",
    groupAvatar: "https://example.com/group2.jpg",
    participants: [
      { id: "user1", name: "You", avatar: "https://example.com/avatar1.jpg" },
      { id: "user7", name: "Frank Miller", avatar: "https://example.com/avatar7.jpg" },
      { id: "user8", name: "Grace Lee", avatar: "https://example.com/avatar8.jpg" }
    ],
    lastMessage: {
      id: "msg7",
      senderId: "user8",
      content: "Weather forecast looks perfect for next week!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() // 2 days ago
    },
    recentMessages: [
      {
        id: "msg8",
        senderId: "user7",
        content: "Can't wait! The beach house is ready.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48.5).toISOString()
      },
      {
        id: "msg7",
        senderId: "user8",
        content: "Weather forecast looks perfect for next week!",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
      }
    ],
    unreadCount: 3,
    isMuted: false,
    isPinned: false
  }
];