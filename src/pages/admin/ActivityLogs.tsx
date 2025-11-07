import React, { useState, useEffect } from 'react';
import { FileText, User, Calendar, Filter, Search } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

interface ActivityLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  oldData: any;
  newData: any;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

const actionLabels = {
  create: 'Création',
  update: 'Modification',
  delete: 'Suppression',
  login: 'Connexion',
  logout: 'Déconnexion',
  approve: 'Approbation',
  reject: 'Rejet',
  enable: 'Activation',
  disable: 'Désactivation'
};

const entityLabels = {
  user: 'Utilisateur',
  ad: 'Annonce',
  booking: 'Réservation',
  review: 'Avis',
  report: 'Signalement',
  category: 'Catégorie',
  setting: 'Paramètre'
};

export const ActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });
  const { error } = useToast();

  useEffect(() => {
    fetchLogs();
  }, [filters, pagination.page]);

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.action && { action: filters.action })
      });

      const response = await api.get(`/admin/logs?${params}`);
      setLogs(response.data.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.total,
        totalPages: response.data.totalPages
      }));
    } catch (err) {
      error('Erreur', 'Impossible de charger les logs d\'activité');
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'approve': return 'bg-green-100 text-green-800';
      case 'reject': return 'bg-red-100 text-red-800';
      case 'login': return 'bg-purple-100 text-purple-800';
      case 'logout': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatData = (data: any) => {
    if (!data) return null;
    return JSON.stringify(data, null, 2);
  };

  const filteredLogs = logs.filter(log => {
    if (!filters.search) return true;
    const searchTerm = filters.search.toLowerCase();
    return (
      log.action.toLowerCase().includes(searchTerm) ||
      log.entity.toLowerCase().includes(searchTerm) ||
      `${log.user.firstName} ${log.user.lastName}`.toLowerCase().includes(searchTerm)
    );
  });

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
        <FileText className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Logs d'Activité</h1>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="font-medium text-gray-900">Filtres</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recherche
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Rechercher..."
                className="pl-10"
              />
            </div>
          </div>
          <Select
            value={filters.action}
            onChange={(value) => setFilters(prev => ({ ...prev, action: value }))}
            options={[
              { value: '', label: 'Toutes les actions' },
              { value: 'create', label: 'Création' },
              { value: 'update', label: 'Modification' },
              { value: 'delete', label: 'Suppression' },
              { value: 'approve', label: 'Approbation' },
              { value: 'reject', label: 'Rejet' }
            ]}
          />
          <Button
            onClick={() => setFilters({ userId: '', action: '', search: '' })}
            variant="outline"
          >
            Réinitialiser
          </Button>
        </div>
      </div>

      {/* Liste des logs */}
      {filteredLogs.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun log trouvé</h3>
          <p className="text-gray-500">Aucune activité ne correspond aux filtres sélectionnés</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <div key={log.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {log.user.firstName} {log.user.lastName}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {new Date(log.createdAt).toLocaleString('fr-FR')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                    {actionLabels[log.action] || log.action}
                  </span>
                  <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                    {entityLabels[log.entity] || log.entity}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Action:</span>
                  <span className="ml-2 text-gray-900">
                    {actionLabels[log.action] || log.action} {entityLabels[log.entity] || log.entity}
                  </span>
                </div>
                {log.entityId && (
                  <div>
                    <span className="font-medium text-gray-700">ID Entité:</span>
                    <span className="ml-2 text-gray-900 font-mono text-xs">{log.entityId}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-700">IP:</span>
                  <span className="ml-2 text-gray-900">{log.ipAddress}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Navigateur:</span>
                  <span className="ml-2 text-gray-900 truncate">{log.userAgent}</span>
                </div>
              </div>

              {(log.oldData || log.newData) && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-800">
                    Voir les détails des données
                  </summary>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {log.oldData && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Anciennes données:</h4>
                        <pre className="bg-red-50 border border-red-200 rounded p-3 text-xs overflow-auto max-h-40">
                          {formatData(log.oldData)}
                        </pre>
                      </div>
                    )}
                    {log.newData && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Nouvelles données:</h4>
                        <pre className="bg-green-50 border border-green-200 rounded p-3 text-xs overflow-auto max-h-40">
                          {formatData(log.newData)}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            variant="outline"
          >
            Précédent
          </Button>
          <span className="flex items-center px-4 py-2 text-sm text-gray-700">
            Page {pagination.page} sur {pagination.totalPages}
          </span>
          <Button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.totalPages}
            variant="outline"
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
};