import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { authService, User as UserType } from '../../services/authService';
import logoImage from '../../assets/e_location.png';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [foundUser, setFoundUser] = useState<UserType | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('L\'email est requis');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email invalide');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const response = await authService.forgotPassword(email);
      if (response.user) {
        setFoundUser(response.user);
        setShowConfirmation(true);
      } else {
        setError('Aucun compte n\'est associé à cet email');
      }
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.message === 'User not found') {
        setError('Aucun compte n\'est associé à cet email');
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAccount = async () => {
    setLoading(true);
    try {
      await authService.sendPasswordResetCode(email);
      navigate('/reset-password-otp', { state: { email } });
    } catch (error) {
      setError('Erreur lors de l\'envoi du code. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectAccount = () => {
    navigate('/login');
  };

  if (showConfirmation && foundUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Link to="/">
              <img src={logoImage} alt="eLocation Bénin" className="h-16 w-auto" />
            </Link>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Compte trouvé
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Est-ce votre compte ?
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Card>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {foundUser.firstName} {foundUser.lastName}
                </h3>
                <p className="text-sm text-gray-600">{foundUser.email}</p>
                {foundUser.phone && (
                  <p className="text-sm text-gray-600">{foundUser.phone}</p>
                )}
                {foundUser.role && (
                  <p className="text-xs text-gray-500 mt-1 capitalize">
                    {foundUser.role.name}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleConfirmAccount} 
                  className="w-full" 
                  disabled={loading}
                >
                  {loading ? 'Envoi du code...' : 'Oui, c\'est mon compte'}
                </Button>
                
                <Button 
                  onClick={handleRejectAccount} 
                  variant="outline" 
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Non, ce n'est pas mon compte
                </Button>
              </div>

              {error && (
                <div className="mt-4 text-sm text-red-600 text-center">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
          Mot de passe oublié ?
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Entrez votre email pour retrouver votre compte
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Récupération de compte</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error}
                required
                placeholder="votre@email.com"
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Recherche...' : 'Rechercher mon compte'}
              </Button>

              <div className="text-center">
                <Link to="/login" className="text-sm text-blue-600 hover:text-blue-500 inline-flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Retour à la connexion
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};