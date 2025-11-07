import React, { useState, useEffect } from 'react';
import { X, Calendar, CreditCard, MessageSquare, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { bookingsService } from '../../services/bookingsService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  ad: {
    id: string;
    title: string;
    price: string;
    paymentMode?: string;
    photos: string[];
    allowBooking?: boolean;
    user: {
      id: string;
      firstName: string;
      lastName: string;
    };
  } | null;
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, ad }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [deposit, setDeposit] = useState(0);
  const [isAvailable, setIsAvailable] = useState(true);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  useEffect(() => {
    if (startDate && endDate && ad) {
      calculatePrice();
      checkAvailability();
    }
  }, [startDate, endDate, ad]);

  const calculatePrice = () => {
    if (!startDate || !endDate || !ad) return;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    let total = 0;
    
    switch (ad.paymentMode) {
      case 'hourly':
        const hours = Math.ceil(timeDiff / (1000 * 60 * 60));
        total = hours * parseFloat(ad.price);
        break;
      case 'daily':
        const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        total = days * parseFloat(ad.price);
        break;
      case 'weekly':
        const weeks = Math.ceil(timeDiff / (1000 * 60 * 60 * 24 * 7));
        total = weeks * parseFloat(ad.price);
        break;
      case 'monthly':
        const months = Math.ceil(timeDiff / (1000 * 60 * 60 * 24 * 30));
        total = months * parseFloat(ad.price);
        break;
      case 'fixed':
      default:
        total = parseFloat(ad.price);
        break;
    }
    
    if (total > 0) {
      setTotalPrice(total);
      setDeposit(total * 0.2); // 20% de dépôt
    }
  };

  const checkAvailability = async () => {
    if (!startDate || !endDate || !ad) return;
    
    setCheckingAvailability(true);
    try {
      const result = await bookingsService.checkAvailability(ad.id, startDate, endDate);
      setIsAvailable(result.isAvailable);
    } catch (error) {
      console.error('Erreur lors de la vérification de disponibilité:', error);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ad || !user) return;

    if (!isAvailable) {
      showToast('error', 'Ces dates ne sont pas disponibles');
      return;
    }

    setLoading(true);
    try {
      await bookingsService.createBooking({
        adId: ad.id,
        startDate,
        endDate,
        message,
        deposit,
      });
      
      showToast('success', 'Demande de réservation envoyée avec succès !');
      onClose();
      resetForm();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message;
      if (errorMessage === 'Vous ne pouvez pas réserver votre propre annonce') {
        showToast('error', 'Vous ne pouvez pas réserver votre propre annonce. Vous êtes le propriétaire de cette annonce.');
      } else {
        showToast('error', errorMessage || 'Erreur lors de la réservation');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStartDate('');
    setEndDate('');
    setMessage('');
    setTotalPrice(0);
    setDeposit(0);
    setIsAvailable(true);
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getPeriodText = () => {
    if (!startDate || !endDate || !ad) return '';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    
    switch (ad.paymentMode) {
      case 'hourly':
        const hours = Math.ceil(timeDiff / (1000 * 60 * 60));
        return `${hours} heure${hours > 1 ? 's' : ''}`;
      case 'daily':
        const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        return `${days} jour${days > 1 ? 's' : ''}`;
      case 'weekly':
        const weeks = Math.ceil(timeDiff / (1000 * 60 * 60 * 24 * 7));
        return `${weeks} semaine${weeks > 1 ? 's' : ''}`;
      case 'monthly':
        const months = Math.ceil(timeDiff / (1000 * 60 * 60 * 24 * 30));
        return `${months} mois`;
      case 'fixed':
        return 'prix fixe';
      default:
        const defaultDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        return `${defaultDays} jour${defaultDays > 1 ? 's' : ''}`;
    }
  };

  if (!isOpen || !ad) return null;

  // Si la réservation n'est pas autorisée
  if (!ad.allowBooking) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Réservation non disponible</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Property Info */}
            <div className="flex gap-4">
              <img
                src={ad.photos[0] ? `http://localhost:3000${ad.photos[0]}` : '/placeholder.jpg'}
                alt={ad.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h3 className="font-semibold text-gray-900">{ad.title}</h3>
                <p className="text-sm text-gray-600">
                  Propriétaire: {ad.user.firstName} {ad.user.lastName}
                </p>
              </div>
            </div>

            {/* Message */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-2">Réservation en ligne non disponible</p>
                  <p>Le propriétaire de cette annonce n'a pas activé la réservation en ligne. Vous pouvez :</p>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>Contacter directement le propriétaire</li>
                    <li>Envoyer un message via la plateforme</li>
                    <li>Appeler pour discuter des modalités</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Fermer
              </Button>
              <Button
                type="button"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  onClose();
                  // Ici on pourrait ouvrir le modal de contact
                }}
              >
                Contacter le propriétaire
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Demande de location</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Property Info */}
          <div className="flex gap-4">
            <img
              src={ad.photos[0] ? `http://localhost:3000${ad.photos[0]}` : '/placeholder.jpg'}
              alt={ad.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div>
              <h3 className="font-semibold text-gray-900">{ad.title}</h3>
              <p className="text-sm text-gray-600">
                Propriétaire: {ad.user.firstName} {ad.user.lastName}
              </p>
              <p className="text-lg font-bold text-blue-600">
                {parseInt(ad.price).toLocaleString()} FCFA
                {ad.paymentMode === 'hourly' && '/heure'}
                {ad.paymentMode === 'daily' && '/jour'}
                {ad.paymentMode === 'weekly' && '/semaine'}
                {ad.paymentMode === 'monthly' && '/mois'}
                {ad.paymentMode === 'fixed' && ' (prix fixe)'}
                {!ad.paymentMode && '/mois'}
              </p>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Date de début
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={getTomorrowDate()}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Date de fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || getTomorrowDate()}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Availability Check */}
          {startDate && endDate && (
            <div className={`p-3 rounded-lg ${isAvailable ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              {checkingAvailability ? (
                <p className="text-sm text-gray-600">Vérification de la disponibilité...</p>
              ) : (
                <p className={`text-sm font-medium ${isAvailable ? 'text-green-700' : 'text-red-700'}`}>
                  {isAvailable ? '✓ Dates disponibles' : '✗ Dates non disponibles'}
                </p>
              )}
            </div>
          )}

          {/* Price Summary */}
          {totalPrice > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Prix total ({getPeriodText()})</span>
                <span>{totalPrice.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Dépôt de garantie (20%)</span>
                <span>{deposit.toLocaleString()} FCFA</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>À payer maintenant</span>
                <span>{deposit.toLocaleString()} FCFA</span>
              </div>
            </div>
          )}

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="h-4 w-4 inline mr-1" />
              Message au propriétaire (optionnel)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Présentez-vous et expliquez votre demande..."
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-700">
                <p className="font-medium">Important :</p>
                <p>Cette demande sera envoyée au propriétaire. Pour les locations longue durée, un dossier complet sera requis.</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading || !isAvailable || !startDate || !endDate}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Envoi...' : 'Envoyer la demande'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};