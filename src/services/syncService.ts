import { offlineService } from './offlineService';
import api from './api';

class SyncService {
  private syncInterval: NodeJS.Timeout | null = null;

  startAutoSync(intervalMs = 300000) { // 5 minutes par défaut
    this.stopAutoSync();
    
    this.syncInterval = setInterval(() => {
      if (navigator.onLine) {
        this.syncData();
      }
    }, intervalMs);
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async syncData() {
    if (!navigator.onLine) return;

    try {
      // Synchroniser les annonces populaires
      const adsResponse = await api.get('/ads?limit=50&sort=popular');
      await offlineService.saveAds(adsResponse.data);

      // Synchroniser les catégories
      const categoriesResponse = await api.get('/categories');
      await offlineService.cacheData('categories', categoriesResponse.data);

      // Marquer la dernière synchronisation
      await offlineService.cacheData('lastSync', Date.now());
      
      console.log('Synchronisation terminée');
    } catch (error) {
      console.error('Erreur de synchronisation:', error);
    }
  }

  async getLastSyncTime(): Promise<number | null> {
    return await offlineService.getCachedData('lastSync');
  }
}

export const syncService = new SyncService();