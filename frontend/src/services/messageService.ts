import api from '@/lib/api';
import { Conversation } from '@/types/Conversation';
import { ChatMessage } from '@/types/Message';

export const getConversations = async (): Promise<Conversation[]> => {
  const res = await api.get('/messages/conversations');
  return res.data as Conversation[];
};

export const ensureConversation = async (otherUserId: string): Promise<Conversation> => {
  const res = await api.post(`/messages/conversation/${otherUserId}`);
  return res.data as Conversation;
};

export type MessagesPage = { data: ChatMessage[]; nextCursor: string | null };

export const getMessages = async (
  conversationId: string,
  cursor?: string,
  limit = 20,
): Promise<MessagesPage> => {
  const res = await api.get(`/messages/${conversationId}`, { params: { cursor, limit } });
  return res.data as MessagesPage;
};

export const markConversationRead = async (conversationId: string): Promise<{ updated: number }> => {
  const res = await api.post(`/messages/${conversationId}/read`);
  return res.data as { updated: number };
};
