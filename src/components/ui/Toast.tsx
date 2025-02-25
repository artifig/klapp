'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

// Toast Types
export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  onClose?: () => void;
}

// Context for Toast
interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  updateToast: (id: string, toast: Partial<Toast>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast Provider
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prevToasts) => [...prevToasts, { id, ...toast }]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  const updateToast = (id: string, toast: Partial<Toast>) => {
    setToasts((prevToasts) =>
      prevToasts.map((t) => (t.id === id ? { ...t, ...toast } : t))
    );
  };

  const value = {
    toasts,
    addToast,
    removeToast,
    updateToast,
  };

  if (!isMounted) return <>{children}</>;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {isMounted && createPortal(<ToastContainer />, document.body)}
    </ToastContext.Provider>
  );
}

// Hook for using toast
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Toast Container to display toasts
function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div
      className="fixed bottom-0 right-0 z-50 flex flex-col items-end p-4 gap-2 max-h-screen overflow-hidden pointer-events-none"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

// Individual Toast Item
function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const { title, description, variant = 'default', duration = 5000, onClose: toastOnClose } = toast;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
        if (toastOnClose) toastOnClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose, toastOnClose]);

  return (
    <div
      className={cn(
        'transform-gpu animate-slide-in pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:scale-[1.02] relative',
        'flex items-start p-4 border-l-4',
        {
          'bg-background border-primary': variant === 'default',
          'bg-background border-success': variant === 'success',
          'bg-background border-error': variant === 'error',
          'bg-background border-warning': variant === 'warning',
          'bg-background border-accent': variant === 'info',
        }
      )}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      data-diagonal="true"
    >
      <div className="flex-1">
        {title && <h3 className="font-medium text-foreground">{title}</h3>}
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      <button
        onClick={() => {
          onClose();
          if (toastOnClose) toastOnClose();
        }}
        className="ml-4 inline-flex shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Close"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// Animation keyframes in globals.css
// @keyframes slide-in {
//   from { transform: translateX(100%); opacity: 0; }
//   to { transform: translateX(0); opacity: 1; }
// } 