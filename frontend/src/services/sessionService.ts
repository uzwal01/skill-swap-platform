import api from "@/lib/api.ts";
import { Session } from "@/types/Session.ts";
import { Paginated } from "@/types/Paginated";


export type CreateSessionData = {
    toUser: string;
    fromUserSkill: string;
    toUserSkill: string;
    scheduledAt?: Date;
    message?: string;
    availability?: 'weekdays' | 'weekends' | 'any';
    durationMinutes?: 30 | 60 | 90 | 120;
};


// Create a new session
export const createSession = async (data: CreateSessionData): Promise<Session> => {
    const response = await api.post('/sessions', data);
    return response.data;
};

// Get user sessions
export const getUserSessions = async (): Promise<Session[]> => {
    const response = await api.get(`/sessions/my`);
    // Backward-compatible: unwrap if server returns paginated envelope
    return (response.data && response.data.data) ? response.data.data as Session[] : response.data as Session[];
}

export type SessionsQuery = {
    page?: number;
    limit?: number;
    type?: 'incoming' | 'outgoing';
    status?: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
};

export const getUserSessionsPaged = async (query: SessionsQuery = {}): Promise<Paginated<Session>> => {
    const response = await api.get(`/sessions/my`, { params: query });
    const data = response.data;
    if (Array.isArray(data)) {
        const arr = data as Session[];
        const page = query.page ?? 1;
        const limit = query.limit ?? arr.length;
        return { data: arr, page, limit, total: arr.length, totalPages: 1, hasNext: false, hasPrev: page > 1 };
    }
    return data as Paginated<Session>;
}

// Update Session status
export const updateSessionStatus = async (sessionId: string, status: string): Promise<Session> => {
    const response = await api.put(`/sessions/${sessionId}/status`, { status });
    return response.data;
}
