// Chat Message Types
export type MessageType = "TEXT" | "IMAGE" | "VIDEO" | "AUDIO";

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName?: string;
  type: MessageType;
  content: string; // Text content or URL for media
  metadata?: {
    fileName?: string;
    duration?: number; // for audio/video in seconds
    mimeType?: string;
  };
  createdAt: string;
  isOwn: boolean;
   isDeleted?: boolean;
  replyTo?: Message | null;
  reactions?: {
    userId: string;
    emoji: string;
  }[]; 
}

export interface Chat {
  id: string;
  participantId: string;
  participantName?: string;
  participantAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  bookingId?: string;
}

export interface SocketAuth {
  userId: string;
  userType: "User" | "Worker";
}

export interface SocketMessage {
  type: MessageType;
  content: string;
  metadata?: {
    fileName?: string;
    duration?: number;
    mimeType?: string;
  };
}

export interface MediaUploadResponse {
  url: string;
  fileName: string;
  mimeType: string;
}

// Inbox & History API Response Types
export interface InboxResponse {
  success: boolean;
  data: Chat[];
}

export interface ChatHistoryResponse {
  success: boolean;
  data: Message[];
}
