import React, { useState, useEffect } from 'react';
import { Eye, Check, X, Trash2, AlertTriangle, Image } from 'lucide-react';

import { DataTable } from '../../components/admin/DataTable';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  isActive: boolean;
  createdAt: string;
  photos: string[];
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  category: {
    id: string;
    name: string;
  };
}

export const AdsManagement: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [moderationModal, setModerationModal] = useState<{
    adId: string;
    action: 'approve' | 'reject';
  } | null>(null);
  const [moderationReason, setModerationReason] = useState('');
  const { success, error } = useToast();

  useEffect(() => {
    fetchAds();
  }, [pagination.page, filters]);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.category && { category: filters.category }),
      });

      const response = await api.get(`/admin/ads?${params}`);
      setAds(response.data.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.total,
        totalPages: response.data.totalPages,
      }));
    } catch (err) {
      error('Erreur', 'Impossible de charger les annonces');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleModeration = async () => {
    if (!moderationModal) return;

    try {
      setActionLoading(moderationModal.adId);
      const status = moderationModal.action === 'approve' ? 'active' : 'rejected';
      
      await api.put(`/admin/ads/${moderationModal.adId}/status`, {
        status,
        reason: moderationReason || undefined,
      });

      success('Succès', `Annonce ${moderationModal.action === 'approve' ? 'activée' : 'désactivée'} avec succès`);
      setModerationModal(null);
      setModerationReason('');
      fetchAds();
    } catch (err) {
      error('Erreur', 'Impossible de modifier le statut de l\'annonce');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (adId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) return;
    
    try {
      setActionLoading(adId);
      await api.delete(`/admin/ads/${adId}`);
      success('Succès', 'Annonce supprimée avec succès');
      fetchAds();
    } catch (err: any) {
      error('Erreur', err.response?.data?.message || 'Impossible de supprimer l\'annonce');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
        isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? 'Actif' : 'Inactif'}
      </span>
    );
  };

  const columns = [
    {
      key: 'title',
      label: 'Annonce',
      render: (_, row: Ad) => (
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
            {row.photos?.[0] ? (
              <img 
                src={row.photos[0]} 
                alt={row.title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Image className="h-6 w-6 text-gray-400" />
            )}
          </div>
          <div className="ml-3 min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">{row.title}</p>
            <p className="text-xs text-gray-500 truncate">{row.location}</p>
            <p className="text-xs font-medium text-blue-600">{row.price}€</p>
          </div>
        </div>
      ),
    },
    {
      key: 'user',
      label: 'Propriétaire',
      render: (_, row: Ad) => (
        <div>
          <p className="text-sm font-medium text-gray-900">
            {row.user.firstName} {row.user.lastName}
          </p>
          <p className="text-xs text-gray-500">{row.user.email}</p>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Catégorie',
      render: (_, row: Ad) => row.category?.name || '-',
    },
    {
      key: 'status',
      label: 'Statut',
      render: (_, row: Ad) => getStatusBadge(row.isActive),
    },
    {
      key: 'createdAt',
      label: 'Créé le',
      render: (value: string) => new Date(value).toLocaleDateString('fr-FR'),
    },
  ];

  const renderActions = (row: Ad) => (
    <div className="flex items-center space-x-1">
      <button
        onClick={() => setModerationModal({ adId: row.id, action: row.isActive ? 'reject' : 'approve' })}
        disabled={actionLoading === row.id}
        className={`p-1 sm:p-2 rounded-md transition-colors disabled:opacity-50 ${
          row.isActive 
            ? 'text-red-600 hover:bg-red-50' 
            : 'text-green-600 hover:bg-green-50'
        }`}
        title={row.isActive ? 'Désactiver' : 'Activer'}
      >
        {row.isActive ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
      </button>
      
      <button
        onClick={() => handleDelete(row.id)}
        disabled={actionLoading === row.id}
        className="p-1 sm:p-2 rounded-md text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
        title="Supprimer"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  const renderFilters = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <select
        value={filters.status}
        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
      >
        <option value="">Tous les statuts</option>
        <option value="active">Actif</option>
        <option value="inactive">Inactif</option>
      </select>
      
      <select
        value={filters.category}
        onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
      >
        <option value="">Toutes les catégories</option>
        <option value="immobilier">Immobilier</option>
        <option value="vehicules">Véhicules</option>
        <option value="electronique">Électronique</option>
      </select>
    </div>
  );

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Gestion des Annonces</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Modérez et gérez les annonces de la plateforme
          </p>
        </div>

        <DataTable
          columns={columns}
          data={ads}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          searchPlaceholder="Rechercher par titre ou lieu..."
          filters={renderFilters()}
          actions={renderActions}
        />
      </div>

      {/* Modal de modération */}
      {moderationModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setModerationModal(null)} />
            
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-orange-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {moderationModal.action === 'approve' ? 'Activer' : 'Désactiver'} l'annonce
                </h3>
              </div>

              {moderationModal.action === 'reject' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Raison de la désactivation (optionnel)
                  </label>
                  <textarea
                    value={moderationReason}
                    onChange={(e) => setModerationReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Expliquez pourquoi cette annonce est désactivée..."
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setModerationModal(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleModeration}
                  disabled={actionLoading === moderationModal.adId}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${
                    moderationModal.action === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {moderationModal.action === 'approve' ? 'Activer' : 'Désactiver'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};