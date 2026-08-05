import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  RotateCcw,
  Search,
  SearchX,
  SlidersHorizontal,
  Wallet,
  X,
} from 'lucide-react';
import { AdCard } from '../components/ads/AdCard';
import { AdFilters, AMENITIES, CITIES, type AdFilterState } from '../components/ads/AdFilters';
import { AnimatedIcon } from '../components/ui/AnimatedIcon';
import { PillSelect } from '../components/ui/PillSelect';
import { CreateAdButton } from '../components/ui/CreateAdButton';
import { RecommendedAds } from '../components/RecommendedAds';
import { adsService, type Ad, type AdFilters as AdQueryFilters } from '../services/adsService';
import { recommendationsService } from '../services/recommendationsService';
import { api } from '../services/api';

const PER_PAGE = 12;

const SORT_OPTIONS = [
  { value: 'recent', label: 'Plus récentes' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
];

const BUDGET_OPTIONS = [
  { label: 'Tous les budgets', min: '', max: '' },
  { label: "Moins de 50 000", min: '', max: '50000' },
  { label: '50 000 – 150 000', min: '50000', max: '150000' },
  { label: '150 000 – 300 000', min: '150000', max: '300000' },
  { label: 'Plus de 300 000', min: '300000', max: '' },
];

/**
 * L'état des filtres vit dans l'URL : le bouton Retour fonctionne, une
 * recherche se partage par lien et un rafraîchissement ne perd rien.
 */
const readFilters = (params: URLSearchParams): AdFilterState => ({
  search: params.get('search') ?? '',
  categoryId: params.get('categorie') ?? '',
  location: params.get('ville') ?? '',
  minPrice: params.get('prixMin') ?? '',
  maxPrice: params.get('prixMax') ?? '',
  bedrooms: params.get('chambres') ?? '',
  bathrooms: params.get('sdb') ?? '',
  amenities: params.get('equipements')?.split(',').filter(Boolean) ?? [],
  sort: params.get('tri') ?? 'recent',
});

const writeFilters = (filters: AdFilterState, page: number): URLSearchParams => {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.categoryId) params.set('categorie', filters.categoryId);
  if (filters.location) params.set('ville', filters.location);
  if (filters.minPrice) params.set('prixMin', filters.minPrice);
  if (filters.maxPrice) params.set('prixMax', filters.maxPrice);
  if (filters.bedrooms) params.set('chambres', filters.bedrooms);
  if (filters.bathrooms) params.set('sdb', filters.bathrooms);
  if (filters.amenities.length) params.set('equipements', filters.amenities.join(','));
  if (filters.sort !== 'recent') params.set('tri', filters.sort);
  if (page > 1) params.set('page', String(page));
  return params;
};

const toQuery = (filters: AdFilterState): AdQueryFilters => {
  const [sortBy, sortOrder] =
    filters.sort === 'price-asc'
      ? (['price', 'ASC'] as const)
      : filters.sort === 'price-desc'
        ? (['price', 'DESC'] as const)
        : (['createdAt', 'DESC'] as const);

  return {
    search: filters.search || undefined,
    categoryId: filters.categoryId || undefined,
    location: filters.location || undefined,
    minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
    bedrooms: filters.bedrooms ? Number(filters.bedrooms) : undefined,
    bathrooms: filters.bathrooms ? Number(filters.bathrooms) : undefined,
    amenities: filters.amenities.length ? filters.amenities : undefined,
    sortBy,
    sortOrder,
  };
};

const CardSkeleton: React.FC = () => (
  <div className="rounded-[1.35rem] bg-white p-2.5 shadow-[0_2px_16px_rgba(15,23,42,0.06)]">
    <div className="aspect-[4/3] animate-pulse rounded-[1rem] bg-slate-200" />
    <div className="space-y-2.5 px-2 pb-1 pt-3.5">
      <div className="h-4 w-4/5 animate-pulse rounded bg-slate-200" />
      <div className="flex justify-between gap-4">
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-1/4 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="mt-3 h-3 w-2/3 animate-pulse rounded bg-slate-100" />
    </div>
  </div>
);

