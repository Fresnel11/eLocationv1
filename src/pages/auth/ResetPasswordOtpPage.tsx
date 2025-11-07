import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, ArrowLeft, Mail } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { OtpInput } from '../../components/ui/OtpInput';
import { authService } from '../../services/authService';

export const ResetPasswordOtpPage: React.FC = () => {
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { email } = location.state || {};

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

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
    setLoading(true);
    
    try {
      // Passer directement à la réinitialisation avec le code
      navigate('/reset-password', { state: { email, code: otpCode } });
    } catch (error: any) {
      if (error.response?.status === 400) {
        setError('Code OTP invalide ou expiré');
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    try {
      await authService.sendPasswordResetCode(email);
      setError('');
    } catch (error) {
      setError('Erreur lors du renvoi du code');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center space-x-2">
            <Home className="h-8 w-8 text-blue-600" />
            <span className="font-bold text-xl text-gray-800">eLocation</span>
            <span className="text-sm text-blue-600 font-medium">Bénin</span>
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Code de vérification
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Un code de vérification a été envoyé à votre email
        </p>
        <p className="mt-1 text-center text-sm text-blue-600 font-medium">
          {email}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              <Mail className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              Saisissez le code reçu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                  Code OTP (6 chiffres)
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

              <div className="text-center">
                <Link 
                  to="/forgot-password" 
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-500"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Retour
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};