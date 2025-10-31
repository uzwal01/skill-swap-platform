import { User } from './User';

export type Conversation = {
  _id: string;
  participants: User[]; // populated with minimal fields (name, email, avatarUrl)
  lastMessageAt: string;
  createdAt?: string;
  updatedAt?: string;
  unread?: number;
};
