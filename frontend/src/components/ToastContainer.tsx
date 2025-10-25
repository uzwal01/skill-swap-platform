import React from 'react';
import { useToastStore } from '@/store/toastStore';

const typeStyles: Record<string, string> = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  info: 'bg-gray-800',
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-80 flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto rounded text-white shadow ${typeStyles[t.type] || typeStyles.info}`}
        >
          <div className="flex items-center justify-between px-6 py-4 text-sm">
            <span>{t.message}</span>
            <button
              className="ml-3 rounded bg-black/20 px-2 py-1 text-xs"
              onClick={() => removeToast(t.id)}
            >
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;

