'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export function Toast({ message, type = 'info', onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-white shadow-xl',
        type === 'success' && 'bg-emerald-700',
        type === 'error' && 'bg-red-700',
        type === 'info' && 'bg-slate-700'
      )}
    >
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-white/70 hover:text-white">✕</button>
    </div>
  );
}

// Simple toast hook
export function useToast() {
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = React.useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      setToast({ message, type });
    },
    []
  );

  const ToastComponent = toast ? (
    <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
  ) : null;

  return { showToast, ToastComponent };
}
