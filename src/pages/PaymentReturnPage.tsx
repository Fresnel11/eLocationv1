import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

const PaymentReturnPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const bookingId = searchParams.get('bookingId');
  const payment = searchParams.get('payment');

  useEffect(() => {
    // Simuler un délai pour vérifier le paiement
    const timer = setTimeout(() => {
      switch (payment) {
        case 'success':
          setStatus('success');
          setMessage('Votre paiement a été effectué avec succès ! Votre réservation est maintenant confirmée.');
          break;
        case 'failed':
          setStatus('failed');
          setMessage('Le paiement a échoué. Veuillez réessayer ou contacter le support.');
          break;
        case 'error':
          setStatus('error');
          setMessage('Une erreur technique s\'est produite. Veuillez contacter le support.');
          break;
        default:
          setStatus('error');
          setMessage('Statut de paiement inconnu.');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [payment]);

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-16 w-16 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'failed':
        return <XCircle className="h-16 w-16 text-red-500" />;
      case 'error':
        return <AlertCircle className="h-16 w-16 text-orange-500" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'loading':
        return 'Vérification du paiement...';
      case 'success':
        return 'Paiement réussi !';
      case 'failed':
        return 'Paiement échoué';
      case 'error':
        return 'Erreur technique';
    }
  };

  const getButtonText = () => {
    switch (status) {
      case 'success':
        return 'Voir ma réservation';
      case 'failed':
        return 'Réessayer le paiement';
      default:
        return 'Retour aux réservations';
    }
  };

  const handleButtonClick = () => {
    switch (status) {
      case 'success':
        navigate(`/booking/${bookingId}`);
        break;
      case 'failed':
        navigate(`/payment/${bookingId}`);
        break;
      default:
        navigate('/bookings');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            <div className="flex flex-col items-center space-y-4">
              {getIcon()}
              <h2 className="text-2xl font-bold">{getTitle()}</h2>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          {status === 'loading' ? (
            <p className="text-gray-600">
              Nous vérifions votre paiement, veuillez patienter...
            </p>
          ) : (
            <p className="text-gray-700">{message}</p>
          )}

          {status !== 'loading' && (
            <div className="space-y-3">
              <Button
                onClick={handleButtonClick}
                className="w-full"
                variant={status === 'success' ? 'default' : status === 'failed' ? 'default' : 'secondary'}
              >
                {getButtonText()}
              </Button>

              <Button
                onClick={() => navigate('/bookings')}
                variant="outline"
                className="w-full"
              >
                Retour aux réservations
              </Button>
            </div>
          )}

          {status === 'failed' && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-red-800 text-sm">
                <strong>Que faire ?</strong><br />
                • Vérifiez votre solde<br />
                • Réessayez avec un autre moyen de paiement<br />
                • Contactez votre banque si le problème persiste
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <p className="text-orange-800 text-sm">
                Si le problème persiste, contactez notre support avec le numéro de réservation : <strong>{bookingId}</strong>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentReturnPage;