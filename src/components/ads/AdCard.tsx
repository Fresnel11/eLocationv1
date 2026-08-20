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
      className={`group relative flex rounded-3xl bg-white p-3 border border-slate-200/80 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover ${
        isList ? 'flex-col sm:flex-row sm:items-stretch sm:gap-2' : 'flex-col'
      }`}
    >
      {/* ---------- Visuel encadré de blanc ---------- */}
      <div
        className={`relative shrink-0 overflow-hidden rounded-2xl bg-slate-100 ${
          isList ? 'aspect-[4/3] sm:aspect-auto sm:w-64' : 'aspect-[4/3]'
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
              className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-90 ${
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

        <div className="absolute left-3 top-3 z-10">
          <FavoriteButton
            adId={ad.id}
            className="h-9 w-9 rounded-full bg-slate-900/40 text-white backdrop-blur-md transition-all hover:bg-slate-900/60 hover:scale-110"
          />
        </div>

        {hasRating && (
          <span className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-slate-900/50 px-3 py-1 text-xs font-bold text-amber-300 backdrop-blur-md border border-white/10 shadow-sm">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {ad.averageRating?.toFixed(1)}
          </span>
        )}

        {/* Au survol, le visuel affiche une pilule élégante */}
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-slate-950/20 backdrop-blur-[2px]">
          <span className="flex items-center gap-2 rounded-full bg-blue-600/90 px-4 py-2 text-xs font-bold text-white shadow-lg backdrop-blur-md tracking-wide uppercase">
            <Eye className="h-4 w-4" />
            Voir l'annonce
          </span>
        </span>

        {!ad.isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs">
            <span className="rounded-xl bg-red-600 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-white shadow-md">
              Déjà loué
            </span>
          </div>
        )}
      </div>

      {/* ---------- Contenu ---------- */}
      <div className={`flex flex-1 flex-col px-1.5 pb-1 pt-3.5 ${isList ? 'sm:px-4' : ''}`}>
        <h3 className="line-clamp-1 font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
          <Link
            to={`/detail/${ad.id}`}
            onClick={() => onSelect?.(ad)}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            {ad.title}
          </Link>
        </h3>

        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-slate-500">
            <DemarcheurBadge show={ad.isDemarcheur} />
            <span className="truncate">{ad.location}</span>
          </p>
          
          <p className="shrink-0 whitespace-nowrap text-base font-extrabold text-blue-600 tracking-tight">
            {formatPrice(ad.price)}
            <span className="ml-1 text-xs font-bold text-blue-600/80">FCFA</span>
            {period && <span className="ml-0.5 text-xs font-normal text-slate-400">/{period}</span>}
          </p>
        </div>

        {isList && ad.description && (
          <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-slate-600">{ad.description}</p>
        )}

        {specs.length > 0 && (
          <ul
            className={`mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-slate-100 pt-3 text-xs font-medium text-slate-500`}
          >
            {specs.map((spec) => (
              <li key={spec.label} className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                <spec.icon className="h-3.5 w-3.5 text-blue-500" />
                {spec.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
};
