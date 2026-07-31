import React from 'react';
import { Loader2 } from 'lucide-react';

interface AuthSubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  /** Libellé affiché pendant le chargement. */
  loadingLabel?: string;
  children: React.ReactNode;
}

/**
 * CTA principal des pages d'auth : pleine largeur, avec état de chargement
 * explicite (spinner + libellé) pour que l'utilisateur ne double-clique pas.
 */
export const AuthSubmitButton: React.FC<AuthSubmitButtonProps> = ({
  loading = false,
  loadingLabel = 'Un instant...',
  children,
  className,
  disabled,
  ...props
}) => (
  <button
    className={`
      inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl
      bg-blue-600 px-6 text-[0.95rem] font-semibold text-white
      shadow-lg shadow-blue-600/20 transition-all duration-200
      hover:bg-blue-700 hover:shadow-blue-700/25
      focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30
      active:scale-[0.99]
      disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none
      ${className || ''}
    `}
    disabled={disabled || loading}
    {...props}
  >
    {loading ? (
      <>
        <Loader2 className="h-4 w-4 animate-spin" />
        {loadingLabel}
      </>
    ) : (
      children
    )}
  </button>
);
