import React, { useEffect, useState } from 'react';
import { CheckCircle, X, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-600',
    titleColor: 'text-green-800',
    messageColor: 'text-green-700',
    progressColor: 'bg-green-500'
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-600',
    titleColor: 'text-red-800',
    messageColor: 'text-red-700',
    progressColor: 'bg-red-500'
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconColor: 'text-yellow-600',
    titleColor: 'text-yellow-800',
    messageColor: 'text-yellow-700',
    progressColor: 'bg-yellow-500'
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-800',
    messageColor: 'text-blue-700',
    progressColor: 'bg-blue-500'
  }
};

export const Toast: React.FC<ToastProps> = ({ 
  id, 
  type, 
  title, 
  message, 
  duration = 5000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  const config = toastConfig[type];
  const IconComponent = config.icon;

  useEffect(() => {
    // Animation d'entrée
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // Barre de progression
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (duration / 100));
        return newProgress <= 0 ? 0 : newProgress;
      });
    }, 100);

    // Auto-fermeture
    const closeTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300);
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(closeTimer);
      clearInterval(progressTimer);
    };
  }, [id, duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300);
  };

  return (
    <div
      className={`
        fixed top-4 left-4 right-4 sm:top-4 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 z-50
        max-w-md w-auto sm:w-full sm:mx-0
        ${config.bgColor} ${config.borderColor}
        border rounded-lg shadow-lg backdrop-blur-sm
        transition-all duration-300 ease-in-out
        ${isVisible 
          ? 'translate-y-0 opacity-100 scale-100' 
          : '-translate-y-2 opacity-0 scale-95'
        }
      `}
    >
      {/* Barre de progression */}
      <div className="absolute top-0 left-0 h-1 bg-gray-200 rounded-t-lg overflow-hidden w-full">
        <div 
          className={`h-full ${config.progressColor} transition-all duration-100 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-3 sm:p-4">
        <div className="flex items-start">
          {/* Icône */}
          <div className="flex-shrink-0">
            <IconComponent className={`h-5 w-5 sm:h-6 sm:w-6 ${config.iconColor}`} />
          </div>

          {/* Contenu */}
          <div className="ml-2 sm:ml-3 flex-1 min-w-0">
            <h3 className={`text-sm font-semibold ${config.titleColor} leading-tight`}>
              {title}
            </h3>
            {message && (
              <p className={`mt-1 text-xs sm:text-sm ${config.messageColor} leading-tight break-words`}>
                {message}
              </p>
            )}
          </div>

          {/* Bouton fermer */}
          <div className="ml-2 sm:ml-4 flex-shrink-0">
            <button
              onClick={handleClose}
              className={`
                inline-flex rounded-md p-1 sm:p-1.5 
                ${config.iconColor} hover:bg-white/50
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
                transition-colors duration-200
              `}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};