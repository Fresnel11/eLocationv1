import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Star, Clock } from 'lucide-react';
import { api } from '../../services/api';

interface Booking {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  totalPrice: number;
  ad: {
    id: string;
    title: string;
    location: string;
    photos: string[];
  };
  createdAt: string;
}

interface BookingHistoryProps {
  userId: string;
}

export const BookingHistory: React.FC<BookingHistoryProps> = ({ userId }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [userId]);

  const fetchBookings = async () => {
    try {
      const response = await api.get(`/bookings/user/${userId}`);
      setBookings(response.data.bookings || []);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmée';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulée';
      case 'completed': return 'Terminée';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Aucune réservation
        </h3>
        <p className="text-gray-600">
          L'historique des réservations apparaîtra ici.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Historique des réservations ({bookings.length})
      </h3>
      
      {bookings.map((booking) => (
        <div key={booking.id} className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex gap-4">
            <img
              src={booking.ad.photos[0] || '/placeholder-image.jpg'}
              alt={booking.ad.title}
              className="w-20 h-20 rounded-lg object-cover"
            />
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 line-clamp-1">
                  {booking.ad.title}
                </h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                  {getStatusLabel(booking.status)}
                </span>
              </div>
              
              <div className="flex items-center gap-1 text-gray-600 text-sm mb-2">
                <MapPin className="h-4 w-4" />
                <span>{booking.ad.location}</span>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(booking.startDate).toLocaleDateString('fr-FR')} - {' '}
                    {new Date(booking.endDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>
                    Réservé le {new Date(booking.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="font-semibold text-blue-600">
                  {booking.totalPrice.toLocaleString()} FCFA
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};