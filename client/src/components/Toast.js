import React, { useEffect, useState } from 'react';
import { Check, X, AlertCircle, Info } from 'lucide-react';

/**
 * Toast Notification Component
 * Shows temporary success/error/info messages
 */

export const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const bgColor = {
    success: 'bg-green-100 border-green-400 text-green-800',
    error: 'bg-red-100 border-red-400 text-red-800',
    info: 'bg-blue-100 border-blue-400 text-blue-800',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-800',
  };

  const Icon = {
    success: Check,
    error: X,
    info: Info,
    warning: AlertCircle,
  }[type];

  return (
    <div
      className={`
        fixed top-4 right-4 p-4 border-l-4 rounded shadow-lg
        flex items-center gap-3 animate-slideIn
        ${bgColor[type]} max-w-sm z-50
      `}
    >
      <Icon size={20} />
      <span className="flex-1">{message}</span>
      <button
        onClick={() => setIsVisible(false)}
        className="text-lg leading-none hover:opacity-70"
      >
        ×
      </button>
    </div>
  );
};

/**
 * Toast Container - Use this hook to manage multiple toasts
 */
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return { toasts, showToast, removeToast };
};

export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 max-w-sm space-y-3 z-50">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};
