export type Session = {
    sessionId: string;
    fromUser: string;
    toUser: string;
    status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
    createdAt: string;
    updatedAt: string;
};