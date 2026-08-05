import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import IconArrowLeft from '~icons/line-md/arrow-left';
import IconChevronLeft from '~icons/line-md/chevron-left';
import IconChevronRight from '~icons/line-md/chevron-right';
import IconMapMarker from '~icons/line-md/map-marker';
import IconCalendar from '~icons/line-md/calendar';
import IconStar from '~icons/line-md/star';
import IconPhone from '~icons/line-md/phone';
import IconChat from '~icons/line-md/chat';
import IconPlay from '~icons/line-md/play';
import IconImage from '~icons/line-md/image';
import IconAlert from '~icons/line-md/alert';
// Absents de line-md : repli sur Material Symbols, même famille visuelle.
import IconBed from '~icons/material-symbols/bed-outline';
import IconBath from '~icons/material-symbols/bathtub-outline';
import IconArea from '~icons/material-symbols/square-foot';
import IconEye from '~icons/material-symbols/visibility-outline';
import IconShare from '~icons/material-symbols/share-outline';
import IconShield from '~icons/material-symbols/verified-user-outline';
import { DemarcheurBadge } from '../components/ui/DemarcheurBadge';
import IconWifi from '~icons/material-symbols/wifi';
import IconTv from '~icons/material-symbols/tv-outline';
import IconAc from '~icons/material-symbols/mode-fan-outline';
import IconKitchen from '~icons/material-symbols/kitchen-outline';
import IconParking from '~icons/material-symbols/local-parking';
import { FavoriteButton } from '../components/ui/FavoriteButton';
import { ShareAdModal } from '../components/ui/ShareAdModal';
import { AddReviewModal } from '../components/ui/AddReviewModal';
import { ReviewsList } from '../components/ui/ReviewsList';
import { ClickableAvatar } from '../components/ui/ClickableAvatar';
import { RecommendedAds } from '../components/RecommendedAds';
import { adsService, type Ad } from '../services/adsService';
import { getAdShareUrl, getImageSrcSet, getImageUrl, getMediaUrl } from '../config/env';
import { useAuth } from '../context/AuthContext';

type IconType = React.ComponentType<{ className?: string }>;

const AMENITY_LABELS: Record<string, { label: string; icon: IconType }> = {
  wifi: { label: 'WiFi', icon: IconWifi },
  tv: { label: 'Télévision', icon: IconTv },
  ac: { label: 'Climatisation', icon: IconAc },
  kitchen: { label: 'Cuisine équipée', icon: IconKitchen },
  parking: { label: 'Parking', icon: IconParking },
};

const PERIOD_LABELS: Record<string, string> = {
  daily: '/ jour',
  weekly: '/ semaine',
  monthly: '/ mois',
  yearly: '/ an',
};

const formatPrice = (price: number | string) =>
  new Intl.NumberFormat('fr-FR').format(Number(price));

type Media = { type: 'image' | 'video'; url: string; srcSet?: string };

/** Bloc blanc flottant : brique de base de la mise en page. */
const Panel: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className = '',
  children,
}) => (
  <section
    className={`rounded-[1.35rem] bg-white shadow-[0_2px_16px_rgba(15,23,42,0.06)] ${className}`}
  >
    {children}
  </section>
);

const DetailSkeleton: React.FC = () => (
  <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
    <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
    <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_23rem]">
      <div className="space-y-5">
        <div className="rounded-[1.35rem] bg-white p-2.5">
          <div className="aspect-[16/10] animate-pulse rounded-[1rem] bg-slate-200" />
        </div>
        <div className="space-y-3 rounded-[1.35rem] bg-white p-6">
          <div className="h-7 w-3/4 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
      <div className="h-72 animate-pulse rounded-[1.35rem] bg-white" />
    </div>
  </div>
);

