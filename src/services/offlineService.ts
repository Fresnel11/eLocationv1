import { Ad } from '../types/ad';

interface CachedData {
  ads: Ad[];
  savedAds: string[];
  categories: any[];
  lastSync: number;
}

class OfflineService {
  private dbName = 'elocation-offline';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('ads')) {
          db.createObjectStore('ads', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('savedAds')) {
          db.createObjectStore('savedAds', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
      };
    });
  }

  async saveAds(ads: Ad[]): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['ads'], 'readwrite');
    const store = transaction.objectStore('ads');
    
    for (const ad of ads) {
      await store.put(ad);
    }
  }

  async getOfflineAds(): Promise<Ad[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['ads'], 'readonly');
      const store = transaction.objectStore('ads');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveAdForOffline(adId: string): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['savedAds'], 'readwrite');
    const store = transaction.objectStore('savedAds');
    
    await store.put({ id: adId, savedAt: Date.now() });
  }

  async removeSavedAd(adId: string): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['savedAds'], 'readwrite');
    const store = transaction.objectStore('savedAds');
    
    await store.delete(adId);
  }

  async getSavedAds(): Promise<string[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['savedAds'], 'readonly');
      const store = transaction.objectStore('savedAds');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result.map(item => item.id));
      request.onerror = () => reject(request.error);
    });
  }

  async cacheData(key: string, data: any): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['cache'], 'readwrite');
    const store = transaction.objectStore('cache');
    
    await store.put({ key, data, timestamp: Date.now() });
  }

  async getCachedData(key: string, maxAge = 3600000): Promise<any> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);
      
      request.onsuccess = () => {
        const result = request.result;
        if (result && Date.now() - result.timestamp < maxAge) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  async syncData(): Promise<void> {
    if (!this.isOnline()) return;
    
    try {
      // Synchroniser les données importantes
      const response = await fetch('/api/ads?limit=50');
      const ads = await response.json();
      
      await this.saveAds(ads);
      await this.cacheData('lastSync', Date.now());
    } catch (error) {
      console.error('Erreur de synchronisation:', error);
    }
  }
}

export const offlineService = new OfflineService();