import React, { useState, useEffect, createContext, useContext } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// Toast Context
const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast Provider
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toast = {
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    warning: (msg, duration) => addToast(msg, 'warning', duration),
    info: (msg, duration) => addToast(msg, 'info', duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// Toast Container
const ToastContainer = ({ toasts, onRemove }) => (
  <div className="fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2">
    {toasts.map((toast) => (
      <Toast key={toast.id} {...toast} onRemove={() => onRemove(toast.id)} />
    ))}
  </div>
);

// Individual Toast
const Toast = ({ id, message, type, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(onRemove, 200);
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const backgrounds = {
    success: 'bg-green-50/95 border-green-200 dark:bg-green-900/30 dark:border-green-700/60',
    error: 'bg-red-50/95 border-red-200 dark:bg-red-900/30 dark:border-red-700/60',
    warning: 'bg-yellow-50/95 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-700/60',
    info: 'bg-blue-50/95 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700/60',
  };

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border p-4 shadow-lg backdrop-blur transition-all duration-200 ${
        backgrounds[type]
      } ${isExiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'} animate-slide-in-right`}
    >
      {icons[type]}
      <p className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-100">{message}</p>
      <button
        onClick={handleRemove}
        className="rounded-lg p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
      >
        <X className="h-4 w-4 text-slate-500 dark:text-slate-300" />
      </button>
    </div>
  );
};

export default Toast;
