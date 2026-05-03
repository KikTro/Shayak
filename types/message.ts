import type { Timestamp } from "firebase/firestore";

export type ChatType = "event" | "dm" | "channel" | "community";

export interface ChatRoom {
  id: string;
  type: ChatType;
  name: string;
  description?: string;
  participants: string[];
  createdBy: string;
  createdAt: Timestamp | Date;
  lastMessage?: {
    text: string;
    senderName: string;
    sentAt: Timestamp | Date;
  };
  isPublic: boolean;
  linkedEventId?: string;
  unreadCount?: number;
}

export interface MessageReply {
  messageId: string;
  text: string;
  senderName: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderPhotoURL: string;
  text: string;
  attachmentURL?: string;
  attachmentType?: "image" | "file" | "link";
  replyTo?: MessageReply;
  reactions: Record<string, string[]>;
  sentAt: Timestamp | Date;
  editedAt?: Timestamp | Date;
  deleted: boolean;
}
