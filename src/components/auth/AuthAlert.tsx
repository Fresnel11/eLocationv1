import React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface AuthAlertProps {
  variant?: 'error' | 'success' | 'info';
  children: React.ReactNode;
}

const STYLES = {
  error: {
    icon: AlertCircle,
    box: 'border-red-100 bg-red-50 text-red-700',
    iconColor: 'text-red-500',
  },
  success: {
    icon: CheckCircle2,
    box: 'border-green-100 bg-green-50 text-green-700',
    iconColor: 'text-green-600',
  },
  info: {
    icon: Info,
    box: 'border-blue-100 bg-blue-50 text-blue-700',
    iconColor: 'text-blue-600',
  },
} as const;

/**
 * Message inline au-dessus d'un formulaire. Double les toasts, qui disparaissent
 * trop vite pour une erreur d'identifiants que l'utilisateur doit corriger.
 */
export const AuthAlert: React.FC<AuthAlertProps> = ({ variant = 'error', children }) => {
  const { icon: Icon, box, iconColor } = STYLES[variant];

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`mb-5 flex animate-slide-down items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${box}`}
    >
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconColor}`} />
      <span className="leading-relaxed">{children}</span>
    </div>
  );
};