export const AdDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ad, setAd] = useState<(Ad & { paymentMode?: string; video?: string; views?: number }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [index, setIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewsKey, setReviewsKey] = useState(0);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    setLoading(true);
    setNotFound(false);
    setIndex(0);
    window.scrollTo({ top: 0 });

    adsService
      .getAdById(id)
      .then((data) => !cancelled && setAd(data as Ad))
      .catch(() => !cancelled && setNotFound(true))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [id]);

  const media: Media[] = ad
    ? [
        ...(ad.photos ?? []).map((photo) => ({
          type: 'image' as const,
          url: getImageUrl(photo, 1600),
          srcSet: getImageSrcSet(photo, [800, 1200, 1600]),
        })),
        ...(ad.video ? [{ type: 'video' as const, url: getMediaUrl(ad.video) }] : []),
      ]
    : [];

  const step = useCallback(
    (direction: 1 | -1) => {
      if (media.length < 2) return;
      setImageFailed(false);
      setIndex((current) => (current + direction + media.length) % media.length);
    },
    [media.length],
  );

  // Flèches du clavier : parcours de la galerie sans quitter le clavier.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [step]);

  if (loading) return <div className="min-h-screen bg-[#F1F2F4]"><DetailSkeleton /></div>;

  if (notFound || !ad) {
    return (
      <div className="min-h-screen bg-[#F1F2F4] px-4 py-20">
        <Panel className="mx-auto max-w-md p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-[1.6rem] text-slate-400">
            <IconImage />
          </div>
          <h1 className="mt-5 text-xl font-bold text-slate-900">Annonce introuvable</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Elle a peut-être été retirée par son propriétaire, ou le lien est incorrect.
          </p>
          <Link
            to="/ads"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            <IconArrowLeft />
            Voir toutes les annonces
          </Link>
        </Panel>
      </div>
    );
  }

  const current = media[index];
  const period = ad.paymentMode ? PERIOD_LABELS[ad.paymentMode] : undefined;
  const hasRating = (ad.reviewsCount ?? 0) > 0;
  const ownerName = `${ad.user?.firstName ?? ''} ${ad.user?.lastName ?? ''}`.trim();
  /**
   * Lien WhatsApp reconstruit à partir du numéro plutôt que d'utiliser
   * whatsappLink tel quel : on y ajoute un message d'ouverture, pour que le
   * locataire n'ait plus qu'à appuyer sur envoyer.
   */
  const whatsappNumber = ((ad as any).whatsappNumber as string | undefined)?.replace(/\D/g, '');
  const whatsapp = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        `Bonjour, je vous contacte au sujet de votre annonce « ${ad.title} » (${formatPrice(
          ad.price,
        )} FCFA) vue sur eLocation Bénin. Est-elle toujours disponible ?`,
      )}`
    : ((ad as any).whatsappLink as string | undefined);

  const specs = [
    ad.bedrooms ? { icon: IconBed, label: 'Chambres', value: ad.bedrooms } : null,
    ad.bathrooms ? { icon: IconBath, label: 'Salles de bain', value: ad.bathrooms } : null,
    ad.area ? { icon: IconArea, label: 'Surface', value: `${ad.area} m²` } : null,
    ad.views ? { icon: IconEye, label: 'Vues', value: ad.views } : null,
  ].filter(Boolean) as Array<{ icon: IconType; label: string; value: string | number }>;

  const amenities = (ad.amenities ?? []).map((value) => AMENITY_LABELS[value]).filter(Boolean);

  /**
   * WhatsApp reste accessible à tous : c'est le canal public de l'annonce.
   * La messagerie intégrée, elle, suppose un compte — on ne l'affiche donc
   * qu'aux personnes connectées plutôt que de les envoyer vers un mur de
   * connexion après le clic.
   */
  const whatsappButton = (extraClass = '', label = 'Contacter sur WhatsApp') =>
    whatsapp ? (
      <a
        href={whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex h-12 items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(37,211,102,0.35)] transition-colors hover:bg-[#1ebe5b] ${extraClass}`}
      >
        <IconPhone />
        <span className="truncate">{label}</span>
      </a>
    ) : null;

  const messageButton = (extraClass = '') =>
    user ? (
      <button
        type="button"
        onClick={() => navigate(`/messages?ad=${ad.id}`)}
        className={`flex h-12 items-center justify-center gap-2 rounded-full bg-slate-100 px-5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 ${extraClass}`}
      >
        <IconChat />
        <span className="truncate">Envoyer un message</span>
      </button>
    ) : null;

  return (
    <div className="min-h-screen bg-[#F1F2F4] pb-24 lg:pb-10">
      <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">
        {/* ---------- Fil d'Ariane ---------- */}
        <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-sm text-slate-500">
          <Link to="/ads" className="inline-flex items-center gap-1.5 transition-colors hover:text-slate-900">
            <IconArrowLeft />
            Annonces
          </Link>
          <span className="text-slate-300">/</span>
          <span className="truncate font-medium text-slate-700">{ad.category?.name}</span>
        </nav>

        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_23rem] lg:items-start">
          <div className="min-w-0 space-y-6">
            {/* ---------- Galerie ---------- */}
            <Panel className="p-2.5">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[1rem] bg-slate-100 sm:aspect-[16/9]">
                {!current || imageFailed ? (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-[2rem] text-slate-300">
                    <IconImage />
                    <span className="text-sm font-medium">Aucune photo disponible</span>
                  </div>
                ) : current.type === 'video' ? (
                  <video src={current.url} controls preload="metadata" className="h-full w-full object-cover">
                    Votre navigateur ne prend pas en charge la lecture de vidéos.
                  </video>
                ) : (
                  <img
                    src={current.url}
                    srcSet={current.srcSet}
                    sizes="(min-width: 1024px) 64rem, 100vw"
                    alt={ad.title}
                    onError={() => setImageFailed(true)}
                    className="h-full w-full object-cover"
                  />
                )}

                {media.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => step(-1)}
                      aria-label="Média précédent"
                      className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[1.35rem] text-slate-700 shadow-lg backdrop-blur-md transition-colors hover:bg-white"
                    >
                      <IconChevronLeft />
                    </button>
                    <button
                      type="button"
                      onClick={() => step(1)}
                      aria-label="Média suivant"
                      className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[1.35rem] text-slate-700 shadow-lg backdrop-blur-md transition-colors hover:bg-white"
                    >
                      <IconChevronRight />
                    </button>
                    <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-900/45 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                      {index + 1} / {media.length}
                    </span>
                  </>
                )}

                <span className="absolute left-3 top-3 rounded-full bg-slate-900/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                  {ad.category?.name}
                </span>

                <div className="absolute right-3 top-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShareOpen(true)}
                    aria-label="Partager l'annonce"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/25 text-[1.2rem] text-white backdrop-blur-md transition-colors hover:bg-white/40"
                  >
                    <IconShare />
                  </button>
                  <FavoriteButton
                    adId={ad.id}
                    className="h-10 w-10 rounded-full bg-white/25 text-white backdrop-blur-md transition-colors hover:bg-white/40"
                  />
                </div>
              </div>

              {media.length > 1 && (
                <div className="mt-2.5 flex gap-2 overflow-x-auto px-0.5 pb-1">
                  {media.map((item, i) => (
                    <button
                      key={`${item.url}-${i}`}
                      type="button"
                      onClick={() => {
                        setImageFailed(false);
                        setIndex(i);
                      }}
                      aria-label={`Média ${i + 1}`}
                      aria-current={i === index}
                      className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl transition-all duration-200 ${
                        i === index
                          ? 'ring-2 ring-blue-600 ring-offset-2'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      {item.type === 'video' ? (
                        <span className="flex h-full w-full items-center justify-center bg-slate-900 text-[1.3rem] text-white">
                          <IconPlay />
                        </span>
                      ) : (
                        <img src={getImageUrl(ad.photos[i], 200)} alt="" className="h-full w-full object-cover" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </Panel>

            {/* ---------- Titre et repères ---------- */}
            <Panel className="p-6">
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-[1.9rem]">
                {ad.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <IconMapMarker />
                  {ad.location}
                </span>
                {hasRating && (
                  <span className="flex items-center gap-1.5">
                    <IconStar className="text-amber-400" />
                    <span className="font-semibold text-slate-900">{ad.averageRating?.toFixed(1)}</span>
                    <span>({ad.reviewsCount} avis)</span>
                  </span>
                )}
                {ad.createdAt && (
                  <span className="flex items-center gap-1.5">
                    <IconCalendar />
                    {new Date(ad.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                )}
              </div>

              {specs.length > 0 && (
                <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {specs.map((spec) => (
                    <div key={spec.label} className="rounded-2xl bg-slate-50 p-4">
                      <spec.icon className="text-[1.4rem] text-blue-600" />
                      <dt className="mt-2 text-xs text-slate-400">{spec.label}</dt>
                      <dd className="text-lg font-bold text-slate-900">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </Panel>

            {ad.description && (
              <Panel className="p-6">
                <h2 className="text-lg font-bold text-slate-900">Description</h2>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-600">
                  {ad.description}
                </p>
              </Panel>
            )}

            {amenities.length > 0 && (
              <Panel className="p-6">
                <h2 className="text-lg font-bold text-slate-900">Équipements</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {amenities.map((amenity) => (
                    <li
                      key={amenity.label}
                      className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-slate-700"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[1.2rem] text-blue-600 shadow-sm">
                        <amenity.icon />
                      </span>
                      <span className="font-medium">{amenity.label}</span>
                    </li>
                  ))}
                </ul>
              </Panel>
            )}

            <Panel className="p-6">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-slate-900">Avis</h2>
                <button
                  type="button"
                  onClick={() => (user ? setReviewOpen(true) : navigate('/login'))}
                  className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
                >
                  Laisser un avis
                </button>
              </div>
              <ReviewsList adId={ad.id} refreshTrigger={reviewsKey} />
            </Panel>
          </div>

          {/* ---------- Colonne collante ---------- */}
          <aside className="min-w-0 space-y-4 lg:sticky lg:top-24">
            <Panel className="p-6">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[1.75rem] font-bold tracking-tight text-slate-900">
                  {formatPrice(ad.price)}
                </span>
                <span className="text-base font-medium text-slate-500">FCFA</span>
                {period && <span className="text-sm font-normal text-slate-400">{period}</span>}
              </div>

              {!ad.isAvailable && (
                <p className="mt-4 flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  <IconAlert />
                  Cette annonce est actuellement indisponible.
                </p>
              )}

              <div className="mt-5 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                <ClickableAvatar
                  avatarUrl={ad.user?.profilePicture}
                  userName={ownerName || 'Propriétaire'}
                  size="md"
                />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">
                    {ownerName || 'Propriétaire'}
                  </p>
                  <DemarcheurBadge show={(ad as any).isDemarcheur} className="mt-0.5" />
                  <Link
                    to={`/user/${ad.user?.id}`}
                    className="text-sm text-blue-600 underline-offset-4 hover:underline"
                  >
                    Voir le profil
                  </Link>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-2.5">
                {whatsappButton('w-full')}
                {messageButton('w-full')}
                <button
                  type="button"
                  onClick={() => setShareOpen(true)}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <IconShare />
                  Partager
                </button>

                {!user && (
                  <p className="pt-1 text-center text-xs leading-relaxed text-slate-400">
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      Connectez-vous
                    </button>{' '}
                    pour écrire au propriétaire depuis la messagerie.
                  </p>
                )}
              </div>
            </Panel>

            <Panel className="flex items-start gap-3 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[1.3rem] text-blue-600">
                <IconShield />
              </span>
              <p className="text-sm leading-relaxed text-slate-500">
                <span className="font-semibold text-slate-900">Restez prudent.</span> Ne versez
                jamais d'argent avant d'avoir visité le bien et rencontré le propriétaire.
              </p>
            </Panel>
          </aside>
        </div>

        <div className="mt-14">
          <RecommendedAds limit={6} />
        </div>
      </div>

      {/* ---------- Barre d'action mobile ---------- */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 items-center gap-3 bg-white/95 px-4 py-3 shadow-[0_-4px_20px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden ${
          whatsapp || user ? 'flex' : 'hidden'
        }`}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold text-slate-900">
            {formatPrice(ad.price)}
            <span className="ml-1 text-sm font-medium text-slate-500">FCFA</span>
            {period && <span className="ml-1 text-sm font-normal text-slate-400">{period}</span>}
          </p>
        </div>
        {/* Libellé court : « Contacter sur WhatsApp » associé à shrink-0
            dépassait la largeur de l'écran et provoquait un défilement
            horizontal sur toute la page. */}
        {whatsapp ? whatsappButton('shrink-0', 'Contacter') : messageButton('shrink-0')}
      </div>

      <ShareAdModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        adUrl={getAdShareUrl(ad.id)}
        adTitle={ad.title}
      />

      <AddReviewModal
        isOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
        adId={ad.id}
        adTitle={ad.title}
        onReviewAdded={() => setReviewsKey((key) => key + 1)}
      />
    </div>
  );
};
