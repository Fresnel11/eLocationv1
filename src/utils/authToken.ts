import { cookieUtils } from './cookies';

/**
 * Source unique de lecture de la session.
 *
 * Le token n'est pas toujours dans localStorage : une connexion sans
 * « Se souvenir de moi » (et l'inscription) le range dans sessionStorage, et
 * l'option « Se souvenir de moi » ajoute un cookie de 30 jours. Toute lecture
 * qui n'interroge qu'un seul de ces emplacements renvoie null pour des
 * utilisateurs pourtant connectés — l'appel part alors sans en-tête
 * Authorization et l'API répond 401.
 */
export const getStoredToken = (): string | null =>
  localStorage.getItem('token') || sessionStorage.getItem('token') || cookieUtils.get('token');

export const getStoredUserRaw = (): string | null =>
  localStorage.getItem('user') || sessionStorage.getItem('user') || cookieUtils.get('user');
