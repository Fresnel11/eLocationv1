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

export const adsService = {
  async getAds(page: number = 1, limit: number = 10, location?: LocationParams, userCity?: string): Promise<AdsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    // Géolocalisation par coordonnées (existant)
    if (location?.latitude && location?.longitude) {
      params.append('userLatitude', location.latitude.toString());
      params.append('userLongitude', location.longitude.toString());
      params.append('radius', (location.radius || 20).toString());
      params.append('sortBy', 'distance');
    }
    // Nouvelle géolocalisation par ville
    else {
      const detectedCity = userCity || await LocationService.detectUserCity();
      if (detectedCity) {
        params.append('userCity', detectedCity);
      }
    }
    
    // Générer clé de cache
    const cacheKey = CacheService.generateKey('ads', {
      page, limit, 
      lat: location?.latitude,
      lng: location?.longitude, 
      radius: location?.radius,
      city: userCity
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