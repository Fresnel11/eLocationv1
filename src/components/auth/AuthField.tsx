import React, { forwardRef, useId, useState } from 'react';
import { AlertCircle, Eye, EyeOff, type LucideIcon } from 'lucide-react';

export interface AuthFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  /** Icône affichée à gauche du champ. */
  icon?: LucideIcon;
  error?: string;
  /** Texte d'aide sous le champ, masqué dès qu'une erreur s'affiche. */
  hint?: string;
  type?: React.HTMLInputTypeAttribute;
  /** Ajoute le bouton oeil et bascule entre password et text. */
  revealable?: boolean;
  /** Contenu libre aligné à droite du label (ex. « Mot de passe oublié ? »). */
  labelAction?: React.ReactNode;
}

/**
 * Champ de formulaire des pages d'auth : label, icône, état d'erreur accessible
 * et bascule de visibilité du mot de passe intégrée (plus de bouton positionné
 * en absolu au jugé par-dessus le composant Input générique).
 */
export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(
  ({ label, icon: Icon, error, hint, type = 'text', revealable, labelAction, className, ...props }, ref) => {
    const [revealed, setRevealed] = useState(false);
    const id = useId();
    const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
    const inputType = revealable ? (revealed ? 'text' : 'password') : type;

    return (
      <div>
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          <label htmlFor={id} className="text-sm font-medium text-slate-700">
            {label}
            {props.required && <span className="ml-0.5 text-blue-600">*</span>}
          </label>
          {labelAction}
        </div>

        <div className="relative">
          {Icon && (
            <Icon
              className={`pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 transition-colors ${
                error ? 'text-red-400' : 'text-slate-400'
              }`}
              aria-hidden="true"
            />
          )}

          <input
            id={id}
            ref={ref}
            type={inputType}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={`
              h-12 w-full rounded-xl border bg-slate-50/70 text-[0.95rem] text-slate-900
              transition-all duration-200 placeholder:text-slate-400
              focus:bg-white focus:outline-none focus:ring-4
              disabled:cursor-not-allowed disabled:opacity-60
              ${Icon ? 'pl-11' : 'pl-4'}
              ${revealable ? 'pr-12' : 'pr-4'}
              ${
                error
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                  : 'border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-500/10'
              }
              ${className || ''}
            `}
            {...props}
          />

          {revealable && (
            <button
              type="button"
              onClick={() => setRevealed((v) => !v)}
              tabIndex={-1}
              aria-label={revealed ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              {revealed ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
            </button>
          )}
        </div>

        {error ? (
          <p id={`${id}-error`} role="alert" className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {error}
          </p>
        ) : (
          hint && (
            <p id={`${id}-hint`} className="mt-1.5 text-xs text-slate-400">
              {hint}
            </p>
          )
        )}
      </div>
    );
  }
);

AuthField.displayName = 'AuthField';
