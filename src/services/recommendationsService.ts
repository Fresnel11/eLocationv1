import { api } from './api';
import { Ad } from './adsService';

export const recommendationsService = {
  async getRecommendations(limit: number = 10): Promise<Ad[]> {
    try {
      const response = await api.get(`/recommendations?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des recommandations:', error);
      return [];
    }
  },

  async trackAction(type: string, data: any): Promise<void> {
    try {
      await api.post('/recommendations/track', { type, data });
    } catch (error) {
      console.error('Erreur lors du tracking:', error);
    }
  },

  trackView(adId: string, categoryId: string, location: string, price: number): void {
    this.trackAction('view', {
      adId,
      categoryId,
      location,
      priceRange: [price * 0.8, price * 1.2]
    });
  },

  trackSearch(filters: any): void {
    this.trackAction('search', filters);
  },

  trackFavorite(adId: string, categoryId: string, location: string): void {
    this.trackAction('favorite', {
      adId,
      categoryId,
      location
    });
  }
};