import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastStyles = {
  success: 'border-green-500/50 bg-green-500/10 text-green-500',
  error: 'border-red-500/50 bg-red-500/10 text-red-500',
  warning: 'border-amber-500/50 bg-amber-500/10 text-amber-500',
  info: 'border-blue-500/50 bg-blue-500/10 text-blue-500',
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [isExiting, setIsExiting] = useState(false);
  const Icon = toastIcons[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onRemove, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onRemove]);

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm',
        'transition-all duration-300 pointer-events-auto',
        isExiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0 animate-slide-up',
        toastStyles[toast.type]
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setIsExiting(true);
          setTimeout(onRemove, 300);
        }}
        className="opacity-70 hover:opacity-100 transition-opacity pointer-events-auto"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
}

// Hook for managing toasts
import { useCallback } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    setToasts((prev) => {
      const newToasts = [...prev, { id, message, type }];
      // Keep only the last 4 toasts (remove oldest if more than 4)
      if (newToasts.length > 4) {
        return newToasts.slice(newToasts.length - 4);
      }
      return newToasts;
    });
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}
