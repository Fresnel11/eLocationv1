import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface PublicSetting {
  key: string;
  value: string;
  type: string;
}

export const usePublicSettings = () => {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicSettings();
  }, []);

  const fetchPublicSettings = async () => {
    try {
      const response = await api.get('/public/settings');
      const settingsMap = response.data.reduce((acc: Record<string, any>, setting: PublicSetting) => {
        let value = setting.value;
        
        // Convert based on type
        if (setting.type === 'boolean') {
          value = setting.value === 'true';
        } else if (setting.type === 'number') {
          value = parseFloat(setting.value);
        }
        
        acc[setting.key] = value;
        return acc;
      }, {});
      
      setSettings(settingsMap);
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres publics:', error);
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading, refetch: fetchPublicSettings };
};