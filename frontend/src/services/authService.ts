import api from "@/lib/api.ts";
import { LoginFormData, RegisterFormData } from "@/types/FormData.ts";

// Register API call
export const registerUser = async (data: RegisterFormData) => {
    const response = await api.post('/auth/register', data);
    return response.data;
};

// Login API call
export const loginUser = async (data: LoginFormData) => {
    const response = await api.post('/auth/login', data);
    return response.data;
};

// Get current user (after login)
export const getCurrentuser = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};