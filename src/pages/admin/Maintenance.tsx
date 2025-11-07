import React, { useState, useEffect } from 'react';
import { Wrench, Power, PowerOff, Download, Database, Calendar, HardDrive } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

interface MaintenanceStatus {
  isEnabled: boolean;
  message: string;
}

interface Backup {
  name: string;
  createdAt: string;
  size: string;
  status: string;
  tables?: {
    users: number;
    ads: number;
    bookings: number;
  };
}

export const Maintenance: React.FC = () => {
  const [maintenanceStatus, setMaintenanceStatus] = useState<MaintenanceStatus>({
    isEnabled: false,
    message: ''
  });
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { success, error } = useToast();

  useEffect(() => {
    fetchMaintenanceStatus();
    fetchBackups();
  }, []);

  const fetchMaintenanceStatus = async () => {
    try {
      const response = await api.get('/admin/maintenance/status');
      setMaintenanceStatus(response.data);
      setMaintenanceMessage(response.data.message);
    } catch (err) {
      error('Erreur', 'Impossible de charger le statut de maintenance');
    }
  };

  const fetchBackups = async () => {
    try {
      const response = await api.get('/admin/backup/list');
      setBackups(response.data);
    } catch (err) {
      error('Erreur', 'Impossible de charger la liste des sauvegardes');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMaintenance = async () => {
    setActionLoading('maintenance');
    try {
      if (maintenanceStatus.isEnabled) {
        await api.post('/admin/maintenance/disable');
        success('Mode maintenance désactivé', 'Le site est maintenant accessible');
      } else {
        await api.post('/admin/maintenance/enable', { message: maintenanceMessage });
        success('Mode maintenance activé', 'Le site est maintenant en maintenance');
      }
      await fetchMaintenanceStatus();
    } catch (err) {
      error('Erreur', 'Impossible de modifier le mode maintenance');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateBackup = async () => {
    setActionLoading('backup');
    try {
      const response = await api.post('/admin/backup/create');
      success('Sauvegarde créée', `Sauvegarde ${response.data.name} créée avec succès`);
      await fetchBackups();
    } catch (err) {
      error('Erreur', 'Impossible de créer la sauvegarde');
    } finally {
      setActionLoading(null);
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
      <div className="flex items-center gap-3">
        <Wrench className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Maintenance & Sauvegarde</h1>
      </div>

      {/* Mode Maintenance */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              maintenanceStatus.isEnabled ? 'bg-red-100' : 'bg-green-100'
            }`}>
              {maintenanceStatus.isEnabled ? 
                <PowerOff className="w-5 h-5 text-red-600" /> : 
                <Power className="w-5 h-5 text-green-600" />
              }
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Mode Maintenance</h3>
              <p className="text-sm text-gray-500">
                {maintenanceStatus.isEnabled ? 'Site actuellement en maintenance' : 'Site accessible au public'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              maintenanceStatus.isEnabled 
                ? 'bg-red-100 text-red-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {maintenanceStatus.isEnabled ? 'Activé' : 'Désactivé'}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message de maintenance
            </label>
            <Input
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              placeholder="Message affiché aux utilisateurs pendant la maintenance"
            />
          </div>

          <Button
            onClick={handleToggleMaintenance}
            disabled={actionLoading === 'maintenance'}
            className={`flex items-center gap-2 ${
              maintenanceStatus.isEnabled 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'
            } text-white`}
          >
            {maintenanceStatus.isEnabled ? 
              <Power className="w-4 h-4" /> : 
              <PowerOff className="w-4 h-4" />
            }
            {actionLoading === 'maintenance' ? 'Modification...' : 
              (maintenanceStatus.isEnabled ? 'Désactiver la maintenance' : 'Activer la maintenance')
            }
          </Button>
        </div>
      </div>

      {/* Sauvegardes */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Sauvegardes de données</h3>
          </div>
          <Button
            onClick={handleCreateBackup}
            disabled={actionLoading === 'backup'}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {actionLoading === 'backup' ? 'Création...' : 'Créer une sauvegarde'}
          </Button>
        </div>

        {backups.length === 0 ? (
          <div className="text-center py-8">
            <Database className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucune sauvegarde disponible</p>
          </div>
        ) : (
          <div className="space-y-3">
            {backups.map((backup) => (
              <div key={backup.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <HardDrive className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{backup.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(backup.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                      <span>Taille: {backup.size}</span>
                      {backup.tables && (
                        <span>
                          {backup.tables.users} utilisateurs, {backup.tables.ads} annonces, {backup.tables.bookings} réservations
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    {backup.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-yellow-900 mb-2">⚠️ Attention</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Le mode maintenance bloque l'accès au site pour tous les utilisateurs sauf les administrateurs</li>
          <li>• Les sauvegardes sont essentielles pour la récupération des données en cas de problème</li>
          <li>• Il est recommandé de créer des sauvegardes régulières, surtout avant les mises à jour</li>
        </ul>
      </div>
    </div>
  );
};