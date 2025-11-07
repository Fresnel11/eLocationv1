import { useState, useEffect } from 'react';
import { offlineService } from '../services/offlineService';
import { Ad } from '../types/ad';

export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [savedAds, setSavedAds] = useState<string[]>([]);
  const [offlineAds, setOfflineAds] = useState<Ad[]>([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      offlineService.syncData();
    };
    
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initialiser le service offline
    offlineService.init().then(() => {
      loadSavedAds();
      loadOfflineAds();
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadSavedAds = async () => {
    try {
      const ads = await offlineService.getSavedAds();
      setSavedAds(ads);
    } catch (error) {
      console.error('Erreur chargement annonces sauvées:', error);
    }
  };

  const loadOfflineAds = async () => {
    try {
      const ads = await offlineService.getOfflineAds();
      setOfflineAds(ads);
    } catch (error) {
      console.error('Erreur chargement annonces hors ligne:', error);
    }
  };

  const saveAdForOffline = async (adId: string) => {
    try {
      await offlineService.saveAdForOffline(adId);
      setSavedAds(prev => [...prev, adId]);
    } catch (error) {
      console.error('Erreur sauvegarde annonce:', error);
    }
  };

  const removeSavedAd = async (adId: string) => {
    try {
      await offlineService.removeSavedAd(adId);
      setSavedAds(prev => prev.filter(id => id !== adId));
    } catch (error) {
      console.error('Erreur suppression annonce:', error);
    }
  };

  return {
    isOnline,
    savedAds,
    offlineAds,
    saveAdForOffline,
    removeSavedAd,
    loadOfflineAds
  };
};