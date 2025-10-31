import { create } from 'zustand';
import { Conversation } from '@/types/Conversation';
import { ChatMessage } from '@/types/Message';
import { getConversations, getMessages, MessagesPage, markConversationRead } from '@/services/messageService';
import { connectSocket, getSocket } from '@/lib/socket';

interface MessageState {
  conversations: Conversation[];
  currentId: string | null;
  messages: Record<string, ChatMessage[]>; // by conversationId
  nextCursor: Record<string, string | null>;
  isTyping: Record<string, boolean>; // by other user id or conversation id
  loading: boolean;
  error: string | null;
  connected: boolean;
  connect: (token: string) => void;
  loadConversations: () => Promise<void>;
  openConversation: (id: string) => Promise<void>;
  send: (conversationId: string, toUserId: string, text: string) => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  conversations: [],
  currentId: null,
  messages: {},
  nextCursor: {},
  isTyping: {},
  loading: false,
  error: null,
  connected: false,

  connect: (token: string) => {
    const already = get().connected;
    if (already) return;
    const s = connectSocket(token);
    // Ensure no duplicate handlers
    s.off('message:new');
    s.off('typing');
    s.on('message:new', (msg: ChatMessage) => {
      set((state) => {
        const list = state.messages[msg.conversation] || [];
        // dedupe by _id
        if (list.some((m) => m._id === msg._id)) return {} as Partial<MessageState> as MessageState;
        return {
          messages: { ...state.messages, [msg.conversation]: [...list, msg] },
        } as Partial<MessageState> as MessageState;
      });
      // Refresh conversations to update unread badges
      getConversations()
        .then((list) => set({ conversations: list }))
        .catch(() => void 0);
    });
    s.on('typing', ({ conversationId, isTyping }: { conversationId: string; isTyping: boolean }) => {
      set((state) => ({ isTyping: { ...state.isTyping, [conversationId]: isTyping } }));
    });
    set({ connected: true });
  },

  loadConversations: async () => {
    set({ loading: true, error: null });
    try {
      const list = await getConversations();
      set({ conversations: list });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to load conversations' });
    } finally {
      set({ loading: false });
    }
  },

  openConversation: async (id: string) => {
    const s = getSocket();
    if (s) s.emit('conversation:join', id);
    set({ currentId: id });
    // Load first page if empty
    const existing = get().messages[id];
    if (!existing || existing.length === 0) {
      const page: MessagesPage = await getMessages(id);
      set((state) => ({
        messages: { ...state.messages, [id]: page.data },
        nextCursor: { ...state.nextCursor, [id]: page.nextCursor },
      }));
    }
    try {
      await markConversationRead(id);
      // Optimistically zero unread for this conversation locally
      set((state) => ({
        conversations: state.conversations.map((c) => (
          c._id === id ? { ...c, unread: 0 } : c
        )),
      }));
    } catch {
      // ignore read marking errors in UI flow
    }
  },

  send: (conversationId: string, toUserId: string, text: string) => {
    const s = getSocket();
    if (!s) return;
    s.emit('message:send', { conversationId, toUserId, text });
  },
}));
