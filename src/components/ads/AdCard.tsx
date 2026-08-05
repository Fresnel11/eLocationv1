import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bath, BedDouble, Eye, ImageOff, Maximize2, Star } from 'lucide-react';
import { DemarcheurBadge } from '../ui/DemarcheurBadge';
import { FavoriteButton } from '../ui/FavoriteButton';
import { getImageSrcSet, getImageUrl } from '../../config/env';
import type { Ad } from '../../services/adsService';

const formatPrice = (price: number | string) =>
  new Intl.NumberFormat('fr-FR').format(Number(price));

const PERIOD_LABELS: Record<string, string> = {
  daily: 'jour',
  weekly: 'semaine',
  monthly: 'mois',
  yearly: 'an',
};

interface AdCardProps {
  ad: Ad & { paymentMode?: string };
  /** Notifie la consultation (suivi des recommandations). */
  onSelect?: (ad: Ad) => void;
  /** En liste, l'image passe à gauche et la description devient visible. */
  layout?: 'grid' | 'list';
}

export const AdCard: React.FC<AdCardProps> = ({ ad, onSelect, layout = 'grid' }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const photo = ad.photos?.[0] ? getImageUrl(ad.photos[0], 800) : null;
  const photoSrcSet = getImageSrcSet(ad.photos?.[0]);
  const period = ad.paymentMode ? PERIOD_LABELS[ad.paymentMode] : undefined;
  const hasRating = (ad.reviewsCount ?? 0) > 0;
  const isList = layout === 'list';

  const specs = [
    ad.bedrooms ? { icon: BedDouble, label: `${ad.bedrooms} ch.` } : null,
    ad.bathrooms ? { icon: Bath, label: `${ad.bathrooms} sdb` } : null,
    ad.area ? { icon: Maximize2, label: `${ad.area} m²` } : null,
  ].filter(Boolean) as Array<{ icon: typeof Bath; label: string }>;

  return (
    <article
      className={`group relative flex rounded-[1.35rem] bg-white p-2.5 shadow-[0_2px_16px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(15,23,42,0.12)] ${
        isList ? 'flex-col sm:flex-row sm:items-stretch sm:gap-1' : 'flex-col'
      }`}
    >
      {/* ---------- Visuel encadré de blanc ---------- */}
      <div
        className={`relative shrink-0 overflow-hidden rounded-[1rem] bg-slate-100 ${
          isList ? 'aspect-[4/3] sm:aspect-auto sm:w-60' : 'aspect-[4/3]'
        }`}
      >
        {photo && !imageFailed ? (
          <>
            {!imageLoaded && <div className="absolute inset-0 animate-pulse bg-slate-200" />}
            <img
              src={photo}
              srcSet={photoSrcSet}
              sizes="(min-width: 1280px) 22rem, (min-width: 640px) 45vw, 100vw"
              alt={ad.title}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageFailed(true)}
              className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-[1.04] group-hover:blur-[2px] ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-slate-300">
            <ImageOff className="h-7 w-7" />
            <span className="text-xs font-medium">Photo indisponible</span>
          </div>
        )}

        <div className="absolute left-2.5 top-2.5">
          <FavoriteButton
            adId={ad.id}
            className="h-9 w-9 rounded-full bg-white/25 text-white backdrop-blur-md transition-colors hover:bg-white/40"
          />
        </div>

        {hasRating && (
          <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-slate-900/35 px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
            <Star className="h-3 w-3 fill-white text-white" />
            {ad.averageRating?.toFixed(2)}
          </span>
        )}

        {/* Au survol, le visuel s'estompe au profit d'une action claire. */}
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex items-center gap-2 rounded-full bg-slate-900/55 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md">
            <Eye className="h-4 w-4" />
            Voir l'annonce
          </span>
        </span>

        {!ad.isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/55">
            <span className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-slate-900">
              Déjà loué
            </span>
          </div>
        )}
      </div>

      {/* ---------- Contenu ---------- */}
      <div className={`flex flex-1 flex-col px-2 pb-1 pt-3.5 ${isList ? 'sm:px-4' : ''}`}>
        <h3 className="line-clamp-1 font-bold tracking-tight text-slate-900">
          {/* Vrai lien, et non un bouton : le clic milieu, « ouvrir dans un
              nouvel onglet » et l'indexation fonctionnent. Le pseudo-élément
              étend la zone cliquable à toute la carte sans imbrication. */}
          <Link
            to={`/detail/${ad.id}`}
            onClick={() => onSelect?.(ad)}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            {ad.title}
          </Link>
        </h3>

        <div className="mt-1.5 flex items-end justify-between gap-3">
          <p className="flex min-w-0 items-center gap-1.5 text-[0.82rem] text-slate-400">
            <DemarcheurBadge show={ad.isDemarcheur} />
            <span className="truncate">{ad.location}</span>
          </p>
          <p className="shrink-0 whitespace-nowrap font-bold tracking-tight text-slate-900">
            {formatPrice(ad.price)}
            <span className="ml-1 text-xs font-medium text-slate-400">FCFA</span>
            {period && <span className="ml-1 text-xs font-normal text-slate-400">/{period}</span>}
          </p>
        </div>

        {isList && ad.description && (
          <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-slate-500">{ad.description}</p>
        )}

        {specs.length > 0 && (
          <ul
            className={`mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-slate-100 pt-3 text-[0.8rem] text-slate-500 ${
              isList ? '' : 'group-hover:border-slate-100'
            }`}
          >
            {specs.map((spec) => (
              <li key={spec.label} className="flex items-center gap-1.5">
                <spec.icon className="h-3.5 w-3.5 text-slate-300" />
                {spec.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
};
