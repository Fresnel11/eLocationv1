import React, { useState, useEffect } from 'react';
import { Eye, Check, X, Calendar, User, Home } from 'lucide-react';

import { DataTable } from '../../components/admin/DataTable';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface Booking {
  id: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  message: string;
  createdAt: string;
  ad: {
    id: string;
    title: string;
    location: string;
  };
  tenant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export const BookingsManagement: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
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
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const { success, error } = useToast();

  useEffect(() => {
    fetchBookings();
  }, [pagination.page, filters]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
      });

      const response = await api.get(`/admin/bookings?${params}`);
      setBookings(response.data.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.total,
        totalPages: response.data.totalPages,
      }));
    } catch (err) {
      error('Erreur', 'Impossible de charger les réservations');
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

  const handleStatusUpdate = async (bookingId: string, status: string, reason?: string) => {
    try {
      setActionLoading(bookingId);
      await api.put(`/admin/bookings/${bookingId}/status`, { status, reason });
      success('Succès', 'Statut de la réservation mis à jour');
      fetchBookings();
    } catch (err) {
      error('Erreur', 'Impossible de modifier le statut');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: 'Confirmé', color: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-800' },
      completed: { label: 'Terminé', color: 'bg-blue-100 text-blue-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate).toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
    const end = new Date(endDate).toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric'
    });
    return `${start} - ${end}`;
  };

  const columns = [
    {
      key: 'booking',
      label: 'Réservation',
      render: (_, row: Booking) => (
        <div>
          <p className="text-sm font-medium text-gray-900 truncate">{row.ad.title}</p>
          <p className="text-xs text-gray-500 truncate">{row.ad.location}</p>
          <div className="flex items-center mt-1">
            <Calendar className="h-3 w-3 text-gray-400 mr-1" />
            <span className="text-xs text-gray-600">{formatDateRange(row.startDate, row.endDate)}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'tenant',
      label: 'Locataire',
      render: (_, row: Booking) => (
        <div>
          <p className="text-sm font-medium text-gray-900">
            {row.tenant.firstName} {row.tenant.lastName}
          </p>
          <p className="text-xs text-gray-500">{row.tenant.email}</p>
        </div>
      ),
    },
    {
      key: 'owner',
      label: 'Propriétaire',
      render: (_, row: Booking) => (
        <div>
          <p className="text-sm font-medium text-gray-900">
            {row.owner.firstName} {row.owner.lastName}
          </p>
          <p className="text-xs text-gray-500">{row.owner.email}</p>
        </div>
      ),
    },
    {
      key: 'price',
      label: 'Prix',
      render: (_, row: Booking) => (
        <span className="text-sm font-medium text-gray-900">{row.totalPrice}€</span>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      render: (_, row: Booking) => getStatusBadge(row.status),
    },
    {
      key: 'createdAt',
      label: 'Créé le',
      render: (value: string) => new Date(value).toLocaleDateString('fr-FR'),
    },
  ];

  const renderActions = (row: Booking) => (
    <div className="flex items-center space-x-1">
      <button
        onClick={() => setSelectedBooking(row)}
        className="p-1 sm:p-2 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
        title="Voir détails"
      >
        <Eye className="h-4 w-4" />
      </button>
      
      {row.status === 'pending' && (
        <>
          <button
            onClick={() => handleStatusUpdate(row.id, 'confirmed')}
            disabled={actionLoading === row.id}
            className="p-1 sm:p-2 rounded-md text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
            title="Confirmer"
          >
            <Check className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => handleStatusUpdate(row.id, 'cancelled', 'Annulé par l\'administrateur')}
            disabled={actionLoading === row.id}
            className="p-1 sm:p-2 rounded-md text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            title="Annuler"
          >
            <X className="h-4 w-4" />
          </button>
        </>
      )}
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
        <option value="pending">En attente</option>
        <option value="confirmed">Confirmé</option>
        <option value="cancelled">Annulé</option>
        <option value="completed">Terminé</option>
      </select>
    </div>
  );

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Gestion des Réservations</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Gérez et modérez les réservations de la plateforme
          </p>
        </div>

        <DataTable
          columns={columns}
          data={bookings}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          searchPlaceholder="Rechercher par annonce ou utilisateur..."
          filters={renderFilters()}
          actions={renderActions}
        />
      </div>

      {/* Modal de détails */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setSelectedBooking(null)} />
            
            <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Détails de la réservation</h3>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Informations de l'annonce */}
                <div className="flex items-start space-x-3">
                  <Home className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Annonce</p>
                    <p className="font-medium">{selectedBooking.ad.title}</p>
                    <p className="text-sm text-gray-600">{selectedBooking.ad.location}</p>
                  </div>
                </div>

                {/* Dates et prix */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Période</p>
                      <p className="font-medium">{formatDateRange(selectedBooking.startDate, selectedBooking.endDate)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Prix total</p>
                    <p className="font-medium text-lg text-green-600">{selectedBooking.totalPrice}€</p>
                  </div>
                </div>

                {/* Participants */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <User className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Locataire</p>
                      <p className="font-medium">{selectedBooking.tenant.firstName} {selectedBooking.tenant.lastName}</p>
                      <p className="text-sm text-gray-600">{selectedBooking.tenant.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <User className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Propriétaire</p>
                      <p className="font-medium">{selectedBooking.owner.firstName} {selectedBooking.owner.lastName}</p>
                      <p className="text-sm text-gray-600">{selectedBooking.owner.email}</p>
                    </div>
                  </div>
                </div>

                {/* Message */}
                {selectedBooking.message && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Message du locataire</p>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700">{selectedBooking.message}</p>
                    </div>
                  </div>
                )}

                {/* Statut */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Statut actuel</p>
                    {getStatusBadge(selectedBooking.status)}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Créé le</p>
                    <p className="text-sm font-medium">{new Date(selectedBooking.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};