import React from 'react';
import { Check, X } from 'lucide-react';
import { evaluatePassword } from './passwordRules';

interface PasswordStrengthProps {
  value: string;
}

/**
 * Barre de progression continue + liste des règles à respecter.
 * Les règles obligatoires bloquent l'envoi du formulaire (voir passwordRules).
 */
export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ value }) => {
  if (!value) return null;

  const { score, label, barClass, textClass, results } = evaluatePassword(value);

  return (
    <div className="mt-3 animate-fade-in">
      <div className="flex items-center gap-3">
        <div
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Force du mot de passe : ${label}`}
          className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200"
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${barClass}`}
            style={{ width: `${score}%` }}
          />
        </div>
        <span className={`w-[4.5rem] shrink-0 text-right text-xs font-semibold ${textClass}`}>
          {label}
        </span>
      </div>

      <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
        {results.map((rule) => (
          <li
            key={rule.id}
            className={`flex items-center gap-1.5 text-xs transition-colors ${
              rule.ok ? 'text-green-600' : rule.required ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors ${
                rule.ok ? 'bg-green-100' : 'bg-slate-100'
              }`}
            >
              {rule.ok ? (
                <Check className="h-2.5 w-2.5 text-green-600" />
              ) : (
                <X className="h-2.5 w-2.5 text-slate-400" />
              )}
            </span>
            {rule.label}
          </li>
        ))}
      </ul>
    </div>
  );
};
