import { api } from './api';

export const favoritesService = {
  async addToFavorites(adId: string) {
    const response = await api.post(`/favorites/${adId}`);
    return response.data;
  },

  async removeFromFavorites(adId: string) {
    const response = await api.delete(`/favorites/${adId}`);
    return response.data;
  },

  async isFavorite(adId: string) {
    try {
      const response = await api.get(`/favorites/check/${adId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la vérification du favori:', error);
      return { isFavorite: false };
    }
  },

  async getUserFavorites() {
    const response = await api.get('/favorites');
    return response.data;
  },
};