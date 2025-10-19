import { create } from 'zustand';
import { loginUser, registerUser, getCurrentuser } from '@/services/authService';  
import { LoginFormData, RegisterPayload } from '@/types/FormData'; 
import { User } from '@/types/User';

type AuthState = {
  user: User | null;  // Will hold the authenticated user data
  isLoading: boolean;
  error: string | null;
  setUser: (user: User) => void;  // Action to set the user
  login: (data: LoginFormData) => Promise<void>;  // Login action
  register: (payload: RegisterPayload) => Promise<void>;  // Register action
  fetchUser: () => Promise<void>;  // Fetch user data from the backend
  logout: () => void;  // Logout user
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

 // Default value for user (not logged in)
  setUser: (user) => set({ user }),  // Update the user state

  login: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await loginUser(data);  // Call the login service (typed AuthResponse)
      localStorage.setItem('token', res.token);   // Save the token
      set({ user: res.user, error: null });  // Store the user data in global state
    } catch (err: unknown) {
      if (err instanceof Error) {
        set({ error: err.message });
      } else {
        set({ error: "Login failed"});
      }
    } finally {
      set({ isLoading: false});
    }
  },
  register: async (data: RegisterPayload) => {
  set({ isLoading: true, error: null });
  try {
    const res = await registerUser(data); // typed AuthResponse
    localStorage.setItem("token", res.token);
    set({ user: res.user, error: null });
  } catch (err: unknown) {
    if (err instanceof Error) set({ error: err.message });
    else set({ error: "Registration failed" });
  } finally {
    set({ isLoading: false });
  }
},

  fetchUser: async () => {
    const token = localStorage.getItem("token");
    if (!token) { set({ isLoading: false }); return; }
    set({ isLoading: true, error: null });
    try {
      const user = await getCurrentuser(); // typed User
      set({ user });
    } catch (err: unknown) {
        if (err instanceof Error) {
          set({ error: err.message });
        }
        else {
          
          set({ error: "Failed to fetch user"});
        }
    } finally {
      set({ isLoading: false });
    }
  },
  logout: async () => {
    localStorage.removeItem('token');   // Remove token from localStorage
    set({ user: null });   // Clear user from Global State
  }
}));
