import React, { Suspense, lazy } from 'react';
import type { LucideIcon } from 'lucide-react';

/**
 * Icône animée Lordicon, avec repli systématique sur une icône lucide.
 *
 * Le paquet @lordicon/react ne contient AUCUNE icône : chaque animation est un
 * fichier JSON (Lottie) à télécharger sur lordicon.com et à déposer dans
 * src/assets/lordicon/. Tant qu'un fichier manque, l'icône lucide s'affiche —
 * l'interface reste donc complète et cohérente sans aucun JSON.
 *
 * Le lecteur est chargé dynamiquement : sans JSON présent, lottie-web (~590 ko)
 * ne part pas dans le bundle principal.
 *
 * Réservé aux moments qui gagnent vraiment à être animés (état vide, mise en
 * favori, confirmation). Animer toute l'interface alourdit le rendu sur mobile
 * d'entrée de gamme et donne un aspect « démo » : les icônes fixes restent la
 * règle, l'animation reste l'exception.
 */

// Les JSON déposés dans src/assets/lordicon/ sont détectés automatiquement.
const ICONS = import.meta.glob<Record<string, unknown>>('../../assets/lordicon/*.json', {
  eager: true,
  import: 'default',
});

const LordiconPlayer = lazy(() => import('./LordiconPlayer'));

export type IconTrigger = 'hover' | 'loop' | 'once';

interface AnimatedIconProps {
  /** Nom du fichier sans extension, ex. « heart » pour heart.json. */
  name: string;
  /** Icône lucide affichée tant que le JSON n'est pas fourni. */
  fallback: LucideIcon;
  size?: number;
  className?: string;
  trigger?: IconTrigger;
  /** Rejoue l'animation quand la valeur change (ex. passage en favori). */
  playKey?: string | number;
}

export const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  name,
  fallback: Fallback,
  size = 24,
  className,
  trigger = 'hover',
  playKey,
}) => {
  const icon = ICONS[`../../assets/lordicon/${name}.json`];
  const fallbackIcon = <Fallback className={className} size={size} aria-hidden="true" />;

  if (!icon) return fallbackIcon;

  return (
    <span className={className} aria-hidden="true">
      <Suspense fallback={fallbackIcon}>
        <LordiconPlayer
          icon={icon}
          size={size}
          loop={trigger === 'loop'}
          hoverOnly={trigger === 'hover'}
          playKey={playKey}
        />
      </Suspense>
    </span>
  );
};
