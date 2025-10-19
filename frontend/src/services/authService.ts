import api from "@/lib/api.ts";
import { LoginFormData, RegisterPayload } from "@/types/FormData.ts";
import { AuthResponse } from "@/types/AuthResponse";
import { User } from "@/types/User";

// Register API call
export const registerUser = async (data: RegisterPayload): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', data);
  return response.data as AuthResponse;
};

// Login API call
export const loginUser = async (data: LoginFormData): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', data);
  return response.data as AuthResponse;
};

// Get current user (after login)
type MeResponse = User | { user: User };

const isWrappedUser = (data: MeResponse): data is { user: User } => {
  return (data as { user?: User }).user !== undefined;
};

export const getCurrentuser = async (): Promise<User> => {
  const response = await api.get<MeResponse>('/auth/me');
  const data = response.data;
  return isWrappedUser(data) ? data.user : data;
};
