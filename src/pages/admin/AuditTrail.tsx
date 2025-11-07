import React, { useState, useEffect } from 'react';
import { Shield, User, Calendar, Filter, Search, Eye, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

interface AuditEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  changes?: {
    before: any;
    after: any;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  metadata: {
    source: string;
    sessionId: string;
    requestId: string;
  };
}

interface AuditSummary {
  totalActions: number;
  uniqueUsers: number;
  uniqueEntities: number;
  actionBreakdown: Record<string, number>;
}

const actionLabels = {
  create: 'Création',
  update: 'Modification',
  delete: 'Suppression',
  approve: 'Approbation',
  reject: 'Rejet',
  login: 'Connexion',
  logout: 'Déconnexion'
};

const entityLabels = {
  user: 'Utilisateur',
  ad: 'Annonce',
  booking: 'Réservation',
  review: 'Avis',
  category: 'Catégorie',
  setting: 'Paramètre'
};

export const AuditTrail: React.FC = () => {
  const [auditData, setAuditData] = useState<{
    data: AuditEntry[];
    summary: AuditSummary;
    total: number;
    totalPages: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);
  const [filters, setFilters] = useState({
    entityType: '',
    entityId: '',
    userId: '',
    action: '',
    startDate: '',
    endDate: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50
  });
  const { error } = useToast();

  useEffect(() => {
    fetchAuditTrail();
  }, [filters, pagination.page]);

  const fetchAuditTrail = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.entityType && { entityType: filters.entityType }),
        ...(filters.entityId && { entityId: filters.entityId }),
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.action && { action: filters.action }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      });

      const response = await api.get(`/admin/audit/trail?${params}`);
      setAuditData(response.data);
    } catch (err) {
      error('Erreur', 'Impossible de charger l\'audit trail');
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const filteredEntries = auditData?.data.filter(entry => {
    if (!filters.search) return true;
    const searchTerm = filters.search.toLowerCase();
    return (
      entry.action.toLowerCase().includes(searchTerm) ||
      entry.entity.toLowerCase().includes(searchTerm) ||
      entry.entityId.toLowerCase().includes(searchTerm) ||
      `${entry.user.firstName} ${entry.user.lastName}`.toLowerCase().includes(searchTerm)
    );
  }) || [];

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
        <Shield className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
      </div>

      {/* Résumé */}
      {auditData?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total actions</p>
                <p className="text-2xl font-bold text-gray-900">{auditData.summary.totalActions}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Utilisateurs uniques</p>
                <p className="text-2xl font-bold text-gray-900">{auditData.summary.uniqueUsers}</p>
              </div>
              <User className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Entités modifiées</p>
                <p className="text-2xl font-bold text-gray-900">{auditData.summary.uniqueEntities}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Actions principales</p>
              <div className="space-y-1">
                {Object.entries(auditData.summary.actionBreakdown)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 3)
                  .map(([action, count]) => (
                    <div key={action} className="flex justify-between text-xs">
                      <span>{actionLabels[action] || action}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="font-medium text-gray-900">Filtres</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Rechercher..."
              className="pl-10"
            />
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
          <Select
            value={filters.entityType}
            onChange={(value) => setFilters(prev => ({ ...prev, entityType: value }))}
            options={[
              { value: '', label: 'Toutes les entités' },
              { value: 'user', label: 'Utilisateurs' },
              { value: 'ad', label: 'Annonces' },
              { value: 'booking', label: 'Réservations' },
              { value: 'review', label: 'Avis' },
              { value: 'category', label: 'Catégories' }
            ]}
          />
          <Button
            onClick={() => setFilters({
              entityType: '', entityId: '', userId: '', action: '', 
              startDate: '', endDate: '', search: ''
            })}
            variant="outline"
          >
            Réinitialiser
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
            placeholder="Date de début"
          />
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
            placeholder="Date de fin"
          />
          <Input
            value={filters.entityId}
            onChange={(e) => setFilters(prev => ({ ...prev, entityId: e.target.value }))}
            placeholder="ID entité"
          />
        </div>
      </div>

      {/* Liste des entrées d'audit */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Horodatage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(entry.timestamp).toLocaleString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {entry.user.firstName} {entry.user.lastName}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(entry.user.role)}`}>
                          {entry.user.role}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(entry.action)}`}>
                      {actionLabels[entry.action] || entry.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{entityLabels[entry.entity] || entry.entity}</div>
                      <div className="text-xs text-gray-500 font-mono">{entry.entityId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {entry.ipAddress}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      onClick={() => setSelectedEntry(entry)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      Détails
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {auditData && auditData.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            variant="outline"
          >
            Précédent
          </Button>
          <span className="flex items-center px-4 py-2 text-sm text-gray-700">
            Page {pagination.page} sur {auditData.totalPages}
          </span>
          <Button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === auditData.totalPages}
            variant="outline"
          >
            Suivant
          </Button>
        </div>
      )}

      {/* Modal de détails */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Détails de l'audit</h3>
              <Button
                onClick={() => setSelectedEntry(null)}
                variant="outline"
                size="sm"
              >
                Fermer
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Informations générales</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <div><strong>ID:</strong> {selectedEntry.id}</div>
                    <div><strong>Action:</strong> {actionLabels[selectedEntry.action]}</div>
                    <div><strong>Entité:</strong> {entityLabels[selectedEntry.entity]} ({selectedEntry.entityId})</div>
                    <div><strong>Utilisateur:</strong> {selectedEntry.user.firstName} {selectedEntry.user.lastName}</div>
                    <div><strong>Rôle:</strong> {selectedEntry.user.role}</div>
                    <div><strong>Timestamp:</strong> {new Date(selectedEntry.timestamp).toLocaleString('fr-FR')}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Informations techniques</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <div><strong>IP:</strong> {selectedEntry.ipAddress}</div>
                    <div><strong>User Agent:</strong> {selectedEntry.userAgent}</div>
                    <div><strong>Source:</strong> {selectedEntry.metadata.source}</div>
                    <div><strong>Session ID:</strong> {selectedEntry.metadata.sessionId}</div>
                    <div><strong>Request ID:</strong> {selectedEntry.metadata.requestId}</div>
                  </div>
                </div>
              </div>
              
              {selectedEntry.changes && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Modifications</h4>
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-sm font-medium text-red-700 mb-2">Avant:</h5>
                      <pre className="bg-red-50 border border-red-200 rounded p-3 text-xs overflow-auto">
                        {JSON.stringify(selectedEntry.changes.before, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-green-700 mb-2">Après:</h5>
                      <pre className="bg-green-50 border border-green-200 rounded p-3 text-xs overflow-auto">
                        {JSON.stringify(selectedEntry.changes.after, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};