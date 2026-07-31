import React, { useId } from 'react';

/**
 * Marque eLocation : un pin de localisation contenant une maison.
 * Redessin vectoriel du logo de la marque (src/assets/e_location.png) afin
 * d'être net à toute taille et de peser ~1 Ko au lieu de 45 Ko.
 */

const BRAND = {
  cyan: '#4FC3DC',
  green: '#5FBB6A',
  blue: '#4A8FD4',
  magenta: '#D6218C',
  orange: '#F0663F',
  yellow: '#F5BC2E',
} as const;

export const LogoMark: React.FC<{ className?: string }> = ({ className }) => {
  // useId évite la collision d'ID si plusieurs logos sont rendus sur la page.
  const clipId = `elocation-pin-${useId()}`;

  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id={clipId}>
          {/* Silhouette du pin : cercle (r=20, centre 32/28) + pointe en 32/53 */}
          <path d="M32 53L20 44A20 20 0 1 1 44 44Z" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        {/* Quartiers colorés, découpés par le X qui forme le toit (sommet 32/22) */}
        <path d="M32 22L-8-18H72Z" fill={BRAND.cyan} />
        <path d="M32 22L-18-28V72Z" fill={BRAND.green} />
        <path d="M32 22L82-28V72Z" fill={BRAND.blue} />
        <path d="M32 22L-18 72H32Z" fill={BRAND.magenta} />
        <path d="M32 22L82 72H32Z" fill={BRAND.orange} />

        {/* Corps de la maison */}
        <path d="M32 22L22 32V60H42V32Z" fill={BRAND.yellow} />

        {/* Séparateurs blancs : les deux diagonales du toit puis les murs */}
        <g stroke="#fff" strokeWidth="2.6" fill="none">
          <path d="M10 44L54 0" />
          <path d="M10 0L54 44" />
          <path d="M22 32V60" />
          <path d="M42 32V60" />
        </g>

        {/* Cheminée sur le pan gauche du toit */}
        <path
          d="M24 29.5V24H26.5V27"
          stroke="#fff"
          strokeWidth="2.2"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Porte */}
        <path
          d="M28.5 60V44H35.5V60"
          stroke="#fff"
          strokeWidth="2.6"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    </svg>
  );
};

interface LogoProps {
  /** Masque le texte pour n'afficher que la marque (utile en mobile très étroit). */
  markOnly?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ markOnly = false, className = '' }) => (
  <span className={`inline-flex items-center gap-2.5 ${className}`}>
    <LogoMark className="h-12 w-12 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5" />
    {!markOnly && (
      <span className="flex flex-col leading-none">
        <span className="text-[1.7rem] font-extrabold tracking-tight text-slate-900">
          eLocation
        </span>
        <span className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-400">
          Bénin
        </span>
      </span>
    )}
  </span>
);

export default Logo;
