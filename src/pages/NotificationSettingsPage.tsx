import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Mail, Smartphone, Plus, Trash2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { SearchAlertModal } from '../components/ui/SearchAlertModal';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

interface NotificationPreference {
  id: string;
  type: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
}

interface SearchAlert {
  id: string;
  name: string;
  location?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  isActive: boolean;
  createdAt: string;
}

const notificationTypes = [
  { key: 'new_ad_match', label: 'Nouvelles annonces correspondantes', description: 'Alertes pour les annonces qui correspondent à vos critères' },
  { key: 'booking_reminder', label: 'Rappels de réservation', description: 'Rappels avant le début de vos réservations' },
  { key: 'booking_status_change', label: 'Changements de statut', description: 'Notifications lors des changements de statut de réservation' },
  { key: 'price_change', label: 'Changements de prix', description: 'Alertes de prix pour vos annonces favorites' },
  { key: 'message_received', label: 'Nouveaux messages', description: 'Notifications pour les nouveaux messages reçus' },
  { key: 'review_received', label: 'Nouveaux avis', description: 'Notifications pour les avis reçus sur vos annonces' }
];

export const NotificationSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [searchAlerts, setSearchAlerts] = useState<SearchAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prefsResponse, alertsResponse] = await Promise.all([
        api.get('/notifications/preferences'),
        api.get('/notifications/search-alerts')
      ]);
      setPreferences(prefsResponse.data);
      setSearchAlerts(alertsResponse.data);
    } catch (err) {
      error('Erreur', 'Impossible de charger les paramètres');
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (type: string, emailEnabled: boolean, pushEnabled: boolean) => {
    try {
      await api.patch('/notifications/preferences', { type, emailEnabled, pushEnabled });
      setPreferences(prev => {
        const existing = prev.find(p => p.type === type);
        if (existing) {
          return prev.map(p => p.type === type ? { ...p, emailEnabled, pushEnabled } : p);
        } else {
          return [...prev, { id: Date.now().toString(), type, emailEnabled, pushEnabled }];
        }
      });
      success('Paramètres mis à jour', 'Vos préférences ont été sauvegardées');
    } catch (err) {
      error('Erreur', 'Impossible de mettre à jour les préférences');
    }
  };

  const deleteSearchAlert = async (alertId: string) => {
    try {
      await api.delete(`/notifications/search-alerts/${alertId}`);
      setSearchAlerts(prev => prev.filter(alert => alert.id !== alertId));
      success('Alerte supprimée', 'L\'alerte de recherche a été supprimée');
    } catch (err) {
      error('Erreur', 'Impossible de supprimer l\'alerte');
    }
  };

  const toggleSearchAlert = async (alertId: string, isActive: boolean) => {
    try {
      await api.patch(`/notifications/search-alerts/${alertId}`, { isActive });
      setSearchAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, isActive } : alert
      ));
      success('Alerte mise à jour', `Alerte ${isActive ? 'activée' : 'désactivée'}`);
    } catch (err) {
      error('Erreur', 'Impossible de modifier l\'alerte');
    }
  };

  const getPreference = (type: string) => {
    return preferences.find(p => p.type === type) || { emailEnabled: true, pushEnabled: true };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Paramètres de notifications</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Préférences de notifications */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Préférences de notifications</h2>
            </div>

            <div className="space-y-6">
              {notificationTypes.map((type) => {
                const pref = getPreference(type.key);
                return (
                  <div key={type.key} className="border-b border-gray-100 pb-6 last:border-b-0">
                    <div className="mb-3">
                      <h3 className="font-medium text-gray-900">{type.label}</h3>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                    <div className="flex gap-6">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={pref.emailEnabled}
                          onChange={(e) => updatePreference(type.key, e.target.checked, pref.pushEnabled)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <Mail className="h-4 w-4 ml-2 mr-1 text-gray-500" />
                        <span className="text-sm text-gray-700">Email</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={pref.pushEnabled}
                          onChange={(e) => updatePreference(type.key, pref.emailEnabled, e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <Smartphone className="h-4 w-4 ml-2 mr-1 text-gray-500" />
                        <span className="text-sm text-gray-700">Push</span>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Alertes de recherche */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Alertes de recherche</h2>
              </div>
              <Button
                onClick={() => setIsAlertModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nouvelle alerte
              </Button>
            </div>

            {searchAlerts.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune alerte configurée
                </h3>
                <p className="text-gray-600 mb-4">
                  Créez des alertes pour être notifié des nouvelles annonces correspondant à vos critères.
                </p>
                <Button onClick={() => setIsAlertModalOpen(true)}>
                  Créer ma première alerte
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {searchAlerts.map((alert) => (
                  <div key={alert.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-gray-900">{alert.name}</h3>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={alert.isActive}
                              onChange={(e) => toggleSearchAlert(alert.id, e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-600">Active</span>
                          </label>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          {alert.location && <p>📍 {alert.location}</p>}
                          {(alert.minPrice || alert.maxPrice) && (
                            <p>💰 {alert.minPrice || 0} - {alert.maxPrice || '∞'} FCFA</p>
                          )}
                          {(alert.bedrooms || alert.bathrooms) && (
                            <p>🏠 {alert.bedrooms ? `${alert.bedrooms}+ ch.` : ''} {alert.bathrooms ? `${alert.bathrooms}+ sdb.` : ''}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            Créée le {new Date(alert.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteSearchAlert(alert.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <SearchAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        onAlertCreated={fetchData}
      />
    </div>
  );
};