import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Loader2, CreditCard, ArrowLeft } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface Booking {
  id: string;
  ad: {
    id: string;
    title: string;
    images: string[];
  };
  startDate: string;
  endDate: string;
  totalPrice: number;
  deposit: number;
  status: string;
}

const PaymentPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/bookings/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBooking(data);
      } else {
        showToast('error', 'Erreur lors du chargement de la réservation');
        navigate('/bookings');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showToast('error', 'Erreur de connexion');
      navigate('/bookings');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!booking) return;

    setPaymentLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/moneroo/create-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: booking.deposit,
          currency: 'XOF',
          metadata: {
            bookingId: booking.id,
            adId: booking.ad.id,
          },
        }),
      });

      if (response.ok) {
        const paymentData = await response.json();
        // Rediriger vers Moneroo
        window.location.href = paymentData.checkout_url;
      } else {
        showToast('error', 'Erreur lors de la création du paiement');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showToast('error', 'Erreur de connexion');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Réservation non trouvée</h2>
          <Button onClick={() => navigate('/bookings')}>
            Retour aux réservations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/bookings')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux réservations
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Paiement du dépôt de garantie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Détails de la réservation */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">{booking.ad.title}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Date de début:</span>
                  <p className="font-medium">{new Date(booking.startDate).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <span className="text-gray-600">Date de fin:</span>
                  <p className="font-medium">{new Date(booking.endDate).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <span className="text-gray-600">Prix total:</span>
                  <p className="font-medium">{booking.totalPrice.toLocaleString()} FCFA</p>
                </div>
                <div>
                  <span className="text-gray-600">Dépôt de garantie:</span>
                  <p className="font-bold text-lg text-blue-600">{booking.deposit.toLocaleString()} FCFA</p>
                </div>
              </div>
            </div>

            {/* Information sur le paiement */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Information importante</h4>
              <p className="text-blue-800 text-sm">
                Vous allez être redirigé vers Moneroo pour effectuer le paiement sécurisé de votre dépôt de garantie.
                Ce montant sera retenu jusqu'à la fin de votre réservation.
              </p>
            </div>

            {/* Bouton de paiement */}
            <Button
              onClick={handlePayment}
              disabled={paymentLoading || booking.status !== 'accepted'}
              className="w-full py-3 text-lg"
              size="lg"
            >
              {paymentLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Redirection en cours...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Payer {booking.deposit.toLocaleString()} FCFA
                </>
              )}
            </Button>

            {booking.status !== 'accepted' && (
              <p className="text-center text-sm text-gray-600">
                Cette réservation n'est pas en attente de paiement
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentPage;