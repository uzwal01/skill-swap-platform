import { create } from 'zustand';
import { loginUser, registerUser, getCurrentuser } from '@/services/authService';  
import { LoginFormData, RegisterFormData } from '@/types/FormData'; 
import { User } from '@/types/User';

type AuthState = {
  user: User | null;  // Will hold the authenticated user data
  setUser: (user: User) => void;  // Action to set the user
  login: (data: LoginFormData) => Promise<void>;  // Login action
  register: (data: RegisterFormData) => Promise<void>;  // Register action
  fetchUser: () => Promise<void>;  // Fetch user data from the backend
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,  // Default value for user (not logged in)
  setUser: (user) => set({ user }),  // Update the user state
  login: async (data) => {
    const res = await loginUser(data);  // Call the login service
    set({ user: res.user });  // Store the user data in global state
  },
  register: async (data) => {
    const res = await registerUser(data);  // Call the register service
    set({ user: res.user });  // Store the user data in global state
  },
  fetchUser: async () => {
    const res = await getCurrentuser();  // Fetch current logged-in user
    set({ user: res.user });  // Store the user data in global state
  },
}));
