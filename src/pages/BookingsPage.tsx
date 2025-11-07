import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Eye, CreditCard } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { RefusalModal } from '../components/ui/RefusalModal';
import { BookingDetailsModal } from '../components/ui/BookingDetailsModal';
import { bookingsService, Booking } from '../services/bookingsService';
import { useToast } from '../context/ToastContext';

const statusConfig = {
  pending: { 
    label: 'En attente', 
    color: 'bg-yellow-100 text-yellow-800', 
    icon: Clock 
  },
  accepted: { 
    label: 'Acceptée', 
    color: 'bg-blue-100 text-blue-800', 
    icon: CheckCircle 
  },
  confirmed: { 
    label: 'Confirmée', 
    color: 'bg-green-100 text-green-800', 
    icon: CheckCircle 
  },
  cancelled: { 
    label: 'Annulée', 
    color: 'bg-red-100 text-red-800', 
    icon: XCircle 
  },
  completed: { 
    label: 'Terminée', 
    color: 'bg-blue-100 text-blue-800', 
    icon: CheckCircle 
  },
  expired: { 
    label: 'Expirée', 
    color: 'bg-gray-100 text-gray-800', 
    icon: AlertCircle 
  },
};

export const BookingsPage: React.FC = () => {
  const [tenantBookings, setTenantBookings] = useState<Booking[]>([]);
  const [ownerBookings, setOwnerBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'tenant' | 'owner'>('tenant');
  const [refusalModal, setRefusalModal] = useState<{ isOpen: boolean; bookingId: string | null }>({ isOpen: false, bookingId: null });
  const [detailsModal, setDetailsModal] = useState<{ isOpen: boolean; booking: Booking | null }>({ isOpen: false, booking: null });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }
      
      const [tenantResponse, ownerResponse] = await Promise.all([
        bookingsService.getMyBookings(),
        bookingsService.getReceivedBookings()
      ]);
      
      setTenantBookings(tenantResponse.data);
      setOwnerBookings(ownerResponse.data);
    } catch (error: any) {
      console.error('Erreur lors du chargement des réservations:', error);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
      
      showToast('error', 'Erreur lors du chargement des réservations');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: string, status: string, reason?: string) => {
    setActionLoading(bookingId);
    try {
      await bookingsService.updateBooking(bookingId, { status, cancellationReason: reason });
      showToast('success', status === 'confirmed' ? 'Réservation acceptée' : 'Réservation refusée');
      fetchBookings();
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefusal = (bookingId: string) => {
    setRefusalModal({ isOpen: true, bookingId });
  };

  const handleRefusalConfirm = (reason: string) => {
    if (refusalModal.bookingId) {
      handleStatusUpdate(refusalModal.bookingId, 'cancelled', reason);
    }
    setRefusalModal({ isOpen: false, bookingId: null });
  };

  const getFilteredBookings = () => {
    return selectedTab === 'tenant' ? tenantBookings : ownerBookings;
  };

  const canManageBooking = (booking: Booking) => {
    return selectedTab === 'owner' && booking.status === 'pending';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return `${days} jour${days > 1 ? 's' : ''}`;
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'il y a moins d\'une heure';
    if (diffInHours < 24) return `il y a ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `il y a ${diffInWeeks} semaine${diffInWeeks > 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-6 rounded-xl">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 pb-24 md:pb-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Mes Réservations</h1>
          <p className="text-gray-600 text-sm md:text-base">Gérez vos demandes de location et réservations</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 md:mb-6 bg-gray-100 p-1 rounded-lg w-full md:w-fit">
          <button
            onClick={() => setSelectedTab('tenant')}
            className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-md text-xs md:text-sm font-medium transition-colors ${
              selectedTab === 'tenant' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Mes demandes ({tenantBookings.length})
          </button>
          <button
            onClick={() => setSelectedTab('owner')}
            className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-md text-xs md:text-sm font-medium transition-colors ${
              selectedTab === 'owner' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Demandes reçues ({ownerBookings.length})
          </button>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {getFilteredBookings().length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 text-center">
              <Calendar className="h-10 w-10 md:h-12 md:w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
                {selectedTab === 'tenant' ? 'Aucune demande' : 'Aucune demande reçue'}
              </h3>
              <p className="text-gray-500 text-sm md:text-base">
                {selectedTab === 'tenant' 
                  ? 'Vos demandes de réservation apparaîtront ici.' 
                  : 'Les demandes pour vos propriétés apparaîtront ici.'}
              </p>
            </div>
          ) : (
            getFilteredBookings().map((booking) => {
              const StatusIcon = statusConfig[booking.status].icon;
              
              return (
                <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 p-3 md:p-4">
                  {/* Mobile Layout */}
                  <div className="md:hidden">
                    {/* Header Mobile */}
                    <div className="flex items-start gap-3 mb-3">
                      <img
                        src={booking.ad.photos[0] ? `http://localhost:3000${booking.ad.photos[0]}` : '/placeholder.jpg'}
                        alt={booking.ad.title}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="text-base font-semibold text-gray-900 pr-2 leading-tight">
                            {booking.ad.title}
                          </h3>
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[booking.status].color} flex-shrink-0`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig[booking.status].label}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-1">
                          {formatDate(booking.startDate).split(' ').slice(0, 2).join(' ')} - {formatDate(booking.endDate).split(' ').slice(0, 2).join(' ')}
                        </p>
                        {selectedTab === 'owner' && (
                          <p className="text-xs text-blue-600 font-medium">
                            {booking.tenant.firstName} {booking.tenant.lastName}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Price Mobile */}
                    <div className="flex items-center justify-between mb-3 bg-gray-50 rounded-lg p-2">
                      <div className="text-xs text-gray-600">
                        <span>{getDuration(booking.startDate, booking.endDate)} • </span>
                        <span className="text-gray-400">{getTimeAgo(booking.createdAt)}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold text-gray-900">
                          {Math.round(booking.totalPrice).toLocaleString()} FCFA
                        </p>
                        <p className="text-xs text-gray-500">
                          Dépôt: {Math.round(booking.deposit).toLocaleString()} FCFA
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:flex gap-4">
                    {/* Property Image */}
                    <div className="flex-shrink-0 relative">
                      <img
                        src={booking.ad.photos[0] ? `http://localhost:3000${booking.ad.photos[0]}` : '/placeholder.jpg'}
                        alt={booking.ad.title}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {booking.ad.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                          </p>
                          {selectedTab === 'owner' && (
                            <p className="text-sm text-blue-600 font-medium">
                              Demandé par: {booking.tenant.firstName} {booking.tenant.lastName}
                            </p>
                          )}
                        </div>
                        <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[booking.status].color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig[booking.status].label}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm text-gray-600">
                          <span>{getDuration(booking.startDate, booking.endDate)} • </span>
                          <span className="text-gray-400">Demande {getTimeAgo(booking.createdAt)}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {Math.round(booking.totalPrice).toLocaleString()} FCFA
                          </p>
                          <p className="text-xs text-gray-500">
                            Dépôt: {Math.round(booking.deposit).toLocaleString()} FCFA
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  {booking.message && (
                    <div className="bg-blue-50 rounded-lg p-2 mb-3">
                      <p className="text-xs md:text-sm text-blue-800">
                        <span className="font-medium">Message:</span> {booking.message}
                      </p>
                    </div>
                  )}

                  {/* Cancellation Reason */}
                  {booking.status === 'cancelled' && booking.cancellationReason && (
                    <div className="bg-red-50 rounded-lg p-2 mb-3">
                      <p className="text-xs md:text-sm text-red-800">
                        <span className="font-medium">Raison:</span> {booking.cancellationReason}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {/* Bouton de paiement pour les réservations acceptées */}
                    {selectedTab === 'tenant' && booking.status === 'accepted' && (
                      <Button
                        size="sm"
                        onClick={() => window.location.href = `/payment/${booking.id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 flex-1 md:flex-none"
                      >
                        <CreditCard className="h-3 w-3 mr-1" />
                        Payer le dépôt
                      </Button>
                    )}

                    {selectedTab === 'owner' && booking.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRefusal(booking.id)}
                          disabled={actionLoading === booking.id}
                          className="text-red-600 border-red-200 hover:bg-red-50 text-xs px-3 py-1 flex-1 md:flex-none"
                        >
                          Refuser
                        </Button>
                        <Button
                          size="sm"
                          onClick={async () => {
                            setActionLoading(booking.id);
                            try {
                              await bookingsService.acceptBooking(booking.id);
                              showToast('success', 'Réservation acceptée');
                              fetchBookings();
                            } catch (error: any) {
                              showToast('error', error.response?.data?.message || 'Erreur lors de l\'acceptation');
                            } finally {
                              setActionLoading(null);
                            }
                          }}
                          disabled={actionLoading === booking.id}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 flex-1 md:flex-none"
                        >
                          {actionLoading === booking.id ? 'Acceptation...' : 'Accepter'}
                        </Button>
                      </>
                    )}
                    {selectedTab === 'owner' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`tel:${booking.tenant.firstName}`, '_self')}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50 text-xs px-3 py-1 flex-1 md:flex-none"
                      >
                        Contacter
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDetailsModal({ isOpen: true, booking })}
                      className="text-xs px-3 py-1 flex-1 md:flex-none"
                    >
                      Détails
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Refusal Modal */}
        <RefusalModal
          isOpen={refusalModal.isOpen}
          onClose={() => setRefusalModal({ isOpen: false, bookingId: null })}
          onConfirm={handleRefusalConfirm}
          loading={actionLoading !== null}
        />

        {/* Details Modal */}
        <BookingDetailsModal
          isOpen={detailsModal.isOpen}
          onClose={() => setDetailsModal({ isOpen: false, booking: null })}
          booking={detailsModal.booking}
          userRole={selectedTab}
          onCancel={async (bookingId: string, reason: string) => {
            try {
              await bookingsService.cancelBooking(bookingId, reason);
              showToast('success', 'Réservation annulée');
              fetchBookings();
              setDetailsModal({ isOpen: false, booking: null });
            } catch (error: any) {
              showToast('error', error.response?.data?.message || 'Erreur lors de l\'annulation');
            }
          }}
        />
      </div>
    </div>
  );
};