export const AdsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => readFilters(searchParams), [searchParams]);
  const page = Number(searchParams.get('page') ?? 1);

  const [ads, setAds] = useState<Ad[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [categories, setCategories] = useState<Array<{ value: string; label: string }>>([]);
  const [panelOpen, setPanelOpen] = useState(false);

  // Le champ de recherche est local pour rester fluide ; l'URL ne se met à jour
  // qu'après une pause de frappe, ce qui évite une requête par caractère.
  const [searchInput, setSearchInput] = useState(filters.search);
  const searchInputRef = useRef(filters.search);

  const applyFilters = useCallback(
    (patch: Partial<AdFilterState>, resetPage = true) => {
      const next = { ...readFilters(searchParams), ...patch };
      setSearchParams(writeFilters(next, resetPage ? 1 : page), { replace: true });
    },
    [searchParams, setSearchParams, page],
  );

  // Recherche depuis la navbar : synchronise le champ si l'URL change ailleurs.
  useEffect(() => {
    if (filters.search !== searchInputRef.current) {
      searchInputRef.current = filters.search;
      setSearchInput(filters.search);
    }
  }, [filters.search]);

  useEffect(() => {
    if (searchInput === filters.search) return;
    const timer = setTimeout(() => {
      searchInputRef.current = searchInput;
      applyFilters({ search: searchInput });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, filters.search, applyFilters]);

  useEffect(() => {
    api
      .get('/categories')
      .then((res) => setCategories(res.data.map((c: any) => ({ value: c.id, label: c.name }))))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFailed(false);

    adsService
      .getAds(page, PER_PAGE, undefined, undefined, toQuery(filters))
      .then((response) => {
        if (cancelled) return;
        setAds(response.ads ?? []);
        setTotal(response.pagination.total);
        setTotalPages(response.pagination.pages || 1);
      })
      .catch(() => {
        if (cancelled) return;
        setAds([]);
        setTotal(0);
        setFailed(true);
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const goToPage = (nextPage: number) => {
    setSearchParams(writeFilters(filters, nextPage), { replace: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // La navigation est portée par le lien de la carte ; on ne trace que la consultation.
  const trackAdView = (ad: Ad) => {
    recommendationsService.trackView(ad.id, ad.category.id, ad.location, ad.price);
  };

  const clearAll = () => setSearchParams(new URLSearchParams(), { replace: true });

  /** Nombre de filtres actifs hors catégorie (pilotée par les pastilles). */
  const panelFilterCount =
    (filters.location ? 1 : 0) +
    (filters.minPrice || filters.maxPrice ? 1 : 0) +
    (filters.bedrooms ? 1 : 0) +
    (filters.bathrooms ? 1 : 0) +
    filters.amenities.length;

  const activeChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; clear: Partial<AdFilterState> }> = [];
    if (filters.search) chips.push({ key: 'search', label: `« ${filters.search} »`, clear: { search: '' } });
    if (filters.bedrooms) chips.push({ key: 'bed', label: `${filters.bedrooms}+ chambres`, clear: { bedrooms: '' } });
    if (filters.bathrooms) chips.push({ key: 'bath', label: `${filters.bathrooms}+ sdb`, clear: { bathrooms: '' } });
    filters.amenities.forEach((value) => {
      const amenity = AMENITIES.find((a) => a.value === value);
      chips.push({
        key: `am-${value}`,
        label: amenity?.label ?? value,
        clear: { amenities: filters.amenities.filter((a) => a !== value) },
      });
    });
    return chips;
  }, [filters]);

  const budgetValue = `${filters.minPrice}|${filters.maxPrice}`;

  return (
    <div className="min-h-screen bg-[#F1F2F4]">
      {/* ---------- Recherche + pastilles de catégories ---------- */}
      <div className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <div className="relative lg:max-w-md lg:flex-1">
            <Search className="pointer-events-none absolute left-1 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Rechercher une maison, un appartement, une villa..."
              aria-label="Rechercher une annonce"
              className="h-10 w-full border-none bg-transparent pl-8 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto lg:ml-auto lg:overflow-visible">
            <span className="hidden shrink-0 text-sm text-slate-400 xl:inline">Recommandé :</span>

            {categories.slice(0, 5).map((category) => {
              const active = filters.categoryId === category.value;
              return (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => applyFilters({ categoryId: active ? '' : category.value })}
                  aria-pressed={active}
                  className={`h-10 shrink-0 rounded-full px-5 text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-blue-600 text-white shadow-[0_4px_14px_rgba(37,99,235,0.35)]'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {category.label}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setPanelOpen(true)}
              className="flex h-10 shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <AnimatedIcon name="filter" fallback={SlidersHorizontal} size={16} />
              Filtres
              {panelFilterCount > 0 && <span className="text-slate-400">({panelFilterCount})</span>}
            </button>
          </div>
        </div>
      </div>

      {/* ---------- Contenu ---------- */}
      <div className="mx-auto max-w-[1500px] px-4 py-7 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">
            Annonces à louer{' '}
            <span className="text-base font-medium text-slate-400" aria-live="polite">
              {loading ? '(chargement...)' : `(${total} résultat${total > 1 ? 's' : ''})`}
            </span>
          </h1>

          {/* Rappel de l'action principale au niveau du contenu : depuis la
              liste, publier est le geste naturel de qui ne trouve pas son bien. */}
          <CreateAdButton className="hidden self-start xl:inline-flex" />

          <div className="grid gap-3 sm:grid-cols-3 xl:w-auto xl:grid-cols-[13rem_13rem_13rem]">
            <PillSelect
              icon={MapPin}
              label="Ville"
              value={filters.location}
              onChange={(location) => applyFilters({ location })}
              searchable
              searchPlaceholder="Rechercher une ville"
              options={[
                { value: '', label: 'Tout le Bénin' },
                ...CITIES.map((city) => ({ value: city, label: city })),
              ]}
            />
            <PillSelect
              icon={Wallet}
              label="Budget"
              value={budgetValue}
              onChange={(value) => {
                const [minPrice, maxPrice] = value.split('|');
                applyFilters({ minPrice, maxPrice });
              }}
              options={BUDGET_OPTIONS.map((option) => ({
                value: `${option.min}|${option.max}`,
                label: option.label,
              }))}
            />
            <PillSelect
              icon={ArrowUpDown}
              label="Trier"
              value={filters.sort}
              onChange={(sort) => applyFilters({ sort })}
              options={SORT_OPTIONS}
            />
          </div>
        </div>

        {activeChips.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => applyFilters(chip.clear)}
                className="group flex items-center gap-1.5 rounded-full bg-white py-1.5 pl-3.5 pr-2.5 text-sm text-slate-700 shadow-[0_2px_8px_rgba(15,23,42,0.05)] transition-colors hover:text-slate-900"
              >
                {chip.label}
                <X className="h-3.5 w-3.5 text-slate-400 transition-colors group-hover:text-slate-700" />
              </button>
            ))}
            <button
              type="button"
              onClick={clearAll}
              className="ml-1 text-sm font-medium text-slate-500 underline-offset-4 transition-colors hover:text-slate-900 hover:underline"
            >
              Tout effacer
            </button>
          </div>
        )}

        <div className="mt-6">
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : failed ? (
            <div className="rounded-[1.35rem] bg-white py-16 text-center shadow-[0_2px_16px_rgba(15,23,42,0.06)]">
              <p className="font-semibold text-slate-900">Chargement impossible</p>
              <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-500">
                Les annonces n'ont pas pu être récupérées. Vérifiez votre connexion.
              </p>
              <button
                type="button"
                onClick={() => setSearchParams(new URLSearchParams(searchParams), { replace: true })}
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-slate-900 px-6 text-sm font-medium text-white transition-colors hover:bg-slate-800"
              >
                <RotateCcw className="h-4 w-4" />
                Réessayer
              </button>
            </div>
          ) : ads.length === 0 ? (
            <div className="rounded-[1.35rem] bg-white py-16 text-center shadow-[0_2px_16px_rgba(15,23,42,0.06)]">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <AnimatedIcon name="search-empty" fallback={SearchX} size={28} trigger="loop" />
              </div>
              <p className="font-semibold text-slate-900">Aucune annonce ne correspond</p>
              <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-500">
                Essayez d'élargir votre budget ou de retirer un filtre.
              </p>
              <button
                type="button"
                onClick={clearAll}
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-slate-900 px-6 text-sm font-medium text-white transition-colors hover:bg-slate-800"
              >
                <RotateCcw className="h-4 w-4" />
                Effacer les filtres
              </button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {ads.map((ad) => (
                <AdCard key={ad.id} ad={ad} onSelect={trackAdView} />
              ))}
            </div>
          )}
        </div>

        {totalPages > 1 && !loading && ads.length > 0 && (
          <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Pagination">
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              aria-label="Page précédente"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-600 shadow-[0_2px_10px_rgba(15,23,42,0.06)] transition-colors hover:text-slate-900 disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Fenêtre glissante : 5 pages autour de la page courante. */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              return Math.max(1, start) + i;
            })
              .filter((n) => n <= totalPages)
              .map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => goToPage(n)}
                  aria-current={n === page ? 'page' : undefined}
                  className={`h-11 min-w-[2.75rem] rounded-full px-3 text-sm font-semibold transition-colors ${
                    n === page
                      ? 'bg-blue-600 text-white shadow-[0_4px_14px_rgba(37,99,235,0.35)]'
                      : 'bg-white text-slate-600 shadow-[0_2px_10px_rgba(15,23,42,0.06)] hover:text-slate-900'
                  }`}
                >
                  {n}
                </button>
              ))}

            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              aria-label="Page suivante"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-600 shadow-[0_2px_10px_rgba(15,23,42,0.06)] transition-colors hover:text-slate-900 disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        )}

        {!loading && ads.length > 0 && (
          <div className="mt-14">
            <RecommendedAds limit={6} />
          </div>
        )}
      </div>

      {/* ---------- Panneau de filtres ---------- */}
      {panelOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
            onClick={() => setPanelOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[88vh] animate-slide-up flex-col rounded-t-[1.75rem] bg-white sm:inset-y-0 sm:left-auto sm:right-0 sm:w-[26rem] sm:max-h-none sm:rounded-l-[1.75rem] sm:rounded-tr-none">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <h2 className="text-lg font-bold text-slate-900">Filtres</h2>
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                aria-label="Fermer les filtres"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-2">
              <AdFilters value={filters} onChange={applyFilters} categories={categories} hideCategory />
            </div>

            <div className="flex gap-3 border-t border-slate-100 px-6 py-5">
              <button
                type="button"
                onClick={clearAll}
                className="h-12 flex-1 rounded-full border border-slate-200 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                Réinitialiser
              </button>
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                className="h-12 flex-[2] rounded-full bg-blue-600 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(37,99,235,0.35)] transition-colors hover:bg-blue-700"
              >
                Voir {total} résultat{total > 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
