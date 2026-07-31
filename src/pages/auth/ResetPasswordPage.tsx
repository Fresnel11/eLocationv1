import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, CheckCircle2, Lock, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import { AuthLayout, type AuthHighlight } from '../../components/auth/AuthLayout';
import { AuthField } from '../../components/auth/AuthField';
import { AuthAlert } from '../../components/auth/AuthAlert';
import { AuthSubmitButton } from '../../components/auth/AuthSubmitButton';
import { PasswordStrength } from '../../components/auth/PasswordStrength';
import { getPasswordError, MIN_PASSWORD_LENGTH } from '../../components/auth/passwordRules';
import { authService } from '../../services/authService';

const HIGHLIGHTS: AuthHighlight[] = [
  {
    icon: ShieldCheck,
    title: 'Choisissez un mot de passe unique',
    description: 'Évitez celui que vous utilisez déjà sur d\'autres sites.',
    tint: 'bg-cyan-500/25',
  },
  {
    icon: Lock,
    title: 'Chiffré de bout en bout',
    description: 'Votre mot de passe est haché : personne ne peut le lire, pas même nous.',
    tint: 'bg-green-500/25',
  },
  {
    icon: RotateCcw,
    title: 'Déconnexion des autres sessions',
    description: 'Reconnectez-vous ensuite avec votre nouveau mot de passe.',
    tint: 'bg-orange-500/25',
  },
];

const REDIRECT_DELAY = 4;

export const ResetPasswordPage: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(REDIRECT_DELAY);
  const navigate = useNavigate();
  const location = useLocation();

  const { email, code } = location.state || {};

  useEffect(() => {
    if (!email || !code) {
      navigate('/forgot-password');
    }
  }, [email, code, navigate]);

  const goToLogin = () =>
    navigate('/login', {
      state: {
        message: 'Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter.',
      },
    });

  // Décompte avant redirection automatique vers la connexion.
  useEffect(() => {
    if (!success) return;
    if (countdown <= 0) {
      goToLogin();
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [success, countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const passwordError = getPasswordError(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await authService.resetPassword(email, code, newPassword);
      setSuccess(true);
    } catch (error: any) {
      if (error.response?.status === 400) {
        setError('Code expiré ou invalide. Veuillez recommencer le processus.');
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;

  if (success) {
    return (
      <AuthLayout
        panelTitle={
          <>
            Votre compte est
            <br />
            <span className="text-cyan-300">de nouveau à vous.</span>
          </>
        }
        panelSubtitle="Votre nouveau mot de passe est actif immédiatement."
        highlights={HIGHLIGHTS}
        title="Mot de passe réinitialisé"
        subtitle="Vous pouvez dès à présent vous connecter avec votre nouveau mot de passe."
      >
        <div className="rounded-2xl border border-green-100 bg-green-50/70 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 animate-slide-up items-center justify-center rounded-2xl bg-green-600 shadow-lg shadow-green-600/25">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          <h3 className="mt-5 text-lg font-semibold text-slate-900">C'est fait !</h3>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-600">
            Votre mot de passe a été modifié. Redirection vers la connexion dans {countdown}s.
          </p>
        </div>

        <div className="mt-6">
          <AuthSubmitButton onClick={goToLogin}>
            <Sparkles className="h-4 w-4" />
            Se connecter maintenant
          </AuthSubmitButton>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      panelTitle={
        <>
          Dernière étape,
          <br />
          <span className="text-cyan-300">un nouveau mot de passe.</span>
        </>
      }
      panelSubtitle="Choisissez un mot de passe solide : il protège vos annonces et vos réservations."
      highlights={HIGHLIGHTS}
      title="Nouveau mot de passe"
      subtitle="Il remplacera immédiatement l'ancien sur tous vos appareils."
      footer={
        <Link
          to="/forgot-password"
          className="inline-flex items-center gap-1.5 font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Recommencer la procédure
        </Link>
      }
    >
      {error && <AuthAlert>{error}</AuthAlert>}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <AuthField
            label="Nouveau mot de passe"
            icon={Lock}
            revealable
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (error) setError('');
            }}
            required
            autoFocus
            autoComplete="new-password"
            placeholder={`Minimum ${MIN_PASSWORD_LENGTH} caractères`}
          />
          <PasswordStrength value={newPassword} />
        </div>

        <AuthField
          label="Confirmer le mot de passe"
          icon={Lock}
          revealable
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (error) setError('');
          }}
          required
          autoComplete="new-password"
          placeholder="Répétez le mot de passe"
          labelAction={
            passwordsMatch ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                <Check className="h-3.5 w-3.5" />
                Identiques
              </span>
            ) : undefined
          }
        />

        <AuthSubmitButton type="submit" loading={loading} loadingLabel="Réinitialisation...">
          Réinitialiser mon mot de passe
        </AuthSubmitButton>
      </form>
    </AuthLayout>
  );
};
