import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Toast, ToastType } from '../components/ui/Toast';

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  success: (title: string, message?: string, duration?: number) => void;
  error: (title: string, message?: string, duration?: number) => void;
  warning: (title: string, message?: string, duration?: number) => void;
  info: (title: string, message?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const showToast = (type: ToastType, title: string, message?: string, duration = 5000) => {
    const id = generateId();
    const newToast: ToastItem = { id, type, title, message, duration };
    
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (title: string, message?: string, duration?: number) => {
    showToast('success', title, message, duration);
  };

  const error = (title: string, message?: string, duration?: number) => {
    showToast('error', title, message, duration);
  };

  const warning = (title: string, message?: string, duration?: number) => {
    showToast('warning', title, message, duration);
  };

  const info = (title: string, message?: string, duration?: number) => {
    showToast('info', title, message, duration);
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      
      {/* Container des toasts */}
      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        {toasts.map((toast, index) => (
          <div 
            key={toast.id} 
            className="pointer-events-auto"
            style={{ 
              transform: `translateY(${index * 80}px)`,
              transition: 'transform 0.3s ease-in-out'
            }}
          >
            <Toast
              id={toast.id}
              type={toast.type}
              title={toast.title}
              message={toast.message}
              duration={toast.duration}
              onClose={removeToast}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};