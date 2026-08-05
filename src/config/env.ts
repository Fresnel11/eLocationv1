// Configuration centralisée des URLs du backend.
// Les valeurs viennent des fichiers .env.development / .env.production (préfixe VITE_).

export const API_URL: string =
  import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Chaîne vide => temps réel désactivé (voir websocketService).
export const WS_URL: string = import.meta.env.VITE_WS_URL ?? 'ws://localhost:3001';

export const VAPID_PUBLIC_KEY: string =
  import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

/**
 * Adresse publique du site, utilisée pour les liens partagés.
 *
 * `window.location.origin` suffit en production, mais renvoie « localhost » en
 * développement : un lien copié depuis la machine du développeur serait
 * inutilisable. VITE_SITE_URL permet de forcer le domaine réel.
 */
export const SITE_URL: string =
  import.meta.env.VITE_SITE_URL ||
  (typeof window !== 'undefined' ? window.location.origin : '');

/** URL absolue et partageable d'une annonce. */
export const getAdShareUrl = (adId: string): string => `${SITE_URL}/detail/${adId}`;

// Construit l'URL absolue d'un média (photo, vidéo, avatar) renvoyé par l'API.
// Les chemins déjà absolus (http/https) sont laissés tels quels.
export const getMediaUrl = (path?: string | null): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

/**
 * URL d'une image à la largeur voulue par le contexte d'affichage.
 *
 * Certaines sources distantes (Unsplash, et les CDN d'images en général)
 * acceptent des paramètres de redimensionnement dans l'URL. Les annonces de
 * démonstration stockent « ?w=400&h=300 » : suffisant pour une vignette, mais
 * affiché dans un modal l'image est agrandie 3 à 4 fois et paraît floue.
 * On redemande donc la même image à la taille utile plutôt que d'étirer 400 px.
 *
 * La hauteur est retirée volontairement : le cadrage est déjà assuré en CSS
 * (object-cover), et imposer une hauteur ferait recadrer deux fois.
 *
 * Les fichiers hébergés par l'API sont renvoyés tels quels : ils n'ont pas
 * d'API de redimensionnement (voir la note sur sharp dans le README backend).
 */
export const getImageUrl = (path: string | null | undefined, width: number): string => {
  const url = getMediaUrl(path);
  if (!url) return '';

  try {
    const parsed = new URL(url);
    if (!parsed.searchParams.has('w')) return url;

    parsed.searchParams.set('w', String(width));
    parsed.searchParams.delete('h');
    parsed.searchParams.set('q', '80');
    return parsed.toString();
  } catch {
    // Chemin relatif ou URL non analysable : rien à adapter.
    return url;
  }
};

/**
 * srcSet pour laisser le navigateur choisir la résolution selon la largeur
 * d'affichage ET la densité d'écran : un téléphone ne télécharge pas l'image
 * prévue pour un grand écran.
 */
export const getImageSrcSet = (
  path: string | null | undefined,
  widths: number[] = [400, 800, 1200],
): string | undefined => {
  const url = getMediaUrl(path);
  if (!url) return undefined;

  try {
    if (!new URL(url).searchParams.has('w')) return undefined;
  } catch {
    return undefined;
  }

  return widths.map((width) => `${getImageUrl(path, width)} ${width}w`).join(', ');
};
