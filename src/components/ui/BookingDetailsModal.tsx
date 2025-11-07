import React from 'react';
import { X, Calendar, MapPin, User, CreditCard, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { Booking } from '../../services/bookingsService';

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  userRole: 'tenant' | 'owner';
  onCancel?: (bookingId: string, reason: string) => void;
}

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

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  isOpen,
  onClose,
  booking,
  userRole,
  onCancel
}) => {
  const [showCancelForm, setShowCancelForm] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState('');
  if (!isOpen || !booking) return null;

  const StatusIcon = statusConfig[booking.status].icon;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return `${days} jour${days > 1 ? 's' : ''}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Détails de la réservation</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Statut */}
          <div className="flex items-center justify-between">
            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${statusConfig[booking.status].color}`}>
              <StatusIcon className="h-4 w-4" />
              {statusConfig[booking.status].label}
            </div>
            <p className="text-sm text-gray-500">
              Créée le {formatDateTime(booking.createdAt)}
            </p>
          </div>

          {/* Propriété */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Propriété
            </h3>
            <div className="flex gap-4">
              <img
                src={booking.ad.photos[0] ? `http://localhost:3000${booking.ad.photos[0]}` : '/placeholder.jpg'}
                alt={booking.ad.title}
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div>
                <h4 className="font-medium text-gray-900">{booking.ad.title}</h4>
                <p className="text-sm text-gray-600 mt-1">Prix: {booking.ad.price} FCFA</p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Période de réservation
            </h3>
            <div className="space-y-2">
              <p><span className="font-medium">Du:</span> {formatDate(booking.startDate)}</p>
              <p><span className="font-medium">Au:</span> {formatDate(booking.endDate)}</p>
              <p><span className="font-medium">Durée:</span> {getDuration(booking.startDate, booking.endDate)}</p>
            </div>
          </div>

          {/* Participants */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Participants
            </h3>
            <div className="space-y-3">
              <div>
                <p className="font-medium text-gray-700">Demandeur:</p>
                <p className="text-gray-600">{booking.tenant.firstName} {booking.tenant.lastName}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Propriétaire:</p>
                <p className="text-gray-600">{booking.owner.firstName} {booking.owner.lastName}</p>
              </div>
            </div>
          </div>

          {/* Tarification */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Tarification
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Prix total:</span>
                <span className="font-bold">{Math.round(booking.totalPrice).toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span>Dépôt de garantie:</span>
                <span className="font-medium">{Math.round(booking.deposit).toLocaleString()} FCFA</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-lg font-bold">
                <span>Total à payer:</span>
                <span>{Math.round(booking.totalPrice + booking.deposit).toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>

          {/* Message */}
          {booking.message && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Message du demandeur:</h3>
              <p className="text-gray-700">{booking.message}</p>
            </div>
          )}

          {/* Raison d'annulation */}
          {booking.status === 'cancelled' && booking.cancellationReason && (
            <div className="bg-red-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Raison de l'annulation:</h3>
              <p className="text-red-700">{booking.cancellationReason}</p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          {/* Formulaire d'annulation */}
          {showCancelForm && (
            <div className="mb-4 p-4 bg-red-50 rounded-lg">
              <h4 className="font-medium text-red-900 mb-2">Annuler la réservation</h4>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Raison de l'annulation (optionnel)"
                className="w-full p-2 border border-red-300 rounded-lg mb-3"
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (onCancel && booking) {
                      onCancel(booking.id, cancelReason);
                      setShowCancelForm(false);
                      setCancelReason('');
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Confirmer l'annulation
                </Button>
                <Button
                  onClick={() => {
                    setShowCancelForm(false);
                    setCancelReason('');
                  }}
                  variant="outline"
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            {/* Bouton d'annulation pour le demandeur */}
            {userRole === 'tenant' && 
             booking && 
             ['pending', 'accepted'].includes(booking.status) && 
             !showCancelForm && (
              <Button
                onClick={() => setShowCancelForm(true)}
                className="bg-red-600 hover:bg-red-700 text-white flex-1"
              >
                Annuler la réservation
              </Button>
            )}
            
            <Button
              onClick={onClose}
              className={userRole === 'tenant' && booking && ['pending', 'accepted'].includes(booking.status) ? 'flex-1' : 'w-full'}
              variant={userRole === 'tenant' && booking && ['pending', 'accepted'].includes(booking.status) ? 'outline' : 'default'}
            >
              Fermer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};