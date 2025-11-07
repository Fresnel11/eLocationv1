import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { OtpInput } from '../../components/ui/OtpInput';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import logoImage from '../../assets/e_location.png';

export const VerifyOtpPage: React.FC = () => {
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const { verifyOtp, requestOtp, loading } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Récupérer les données depuis l'état de navigation
  const { phone, email } = location.state || {};

  useEffect(() => {
    if (!phone) {
      navigate('/register');
    }
  }, [phone, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otpCode.trim()) {
      setError('Le code OTP est requis');
      return;
    }
    
    if (otpCode.length !== 6) {
      setError('Le code OTP doit contenir 6 chiffres');
      return;
    }
    
    setError('');
    
    try {
      await verifyOtp(email || phone, otpCode);
      navigate('/login', { 
        state: { 
          verified: true
        } 
      });
    } catch (err) {
      showError(
        'Code invalide',
        'Le code OTP saisi est invalide ou expiré. Veuillez réessayer.'
      );
      setError('Code OTP invalide ou expiré');
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setError('Impossible de renvoyer le code sans email');
      return;
    }
    
    setResendLoading(true);
    try {
      await requestOtp(email);
      success('Code renvoyé', 'Un nouveau code OTP a été envoyé à votre email.');
      setError('');
    } catch (err) {
      showError('Erreur', 'Impossible de renvoyer le code. Veuillez réessayer.');
      setError('Erreur lors du renvoi du code');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md">
        <div className="flex justify-center">
          <Link to="/">
            <img src={logoImage} alt="eLocation Bénin" className="h-12 sm:h-16 w-auto" />
          </Link>
        </div>
        <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-bold text-gray-900">
          Vérification du compte
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 px-2">
          Un code de vérification a été envoyé à votre {email ? 'email' : 'téléphone'}
        </p>
        {email ? (
          <p className="mt-1 text-center text-sm text-blue-600 font-medium break-all px-2">
            {email}
          </p>
        ) : phone && (
          <p className="mt-1 text-center text-sm text-blue-600 font-medium break-all px-2">
            {phone}
          </p>
        )}
      </div>

      <div className="mt-6 sm:mt-8 mx-auto w-full max-w-md">
        <Card className="mx-4 sm:mx-0">
          <CardHeader>
            <CardTitle className="text-center text-lg sm:text-xl">Code de vérification</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                  Saisissez le code OTP (6 chiffres)
                </label>
                <OtpInput
                  value={otpCode}
                  onChange={(value) => {
                    setOtpCode(value);
                    if (error) setError('');
                  }}
                  error={error}
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Vérification...' : 'Vérifier le code'}
              </Button>

              {email && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendLoading}
                    className="text-sm text-blue-600 hover:text-blue-500 disabled:text-gray-400"
                  >
                    {resendLoading ? 'Envoi...' : 'Renvoyer le code'}
                  </button>
                </div>
              )}

              <div className="text-center">
                <Link 
                  to="/register" 
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-500"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Retour à l'inscription
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};