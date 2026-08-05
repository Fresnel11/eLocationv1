import { api } from './api';
import { LocationService } from './locationService';
import { CacheService } from './cacheService';

export interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  photos: string[];
  videos: string[]; // Ajout de la propriété videos
  bedrooms: number;
  bathrooms: number;
  area: number;
  amenities: string[];
  isAvailable: boolean;
  category: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  createdAt: string;
  updatedAt: string;
  /** Agrégées par le serveur avec la liste : aucun appel supplémentaire. */
  averageRating?: number;
  reviewsCount?: number;
  /** L'auteur de l'annonce est un démarcheur vérifié. */
  isDemarcheur?: boolean;
}

interface AdsResponse {
  ads: Ad[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface LocationParams {
  latitude?: number;
  longitude?: number;
  radius?: number;
}

/** Filtres appliqués par le serveur, sur l'ensemble du catalogue. */
export interface AdFilters {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  sortBy?: 'createdAt' | 'price' | 'title';
  sortOrder?: 'ASC' | 'DESC';
}

export const adsService = {
  async getAds(
    page: number = 1,
    limit: number = 10,
    location?: LocationParams,
    userCity?: string,
    filters: AdFilters = {},
  ): Promise<AdsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    // Les filtres partent au serveur : ils portent sur tout le catalogue et non
    // sur la seule page affichée, contrairement au filtrage client précédent.
    if (filters.search) params.append('search', filters.search);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.minPrice !== undefined) params.append('minPrice', String(filters.minPrice));
    if (filters.maxPrice !== undefined) params.append('maxPrice', String(filters.maxPrice));
    if (filters.location) params.append('location', filters.location);
    if (filters.bedrooms !== undefined) params.append('bedrooms', String(filters.bedrooms));
    if (filters.bathrooms !== undefined) params.append('bathrooms', String(filters.bathrooms));
    if (filters.amenities?.length) params.append('amenities', filters.amenities.join(','));

    // Géolocalisation par coordonnées (existant)
    if (location?.latitude && location?.longitude) {
      params.append('userLatitude', location.latitude.toString());
      params.append('userLongitude', location.longitude.toString());
      params.append('radius', (location.radius || 20).toString());
      params.append('sortBy', 'distance');
    }
    // Nouvelle géolocalisation par ville
    else {
      if (filters.sortBy) {
        params.append('sortBy', filters.sortBy);
        params.append('sortOrder', filters.sortOrder || 'DESC');
      }
      const detectedCity = userCity || await LocationService.detectUserCity();
      if (detectedCity) {
        params.append('userCity', detectedCity);
      }
    }

    // La clé de cache doit inclure les filtres, sinon deux recherches
    // différentes se renverraient mutuellement leurs résultats.
    const cacheKey = CacheService.generateKey('ads', {
      page, limit,
      lat: location?.latitude,
      lng: location?.longitude,
      radius: location?.radius,
      city: userCity,
      q: params.toString(),
    });

    // Vérifier le cache
    const cached = CacheService.get<AdsResponse>(cacheKey);
    if (cached) {
      return cached;
    }
    
    const response = await api.get(`/ads?${params.toString()}`);
    
    // Mettre en cache (TTL plus court pour première page)
    const ttl = page === 1 ? 5 * 60 * 1000 : 15 * 60 * 1000;
    CacheService.set(cacheKey, response.data, ttl);
    
    return response.data;
  },

  /**
   * Vide le cache local des listes d'annonces.
   *
   * La page 1 est mise en cache 5 minutes : sans cette purge, une annonce
   * qu'on vient de publier reste invisible pendant tout ce délai, alors que
   * l'API la renvoie déjà.
   */
  invalidateListCache(): void {
    CacheService.invalidate('ads');
  },

  async getAdById(id: string): Promise<Ad> {
    const response = await api.get(`/ads/${id}`);
    return response.data;
  },

  async searchAds(params: any): Promise<Ad[]> {
    const response = await api.get('/ads/search', { params });
    return response.data;
  },

  async getAdsWithCityPriority(page: number = 1, limit: number = 10, userCity?: string): Promise<AdsResponse> {
    return this.getAds(page, limit, undefined, userCity);
  }
};