import api from "@/lib/api.ts";
import { Session } from "@/types/Session.ts";
import { Paginated } from "@/types/Paginated";
import { isAxiosError } from "axios";


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
export class DuplicatePendingError extends Error {
    existingId: string;
    createdAt?: string;
    constructor(message: string, existingId: string, createdAt?: string) {
        super(message);
        this.name = 'DuplicatePendingError';
        this.existingId = existingId;
        this.createdAt = createdAt;
    }
}

export const createSession = async (data: CreateSessionData): Promise<Session> => {
    try {
        const response = await api.post('/sessions', data);
        return response.data as Session;
    } catch (err: unknown) {
        if (isAxiosError(err) && err.response?.status === 409) {
            type DuplicateBody = { message?: string; existingId?: string; createdAt?: string };
            const data: unknown = err.response.data;
            const body: DuplicateBody = (typeof data === 'object' && data !== null)
              ? (data as DuplicateBody)
              : {};
            const message = body.message ?? 'You already have a pending request to this user.';
            const existingId = body.existingId ? String(body.existingId) : '';
            const createdAt = body.createdAt;
            throw new DuplicatePendingError(message, existingId, createdAt);
        }
        throw err instanceof Error ? err : new Error('Failed to create session');
    }
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
