import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import logoImage from '../../assets/e_location.png';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const { login, loading, user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  useEffect(() => {
    if (location.state?.verified) {
      // Délai pour s'assurer que le composant est monté
      const timer = setTimeout(() => {
        success(
          'Compte activé !',
          'Votre compte a été vérifié avec succès. Connectez-vous pour accéder à votre espace.'
        );
        // Nettoyer le state pour éviter la répétition
        navigate('/login', { replace: true });
      }, 500);
      return () => clearTimeout(timer);
    } else if (location.state?.message) {
      setSuccessMessage(location.state.message);
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Redirection après connexion réussie
  useEffect(() => {
    if (loginSuccess && user) {
      if (user.role?.name === 'super_admin' || user.role?.name === 'admin') {
        setTimeout(() => navigate('/admin'), 100);
      } else {
        navigate('/ads');
      }
    }
  }, [loginSuccess, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: {email?: string; password?: string} = {};
    
    if (!email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email invalide';
    }
    
    if (!password) {
      newErrors.password = 'Le mot de passe est requis';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    
    try {
      await login(email, password, rememberMe);
      setLoginSuccess(true);
    } catch (err: any) {
      error(
        'Erreur de connexion',
        'Email ou mot de passe incorrect. Veuillez vérifier vos informations.'
      );
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
          Connectez-vous à votre compte
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ou{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
            créez un nouveau compte
          </Link>
        </p>
      </div>

      <div className="mt-6 sm:mt-8 mx-auto w-full max-w-md">
        <Card className="mx-4 sm:mx-0">
          <CardHeader>
            <CardTitle className="text-center">Connexion</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">{successMessage}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                required
                placeholder="votre@email.com"
              />

              <div className="relative">
                <Input
                  label="Mot de passe"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  required
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Se souvenir de moi
                  </label>
                </div>

                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                  Mot de passe oublié ?
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};