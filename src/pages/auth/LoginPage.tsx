import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Search, MessagesSquare, BadgeCheck } from 'lucide-react';
import { AuthLayout, type AuthHighlight } from '../../components/auth/AuthLayout';
import { AuthField } from '../../components/auth/AuthField';
import { AuthAlert } from '../../components/auth/AuthAlert';
import { AuthSubmitButton } from '../../components/auth/AuthSubmitButton';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const HIGHLIGHTS: AuthHighlight[] = [
  {
    icon: Search,
    title: 'Tout le Bénin en un coup d\'oeil',
    description: 'Véhicules, logements, matériel : filtrez par ville, budget et catégorie.',
    tint: 'bg-cyan-500/25',
  },
  {
    icon: MessagesSquare,
    title: 'Contact direct avec le propriétaire',
    description: 'Échangez et réservez sans intermédiaire, depuis votre espace.',
    tint: 'bg-green-500/25',
  },
  {
    icon: BadgeCheck,
    title: 'Des profils vérifiés',
    description: 'Pièce d\'identité contrôlée et avis publiés par la communauté.',
    tint: 'bg-orange-500/25',
  },
];

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState('');
  const { login, loading, user } = useAuth();
  const { error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  useEffect(() => {
    // Message transmis par la réinitialisation de mot de passe.
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
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

    const newErrors: { email?: string; password?: string } = {};

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
    setFormError('');
    setSuccessMessage('');

    try {
      await login(email, password, rememberMe);
      setLoginSuccess(true);
    } catch (err: any) {
      const backendMessage: string | undefined = err?.response?.data?.message;
      const displayMessage = backendMessage === 'Account disabled. Please contact support.'
        ? 'Ce compte est désactivé. Contactez le support.'
        : backendMessage === 'Invalid credentials'
        ? 'Email ou mot de passe incorrect. Vérifiez vos informations et réessayez.'
        : backendMessage || 'Email ou mot de passe incorrect. Vérifiez vos informations et réessayez.';

      // Bannière persistante + toast : l'erreur reste lisible le temps de corriger.
      setFormError(displayMessage);
      error('Erreur de connexion', displayMessage);
    }
  };

  return (
    <AuthLayout
      panelTitle={
        <>
          Louez plus simplement,
          <br />
          <span className="text-cyan-300">partout au Bénin.</span>
        </>
      }
      panelSubtitle="Retrouvez vos annonces, vos réservations et vos échanges là où vous les avez laissés."
      highlights={HIGHLIGHTS}
      title="Content de vous revoir"
      subtitle="Connectez-vous pour accéder à votre espace eLocation."
      footer={
        <>
          Pas encore de compte ?{' '}
          <Link
            to="/register"
            className="font-semibold text-blue-600 underline-offset-4 transition-colors hover:text-blue-700 hover:underline"
          >
            Créer un compte gratuitement
          </Link>
        </>
      }
    >
      {successMessage && <AuthAlert variant="success">{successMessage}</AuthAlert>}
      {formError && <AuthAlert>{formError}</AuthAlert>}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <AuthField
          label="Email"
          type="email"
          icon={Mail}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          error={errors.email}
          required
          autoFocus
          autoComplete="email"
          placeholder="votre@email.com"
        />

        <AuthField
          label="Mot de passe"
          icon={Lock}
          revealable
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
          }}
          error={errors.password}
          required
          autoComplete="current-password"
          placeholder="••••••••"
          labelAction={
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-blue-600 underline-offset-4 transition-colors hover:text-blue-700 hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          }
        />

        <label htmlFor="remember-me" className="flex w-fit cursor-pointer items-center gap-2.5 select-none">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 transition focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-0"
          />
          <span className="text-sm text-slate-600">Rester connecté sur cet appareil</span>
        </label>

        <AuthSubmitButton type="submit" loading={loading} loadingLabel="Connexion...">
          Se connecter
        </AuthSubmitButton>
      </form>
    </AuthLayout>
  );
};
