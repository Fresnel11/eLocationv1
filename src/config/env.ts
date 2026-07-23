// Configuration centralisée des URLs du backend.
// Les valeurs viennent des fichiers .env.development / .env.production (préfixe VITE_).

export const API_URL: string =
  import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Chaîne vide => temps réel désactivé (voir websocketService).
export const WS_URL: string = import.meta.env.VITE_WS_URL ?? 'ws://localhost:3001';

export const VAPID_PUBLIC_KEY: string =
  import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

// Construit l'URL absolue d'un média (photo, vidéo, avatar) renvoyé par l'API.
// Les chemins déjà absolus (http/https) sont laissés tels quels.
export const getMediaUrl = (path?: string | null): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};
