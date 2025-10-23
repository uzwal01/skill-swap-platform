import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

export type Toast = {
  id: string;
  type: ToastType;
  message: string;
};

type ToastState = {
  toasts: Toast[];
  addToast: (t: Omit<Toast, 'id'> | { type: ToastType; message: string }) => void;
  removeToast: (id: string) => void;
};

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  addToast: ({ type, message }) => {
    const id = Math.random().toString(36).slice(2);
    const toast: Toast = { id, type, message };
    set({ toasts: [...get().toasts, toast] });
    // Auto-remove after 3 seconds
    setTimeout(() => {
      get().removeToast(id);
    }, 3000);
  },
  removeToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

