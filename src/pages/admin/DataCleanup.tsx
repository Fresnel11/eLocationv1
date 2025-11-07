import React, { useState, useEffect } from 'react';
import { Trash2, Clock, Database, AlertTriangle, CheckCircle, Play, Calendar, BarChart3 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface CleanupStats {
  obsoleteData: Record<string, number>;
  storageImpact: {
    totalSize: string;
    reclaimableSpace: string;
    mediaFiles: string;
    logFiles: string;
  };
  lastCleanup: string;
  recommendations: Array<{
    type: string;
    count: number;
    description: string;
  }>;
}

interface CleanupHistory {
  cleanups: Array<{
    id: string;
    date: string;
    types: string[];
    itemsCleaned: number;
    spaceReclaimed: string;
    duration: string;
    status: string;
    triggeredBy: string;
  }>;
}

export const DataCleanup: React.FC = () => {
  const [stats, setStats] = useState<CleanupStats | null>(null);
  const [history, setHistory] = useState<CleanupHistory | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['sessions', 'logs']);
  const [olderThan, setOlderThan] = useState('30');
  const [isRunning, setIsRunning] = useState(false);
  const [dryRun, setDryRun] = useState(true);
  const [scheduleFrequency, setScheduleFrequency] = useState('weekly');
  const { success, error } = useToast();

  const cleanupTypes = [
    { id: 'sessions', name: 'Sessions expirées', description: 'Sessions utilisateur inactives' },
    { id: 'logs', name: 'Logs anciens', description: 'Journaux d\'activité obsolètes' },
    { id: 'media', name: 'Médias inutilisés', description: 'Fichiers non référencés' },
    { id: 'bookings', name: 'Réservations expirées', description: 'Réservations terminées anciennes' },
    { id: 'notifications', name: 'Notifications lues', description: 'Notifications anciennes lues' },
    { id: 'temp_files', name: 'Fichiers temporaires', description: 'Fichiers temporaires système' }
  ];

  useEffect(() => {
    loadStats();
    loadHistory();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get('/admin/cleanup/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await api.get('/admin/cleanup/history');
      setHistory(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement de l\'historique:', err);
    }
  };

  const handleTypeToggle = (typeId: string) => {
    setSelectedTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleRunCleanup = async () => {
    if (selectedTypes.length === 0) {
      error('Erreur', 'Veuillez sélectionner au moins un type de données');
      return;
    }

    setIsRunning(true);
    try {
      const response = await api.post('/admin/cleanup/run', {
        types: selectedTypes,
        olderThan: parseInt(olderThan),
        dryRun
      });

      if (dryRun) {
        success('Simulation terminée', `${response.data.summary.totalItems} éléments seraient supprimés`);
      } else {
        success('Nettoyage terminé', `${response.data.summary.totalItems} éléments supprimés`);
        loadStats();
        loadHistory();
      }
    } catch (err) {
      error('Erreur', 'Échec du nettoyage des données');
    } finally {
      setIsRunning(false);
    }
  };

  const handleScheduleCleanup = async () => {
    try {
      await api.post('/admin/cleanup/schedule', {
        frequency: scheduleFrequency,
        types: selectedTypes,
        olderThan: parseInt(olderThan)
      });
      success('Planification créée', 'Nettoyage automatique configuré');
    } catch (err) {
      error('Erreur', 'Échec de la planification');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Outils de nettoyage</h1>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Espace récupérable</p>
                <p className="text-2xl font-bold text-gray-900">{stats.storageImpact.reclaimableSpace}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Trash2 className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sessions expirées</p>
                <p className="text-2xl font-bold text-gray-900">{stats.obsoleteData.expiredSessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Logs anciens</p>
                <p className="text-2xl font-bold text-gray-900">{stats.obsoleteData.oldLogs.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Dernier nettoyage</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Date(stats.lastCleanup).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration du nettoyage */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Trash2 className="h-5 w-5 mr-2" />
            Configurer le nettoyage
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Types de données à nettoyer
              </label>
              <div className="space-y-2">
                {cleanupTypes.map(type => (
                  <label key={type.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type.id)}
                      onChange={() => handleTypeToggle(type.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <span className="text-sm font-medium text-gray-900">{type.name}</span>
                      <p className="text-xs text-gray-500">{type.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supprimer les données plus anciennes que (jours)
              </label>
              <select
                value={olderThan}
                onChange={(e) => setOlderThan(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="7">7 jours</option>
                <option value="30">30 jours</option>
                <option value="60">60 jours</option>
                <option value="90">90 jours</option>
                <option value="180">6 mois</option>
                <option value="365">1 an</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="dryRun"
                checked={dryRun}
                onChange={(e) => setDryRun(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="dryRun" className="ml-2 text-sm text-gray-700">
                Mode simulation (ne supprime pas réellement)
              </label>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleRunCleanup}
                disabled={isRunning || selectedTypes.length === 0}
                className="flex-1"
                variant={dryRun ? "outline" : "default"}
              >
                {isRunning ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    {dryRun ? 'Simulation...' : 'Nettoyage...'}
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    {dryRun ? 'Simuler' : 'Nettoyer'}
                  </>
                )}
              </Button>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Nettoyage automatique</h3>
              <div className="flex space-x-2">
                <select
                  value={scheduleFrequency}
                  onChange={(e) => setScheduleFrequency(e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="daily">Quotidien</option>
                  <option value="weekly">Hebdomadaire</option>
                  <option value="monthly">Mensuel</option>
                </select>
                <Button onClick={handleScheduleCleanup} variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Planifier
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Recommandations */}
        {stats && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Recommandations
            </h2>

            <div className="space-y-4">
              {stats.recommendations.map((rec, index) => (
                <div key={index} className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-yellow-800">
                        {rec.count.toLocaleString()} éléments
                      </p>
                      <p className="text-sm text-yellow-700">{rec.description}</p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <CheckCircle className="h-5 w-5 text-blue-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Impact du nettoyage</h3>
                    <p className="mt-2 text-sm text-blue-700">
                      Espace total récupérable: <strong>{stats.storageImpact.reclaimableSpace}</strong>
                    </p>
                    <p className="text-sm text-blue-700">
                      Fichiers médias: {stats.storageImpact.mediaFiles} • 
                      Logs: {stats.storageImpact.logFiles}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Historique */}
      {history && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Historique des nettoyages</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Types
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Éléments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Espace
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durée
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Déclencheur
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.cleanups.map((cleanup) => (
                  <tr key={cleanup.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(cleanup.date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cleanup.types.join(', ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cleanup.itemsCleaned.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cleanup.spaceReclaimed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cleanup.duration}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        cleanup.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {cleanup.status === 'completed' ? 'Terminé' : 'En cours'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cleanup.triggeredBy === 'scheduled' ? 'Automatique' : 'Manuel'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};