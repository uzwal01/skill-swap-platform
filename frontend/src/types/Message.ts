export type ChatMessage = {
  _id: string;
  conversation: string;
  from: string; // userId
  to: string;   // userId
  text: string;
  createdAt: string;
  readAt?: string;
};

