import React from 'react';
import IconVerified from '~icons/material-symbols/verified-outline';

interface DemarcheurBadgeProps {
  /** Rendu conditionnel intégré : évite un `&&` à chaque appel. */
  show?: boolean;
  /** « inline » accompagne un nom, « pill » se pose sur un visuel. */
  variant?: 'inline' | 'pill';
  className?: string;
}

/**
 * Mention « Démarcheur » affichée partout où le nom d'un démarcheur apparaît.
 *
 * Un seul composant pour toutes les surfaces : si le libellé ou le style
 * changent, ils changent partout d'un coup. Le titre au survol explique ce que
 * le mot recouvre — tout le monde ne sait pas ce qu'est un démarcheur vérifié.
 */
export const DemarcheurBadge: React.FC<DemarcheurBadgeProps> = ({
  show = true,
  variant = 'inline',
  className = '',
}) => {
  if (!show) return null;

  const base = 'inline-flex shrink-0 items-center gap-1 font-semibold';
  const styles =
    variant === 'pill'
      ? 'rounded-full bg-slate-900/40 px-2 py-1 text-[0.68rem] text-white backdrop-blur-md'
      : 'rounded-full bg-blue-50 px-2 py-0.5 text-[0.7rem] text-blue-700';

  return (
    <span
      title="Démarcheur vérifié par eLocation : identité contrôlée"
      className={`${base} ${styles} ${className}`}
    >
      <IconVerified className="text-[0.9rem]" />
      Démarcheur
    </span>
  );
};
