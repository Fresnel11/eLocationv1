import { api } from './api';

export const socialService = {
  async trackShare(adId: string, platform: string) {
    try {
      await api.post('/social/share', { adId, platform });
    } catch (error) {
      console.error('Erreur tracking partage:', error);
    }
  },

  async trackInteraction(adId: string, type: string, metadata?: any) {
    try {
      await api.post('/social/interaction', { adId, type, metadata });
    } catch (error) {
      console.error('Erreur tracking interaction:', error);
    }
  },

  async getRecommendations(limit = 10) {
    const response = await api.get(`/social/recommendations?limit=${limit}`);
    return response.data;
  },

  async getShareStats(adId: string) {
    const response = await api.get(`/social/share-stats/${adId}`);
    return response.data;
  },
};