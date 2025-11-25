// ToastContext.tsx - Global toast notifications
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto remove after 3s
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-24 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              layout
              className={`pointer-events-auto px-4 py-3 rounded-lg shadow-lg border backdrop-blur-md flex items-center gap-3 min-w-[300px]
                ${toast.type === 'success' ? 'bg-status-success/10 border-status-success/30 text-status-success' : ''}
                ${toast.type === 'error' ? 'bg-status-error/10 border-status-error/30 text-status-error' : ''}
                ${toast.type === 'info' ? 'bg-accent-primary/10 border-accent-primary/30 text-accent-primary' : ''}
              `}
            >
              <span className="text-xl">
                {toast.type === 'success' && '✅'}
                {toast.type === 'error' && '⚠️'}
                {toast.type === 'info' && 'ℹ️'}
              </span>
              <span className="font-mono text-sm">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

