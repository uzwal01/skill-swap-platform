// import { create } from 'zustand';
// import { LoginFormData, RegisterFormData } from '@/types/FormData';
// // import { User } from '@/types/User';
// // import { loginUser, registerUser, getCurrentUser } from '@/services/authService';

// type AuthState = {
//   user: User | null;  // User can be null if not authenticated
//   setUser: (user: User) => void;
//   login: (data: LoginFormData) => Promise<void>;
//   register: (data: RegisterFormData) => Promise<void>;
//   fetchUser: () => Promise<void>;
// };

// export const useAuthStore = create<AuthState>((set) => ({
//   user: null,
//   setUser: (user) => set({ user }),
//   login: async (data) => {
//     const res = await loginUser(data);
//     set({ user: res.user });
//   },
//   register: async (data) => {
//     const res = await registerUser(data);
//     set({ user: res.user });
//   },
//   fetchUser: async () => {
//     const res = await getCurrentUser();
//     set({ user: res.user });
//   },
// }));
