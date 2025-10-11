import api from "@/lib/api.ts";
import { Session } from "@/types/Session.ts";


// Create a new session
export const createSession = async (data: Session): Promise<Session> => {
    const response = await api.post('/sessions', data);
    return response.data;
};

// Get user sessions
export const getUserSessions = async (userId: string): Promise<Session[]> => {
    const response = await api.get(`/sessions/my?userId=${userId}`);
    return response.data;
}

// Update Session status
export const updateSessionStatus = async (sessionId: string, status: string): Promise<Session> => {
    const response = await api.put(`/sessions/${sessionId}/status`, { status });
    return response.data;
}