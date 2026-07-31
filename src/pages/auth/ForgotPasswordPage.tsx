import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, KeyRound, LifeBuoy, Mail, ShieldCheck, X } from 'lucide-react';
import { AuthLayout, type AuthHighlight } from '../../components/auth/AuthLayout';
import { AuthField } from '../../components/auth/AuthField';
import { AuthAlert } from '../../components/auth/AuthAlert';
import { AuthSubmitButton } from '../../components/auth/AuthSubmitButton';
import { authService, User as UserType } from '../../services/authService';

const HIGHLIGHTS: AuthHighlight[] = [
  {
    icon: LifeBuoy,
    title: 'On retrouve votre compte',
    description: 'Une adresse email suffit pour repartir du bon pied.',
    tint: 'bg-cyan-500/25',
  },
  {
    icon: KeyRound,
    title: 'Un code à usage unique',
    description: 'Valable 10 minutes, envoyé uniquement sur votre boîte mail.',
    tint: 'bg-orange-500/25',
  },
  {
    icon: ShieldCheck,
    title: 'Vos annonces sont intactes',
    description: 'Changer de mot de passe ne touche ni vos annonces ni vos réservations.',
    tint: 'bg-green-500/25',
  },
];

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
    const initials = `${foundUser.firstName?.[0] ?? ''}${foundUser.lastName?.[0] ?? ''}`.toUpperCase();

    return (
      <AuthLayout
        panelTitle={
          <>
            Un compte,
            <br />
            <span className="text-cyan-300">et on le remet en route.</span>
          </>
        }
        panelSubtitle="Confirmez qu'il s'agit bien de votre compte avant l'envoi du code."
        highlights={HIGHLIGHTS}
        title="C'est bien vous ?"
        subtitle="Nous avons trouvé un compte associé à cette adresse email."
      >
        {error && <AuthAlert>{error}</AuthAlert>}

        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-xl font-bold text-white shadow-lg shadow-blue-600/25">
            {initials || <Mail className="h-7 w-7" />}
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            {foundUser.firstName} {foundUser.lastName}
          </h3>
          <p className="mt-1 text-sm text-slate-500">{foundUser.email}</p>
          {foundUser.phone && <p className="text-sm text-slate-500">{foundUser.phone}</p>}
          {foundUser.role && (
            <span className="mt-3 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium capitalize text-blue-700">
              {foundUser.role.name}
            </span>
          )}
        </div>

        <div className="mt-6 space-y-3">
          <AuthSubmitButton
            onClick={handleConfirmAccount}
            loading={loading}
            loadingLabel="Envoi du code..."
          >
            <Mail className="h-4 w-4" />
            Oui, envoyez-moi le code
          </AuthSubmitButton>

          <button
            type="button"
            onClick={handleRejectAccount}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 text-[0.95rem] font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
            Non, ce n'est pas mon compte
          </button>
        </div>

        <p className="mt-5 text-center text-xs text-slate-400">
          Le code sera envoyé à {foundUser.email} et restera valable 10 minutes.
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      panelTitle={
        <>
          Un mot de passe oublié,
          <br />
          <span className="text-cyan-300">ça arrive à tout le monde.</span>
        </>
      }
      panelSubtitle="Quelques secondes suffisent pour retrouver l'accès à votre espace eLocation."
      highlights={HIGHLIGHTS}
      title="Mot de passe oublié ?"
      subtitle="Saisissez l'adresse email de votre compte, nous vous enverrons un code de vérification."
      footer={
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la connexion
        </Link>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <AuthField
          label="Email"
          type="email"
          icon={Mail}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError('');
          }}
          error={error}
          required
          autoFocus
          autoComplete="email"
          placeholder="votre@email.com"
        />

        <AuthSubmitButton type="submit" loading={loading} loadingLabel="Recherche...">
          Rechercher mon compte
        </AuthSubmitButton>
      </form>
    </AuthLayout>
  );
};
