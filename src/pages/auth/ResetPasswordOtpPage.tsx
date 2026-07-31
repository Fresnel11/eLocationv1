import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Clock, KeyRound, MailCheck, RefreshCw, ShieldCheck } from 'lucide-react';
import { AuthLayout, type AuthHighlight } from '../../components/auth/AuthLayout';
import { AuthAlert } from '../../components/auth/AuthAlert';
import { AuthSubmitButton } from '../../components/auth/AuthSubmitButton';
import { OtpInput } from '../../components/ui/OtpInput';
import { authService } from '../../services/authService';

const HIGHLIGHTS: AuthHighlight[] = [
  {
    icon: MailCheck,
    title: 'Vérifiez votre boîte mail',
    description: 'Le code arrive en général en moins d\'une minute.',
    tint: 'bg-cyan-500/25',
  },
  {
    icon: Clock,
    title: 'Valable 10 minutes',
    description: 'Passé ce délai, demandez simplement un nouveau code.',
    tint: 'bg-orange-500/25',
  },
  {
    icon: ShieldCheck,
    title: 'Ne partagez jamais ce code',
    description: 'Aucun membre de l\'équipe eLocation ne vous le demandera.',
    tint: 'bg-green-500/25',
  },
];

/** j***@gmail.com : rappelle l'adresse sans l'exposer entièrement. */
const maskEmail = (email: string) => {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${'*'.repeat(Math.max(local.length - visible.length, 1))}@${domain}`;
};

const RESEND_COOLDOWN = 45;

export const ResetPasswordOtpPage: React.FC = () => {
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const navigate = useNavigate();
  const location = useLocation();

  const { email } = location.state || {};

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  // Décompte avant de pouvoir redemander un code.
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const submitCode = useCallback(
    (code: string) => {
      if (code.length !== 6) {
        setError('Le code doit contenir 6 chiffres');
        return;
      }
      setError('');
      setLoading(true);
      // Le code est validé par l'API à l'étape suivante, avec le nouveau mot de passe.
      navigate('/reset-password', { state: { email, code } });
    },
    [email, navigate]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitCode(otpCode);
  };

  const handleOtpChange = (value: string) => {
    setOtpCode(value);
    if (error) setError('');
    // Enchaînement automatique dès le 6e chiffre : plus de bouton à chercher.
    if (value.length === 6) {
      setTimeout(() => submitCode(value), 250);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setResendLoading(true);
    setError('');
    setNotice('');
    try {
      await authService.sendPasswordResetCode(email);
      setNotice('Un nouveau code vient de vous être envoyé.');
      setCooldown(RESEND_COOLDOWN);
    } catch (error) {
      setError('Erreur lors du renvoi du code. Veuillez réessayer.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthLayout
      panelTitle={
        <>
          Un code,
          <br />
          <span className="text-cyan-300">et vous reprenez la main.</span>
        </>
      }
      panelSubtitle="Cette étape confirme que vous êtes bien le propriétaire de l'adresse email."
      highlights={HIGHLIGHTS}
      title="Saisissez votre code"
      subtitle={
        <>
          Nous avons envoyé un code à 6 chiffres à{' '}
          <span className="font-medium text-slate-900">{email ? maskEmail(email) : ''}</span>.
        </>
      }
      footer={
        <Link
          to="/forgot-password"
          className="inline-flex items-center gap-1.5 font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Utiliser une autre adresse
        </Link>
      }
    >
      {notice && <AuthAlert variant="success">{notice}</AuthAlert>}
      {error && <AuthAlert>{error}</AuthAlert>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-6">
          <div className="mb-5 flex items-center justify-center gap-2 text-sm font-medium text-slate-500">
            <KeyRound className="h-4 w-4 text-blue-600" />
            Code de vérification
          </div>
          <OtpInput
            value={otpCode}
            onChange={handleOtpChange}
            invalid={!!error}
            disabled={loading}
          />
        </div>

        <AuthSubmitButton type="submit" loading={loading} loadingLabel="Vérification...">
          Vérifier le code
        </AuthSubmitButton>

        <div className="text-center text-sm">
          {cooldown > 0 ? (
            <span className="inline-flex items-center gap-1.5 text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              Nouveau code possible dans {cooldown}s
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendLoading}
              className="inline-flex items-center gap-1.5 font-medium text-blue-600 underline-offset-4 transition-colors hover:text-blue-700 hover:underline disabled:text-slate-400 disabled:no-underline"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${resendLoading ? 'animate-spin' : ''}`} />
              {resendLoading ? 'Envoi en cours...' : 'Renvoyer le code'}
            </button>
          )}
        </div>
      </form>
    </AuthLayout>
  );
};
