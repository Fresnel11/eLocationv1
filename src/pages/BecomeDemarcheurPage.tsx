import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import IconCheck from '~icons/material-symbols/check-circle-outline';
import IconClock from '~icons/material-symbols/schedule-outline';
import IconAlert from '~icons/material-symbols/error-outline';
import IconBadge from '~icons/material-symbols/verified-outline';
import IconVisibility from '~icons/material-symbols/visibility-outline';
import IconGroup from '~icons/material-symbols/group-outline';
import { AuthSubmitButton } from '../components/auth/AuthSubmitButton';
import { CITIES } from '../components/ads/AdFilters';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  demarcheursService,
  type DemarcheurProfile,
  type DemarcheurStatus,
} from '../services/demarcheursService';
import { verificationService } from '../services/verificationService';
import { IdentityStep, type IdentityDraft } from '../components/demarcheur/IdentityStep';

const BENEFITS = [
  {
    icon: IconBadge,
    title: 'Un badge qui vous distingue',
    description:
      'Vos annonces portent la mention « Démarcheur vérifié ». Votre identité a été contrôlée, et ça se voit.',
  },
  {
    icon: IconVisibility,
    title: 'Une vitrine permanente',
    description:
      'Un profil public regroupe vos biens et vos avis. Vos clients vous retrouvent sans passer par un numéro sur un poteau.',
  },
  {
    icon: IconGroup,
    title: 'Des locataires déjà en recherche',
    description:
      'Vous publiez les biens que vous connaissez pour des personnes qui cherchent activement, pas au hasard.',
  },
];

const STATUS_VIEW: Record<
  DemarcheurStatus,
  { icon: React.ComponentType<{ className?: string }>; tone: string; title: string }
> = {
  pending: {
    icon: IconClock,
    tone: 'bg-amber-50 text-amber-700',
    title: 'Candidature en cours d\'examen',
  },
  approved: {
    icon: IconCheck,
    tone: 'bg-green-50 text-green-700',
    title: 'Vous êtes démarcheur vérifié',
  },
  rejected: {
    icon: IconAlert,
    tone: 'bg-red-50 text-red-700',
    title: 'Candidature refusée',
  },
  suspended: {
    icon: IconAlert,
    tone: 'bg-red-50 text-red-700',
    title: 'Statut suspendu',
  },
};

const Panel: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className = '',
  children,
}) => (
  <section className={`rounded-[1.35rem] bg-white shadow-[0_2px_16px_rgba(15,23,42,0.06)] ${className}`}>
    {children}
  </section>
);

