import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, RotateCcw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

interface SystemSetting {
  id: string;
  key: string;
  value: string;
  description: string;
  type: 'string' | 'number' | 'boolean';
  isPublic: boolean;
}

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { success, error } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/admin/settings');
      setSettings(response.data);
    } catch (err) {
      error('Erreur', 'Impossible de charger les paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (setting: SystemSetting) => {
    setSaving(setting.key);
    try {
      await api.put(`/admin/settings/${setting.key}`, {
        value: setting.value,
        type: setting.type
      });
      success('Paramètre sauvegardé', `${setting.description} mis à jour`);
    } catch (err) {
      error('Erreur', 'Impossible de sauvegarder le paramètre');
    } finally {
      setSaving(null);
    }
  };

  const handleInitialize = async () => {
    setSaving('init');
    try {
      await api.post('/admin/settings/initialize');
      await fetchSettings();
      success('Paramètres initialisés', 'Les paramètres par défaut ont été créés');
    } catch (err) {
      error('Erreur', 'Impossible d\'initialiser les paramètres');
    } finally {
      setSaving(null);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => prev.map(setting => 
      setting.key === key ? { ...setting, value } : setting
    ));
  };

  const renderInput = (setting: SystemSetting) => {
    switch (setting.type) {
      case 'boolean':
        return (
          <select
            value={setting.value}
            onChange={(e) => updateSetting(setting.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="true">Activé</option>
            <option value="false">Désactivé</option>
          </select>
        );
      case 'number':
        return (
          <Input
            type="number"
            value={setting.value}
            onChange={(e) => updateSetting(setting.key, e.target.value)}
            className="w-full"
          />
        );
      default:
        return (
          <Input
            type="text"
            value={setting.value}
            onChange={(e) => updateSetting(setting.key, e.target.value)}
            className="w-full"
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Paramètres de la Plateforme</h1>
        </div>
        <Button
          onClick={handleInitialize}
          disabled={saving === 'init'}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          {saving === 'init' ? 'Initialisation...' : 'Initialiser par défaut'}
        </Button>
      </div>

      {settings.length === 0 ? (
        <div className="text-center py-12">
          <SettingsIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun paramètre configuré</h3>
          <p className="text-gray-500 mb-4">Cliquez sur "Initialiser par défaut" pour créer les paramètres de base</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {settings.map((setting) => (
            <div key={setting.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {setting.description || setting.key}
                  </h3>
                  <p className="text-sm text-gray-500">Clé: {setting.key}</p>
                  {setting.isPublic && (
                    <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Public
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {setting.type}
                  </span>
                </div>
              </div>

              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valeur
                  </label>
                  {renderInput(setting)}
                </div>
                <Button
                  onClick={() => handleSave(setting)}
                  disabled={saving === setting.key}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving === setting.key ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Paramètres disponibles :</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>commission_rate</strong> : Taux de commission sur les transactions (%)</li>
          <li>• <strong>max_photos_per_ad</strong> : Nombre maximum de photos par annonce</li>
          <li>• <strong>auto_approve_ads</strong> : Approbation automatique des annonces</li>
          <li>• <strong>maintenance_mode</strong> : Mode maintenance de la plateforme</li>
          <li>• <strong>contact_email</strong> : Email de contact principal</li>
          <li>• <strong>app_name</strong> : Nom de l'application</li>
          <li>• <strong>app_description</strong> : Description de l'application</li>
        </ul>
      </div>
    </div>
  );
};