export const BecomeDemarcheurPage: React.FC = () => {
  const { user } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<DemarcheurProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [zones, setZones] = useState<string[]>([]);
  const [experienceYears, setExperienceYears] = useState('0');
  const [motivation, setMotivation] = useState('');

  // L'étape d'identité n'est proposée qu'aux comptes pas encore vérifiés.
  const [isVerified, setIsVerified] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [identity, setIdentity] = useState<IdentityDraft>({
    documentType: 'cni',
    documentTypeChosen: false,
    documentFrontPhoto: '',
    documentBackPhoto: '',
    selfiePhoto: '',
  });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    Promise.all([
      demarcheursService.getMine().catch(() => null),
      verificationService.getVerificationStatus().catch(() => ({ isVerified: false })),
    ])
      .then(([mine, status]) => {
        setProfile(mine);
        setIsVerified(!!status?.isVerified);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const toggleZone = (zone: string) =>
    setZones((current) =>
      current.includes(zone) ? current.filter((z) => z !== zone) : [...current, zone],
    );

  /** Étape 1 complète : conditionne le passage à l'étape suivante. */
  const isStepOneValid = zones.length > 0 && motivation.trim().length >= 40;

  /**
   * Validation de l'étape 1. Un compte déjà vérifié envoie directement sa
   * candidature ; les autres passent par les sous-étapes d'identité.
   */
  const handleStepOne = (event: React.FormEvent) => {
    event.preventDefault();

    if (!isStepOneValid) {
      setFormError(
        zones.length === 0
          ? "Sélectionnez au moins une zone d'intervention."
          : 'Décrivez votre activité en 40 caractères minimum.',
      );
      return;
    }

    setFormError('');
    if (isVerified) submitApplication();
    else setStep(2);
  };

  /**
   * Envoi effectif. Déclenché depuis l'étape 1 pour un compte déjà vérifié,
   * ou depuis la dernière sous-étape d'identité sinon.
   */
  const submitApplication = async () => {
    if (!isVerified) {
      if (!identity.documentFrontPhoto || !identity.selfiePhoto) {
        setFormError('Ajoutez la photo de votre pièce et celle de votre visage.');
        return;
      }
      if (identity.documentType === 'cni' && !identity.documentBackPhoto) {
        setFormError('Le verso de la carte est requis.');
        return;
      }
    }

    setFormError('');
    setSubmitting(true);
    try {
      const created = await demarcheursService.apply({
        zones,
        experienceYears: Number(experienceYears) || 0,
        motivation: motivation.trim(),
        // Les documents ne partent que si l'identité reste à établir.
        ...(isVerified
          ? {}
          : {
              documentType: identity.documentType,
              documentFrontPhoto: identity.documentFrontPhoto,
              documentBackPhoto:
                identity.documentType === 'cni' ? identity.documentBackPhoto : undefined,
              selfiePhoto: identity.selfiePhoto,
            }),
      });
      setProfile(created);
      success('Candidature envoyée', 'Nous revenons vers vous après examen du dossier.');
    } catch (err: any) {
      const message = err.response?.data?.message;
      const readable = Array.isArray(message) ? message.join(', ') : message;
      setFormError(readable || 'Envoi impossible. Réessayez dans un instant.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10';

  return (
    <div className="min-h-screen bg-[#F1F2F4] pb-16">
      <div className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6 lg:px-8">
        <header className="max-w-2xl">
          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            Programme démarcheur
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-[2.25rem]">
            Faites de votre connaissance du terrain un métier reconnu
          </h1>
          <p className="mt-4 leading-relaxed text-slate-600">
            Vous connaissez les logements qui se libèrent dans votre quartier. eLocation vous donne
            une identité vérifiable, une vitrine, et des locataires déjà en recherche — pour que
            votre travail ne repose plus sur le bouche-à-oreille seul.
          </p>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
          <div className="space-y-6">
            <Panel className="p-6">
              <h2 className="text-lg font-bold text-slate-900">Ce que ça vous apporte</h2>
              <ul className="mt-5 space-y-5">
                {BENEFITS.map((benefit) => (
                  <li key={benefit.title} className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[1.35rem] text-blue-600">
                      <benefit.icon />
                    </span>
                    <span>
                      <span className="block font-semibold text-slate-900">{benefit.title}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-slate-500">
                        {benefit.description}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel className="p-6">
              <h2 className="text-lg font-bold text-slate-900">Comment ça se passe</h2>
              <ol className="mt-5 space-y-4">
                {[
                  'Vous vérifiez votre identité (pièce d\'identité et photo).',
                  'Vous déposez votre candidature en indiquant vos zones.',
                  'Notre équipe examine le dossier sous quelques jours.',
                  'Une fois validé, vos annonces portent le badge Démarcheur vérifié.',
                ].map((label, index) => (
                  <li key={label} className="flex gap-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="pt-0.5 text-slate-600">{label}</span>
                  </li>
                ))}
              </ol>

              <p className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-500">
                <span className="font-semibold text-slate-900">Aucun frais, aucun paiement.</span>{' '}
                eLocation ne prélève rien sur vos commissions et n'intervient pas dans vos
                transactions. Vous vous arrangez directement avec vos clients, comme aujourd'hui.
              </p>
            </Panel>
          </div>

          {/* ---------- Formulaire ou statut ---------- */}
          <aside className="lg:sticky lg:top-24">
            {loading ? (
              <Panel className="h-72 animate-pulse">{null}</Panel>
            ) : !user ? (
              <Panel className="p-6 text-center">
                <p className="font-semibold text-slate-900">Connectez-vous pour candidater</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  La candidature est rattachée à votre compte vérifié.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="mt-5 h-12 w-full rounded-full bg-slate-900 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                >
                  Se connecter
                </button>
              </Panel>
            ) : profile ? (
              <StatusPanel profile={profile} onRetry={() => setProfile(null)} />
            ) : (
              <Panel className="p-6">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-lg font-bold text-slate-900">Votre candidature</h2>
                  {!isVerified && (
                    <span className="shrink-0 text-sm font-medium text-slate-400">
                      Étape {step} sur 2
                    </span>
                  )}
                </div>

                {!isVerified && (
                  <div className="mt-3 flex gap-1.5" aria-hidden="true">
                    {[1, 2].map((n) => (
                      <span
                        key={n}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          n <= step ? 'bg-blue-600' : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {formError && (
                  <p
                    role="alert"
                    className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    {formError}
                  </p>
                )}

                <form onSubmit={handleStepOne} className="mt-5 space-y-5">
                  {/* Étape 2 : pièce d'identité, uniquement si le compte
                      n'est pas déjà vérifié. */}
                  {step === 2 ? (
                    <IdentityStep
                      value={identity}
                      onChange={(patch) => setIdentity((current) => ({ ...current, ...patch }))}
                      onBack={() => {
                        setFormError('');
                        setStep(1);
                      }}
                      onSubmit={submitApplication}
                      submitting={submitting}
                    />
                  ) : (
                    <>
                  <fieldset>
                    <legend className="mb-2 text-sm font-medium text-slate-700">
                      Zones d'intervention<span className="ml-0.5 text-blue-600">*</span>
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {CITIES.map((city) => {
                        const selected = zones.includes(city);
                        return (
                          <button
                            key={city}
                            type="button"
                            onClick={() => toggleZone(city)}
                            aria-pressed={selected}
                            className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                              selected
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {city}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  <div>
                    <label htmlFor="exp" className="mb-1.5 block text-sm font-medium text-slate-700">
                      Années d'expérience
                    </label>
                    <input
                      id="exp"
                      type="number"
                      min={0}
                      max={60}
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="motivation" className="mb-1.5 block text-sm font-medium text-slate-700">
                      Votre activité<span className="ml-0.5 text-blue-600">*</span>
                    </label>
                    <textarea
                      id="motivation"
                      rows={5}
                      value={motivation}
                      onChange={(e) => setMotivation(e.target.value)}
                      placeholder="Depuis combien de temps exercez-vous ? Quels types de biens proposez-vous ?"
                      className={`${inputClass} resize-none`}
                    />
                    <p className="mt-1.5 text-xs text-slate-400">
                      {motivation.trim().length} / 40 caractères minimum
                    </p>
                  </div>

                  <AuthSubmitButton
                    type="submit"
                    loading={submitting}
                    loadingLabel="Envoi..."
                    className="rounded-full"
                  >
                    {isVerified ? 'Envoyer ma candidature' : 'Continuer'}
                  </AuthSubmitButton>
                    </>
                  )}
                </form>
              </Panel>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

/** Rappel du statut, avec le motif quand la décision est négative. */
const StatusPanel: React.FC<{ profile: DemarcheurProfile; onRetry: () => void }> = ({
  profile,
  onRetry,
}) => {
  const view = STATUS_VIEW[profile.status];

  return (
    <Panel className="p-6">
      <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${view.tone}`}>
        <view.icon className="text-[1.35rem]" />
        <span className="font-semibold">{view.title}</span>
      </div>

      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Zones</dt>
          <dd className="text-right font-medium text-slate-900">{profile.zones.join(', ')}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Expérience</dt>
          <dd className="font-medium text-slate-900">{profile.experienceYears} an(s)</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Déposée le</dt>
          <dd className="font-medium text-slate-900">
            {new Date(profile.createdAt).toLocaleDateString('fr-FR')}
          </dd>
        </div>
      </dl>

      {profile.rejectionReason && (
        <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
          <span className="font-semibold text-slate-900">Motif : </span>
          {profile.rejectionReason}
        </p>
      )}

      {profile.status === 'approved' && (
        <Link
          to="/create-ad"
          className="mt-5 flex h-12 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Publier une annonce
        </Link>
      )}

      {profile.status === 'rejected' && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 h-12 w-full rounded-full bg-slate-900 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
        >
          Déposer une nouvelle candidature
        </button>
      )}
    </Panel>
  );
};
