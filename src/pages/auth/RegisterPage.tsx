import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Gift,
  Lock,
  Mail,
  Rocket,
  ShieldCheck,
  User,
  UserCheck,
} from 'lucide-react';
import { AuthLayout, type AuthHighlight } from '../../components/auth/AuthLayout';
import { AuthField } from '../../components/auth/AuthField';
import { PhoneField, isPhoneComplete } from '../../components/auth/PhoneField';
import { AuthAlert } from '../../components/auth/AuthAlert';
import { AuthSubmitButton } from '../../components/auth/AuthSubmitButton';
import { PasswordStrength } from '../../components/auth/PasswordStrength';
import { getPasswordError } from '../../components/auth/passwordRules';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const HIGHLIGHTS: AuthHighlight[] = [
  {
    icon: Rocket,
    title: 'Publiez en quelques minutes',
    description: 'Votre première annonce est en ligne dès la fin de l\'inscription.',
    tint: 'bg-orange-500/25',
  },
  {
    icon: ShieldCheck,
    title: 'Un compte, deux usages',
    description: 'Louez vos biens et réservez ceux des autres avec le même profil.',
    tint: 'bg-cyan-500/25',
  },
  {
    icon: Gift,
    title: 'Parrainage récompensé',
    description: 'Un code de parrainage ? Saisissez-le à l\'étape contact.',
    tint: 'bg-green-500/25',
  },
];

const STEPS = [
  { id: 1, title: 'Identité', description: 'Qui êtes-vous ?' },
  { id: 2, title: 'Contact', description: 'Comment vous joindre' },
  { id: 3, title: 'Sécurité', description: 'Protégez votre compte' },
] as const;

/** Sélecteur segmenté : plus lisible qu'un <select> sur mobile. */
const GenderPicker: React.FC<{
  value: string;
  onChange: (value: string) => void;
  error?: string;
}> = ({ value, onChange, error }) => (
  <div>
    <span className="mb-1.5 block text-sm font-medium text-slate-700">
      Sexe<span className="ml-0.5 text-blue-600">*</span>
    </span>
    <div className="grid grid-cols-2 gap-3">
      {['masculin', 'féminin'].map((option) => {
        const selected = value === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={selected}
            className={`h-12 rounded-xl border text-[0.95rem] font-medium capitalize transition-all duration-200 ${
              selected
                ? 'border-blue-600 bg-blue-50 text-blue-700 ring-4 ring-blue-500/10'
                : error
                  ? 'border-red-300 bg-white text-slate-600 hover:border-red-400'
                  : 'border-slate-200 bg-slate-50/70 text-slate-600 hover:border-slate-300 hover:bg-white'
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
    {error && (
      <p role="alert" className="mt-1.5 text-sm text-red-600">
        {error}
      </p>
    )}
  </div>
);

export const RegisterPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = sessionStorage.getItem('registerStep');
    return saved ? parseInt(saved) : 1;
  });
  const [formData, setFormData] = useState(() => {
    const saved = sessionStorage.getItem('registerFormData');
    return saved ? JSON.parse(saved) : {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      referralCode: '',
      birthDate: '',
      gender: ''
    };
  });
  const [acceptedTerms, setAcceptedTerms] = useState(() => {
    const saved = sessionStorage.getItem('registerAcceptedTerms');
    return saved ? JSON.parse(saved) : false;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const { register, loading } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleChange = (field: string, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    sessionStorage.setItem('registerFormData', JSON.stringify(newFormData));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  /**
   * Calcul pur des erreurs d'une étape : sert à la fois à l'affichage au clic
   * et à l'état actif du bouton final, qui ne peut donc pas se désynchroniser.
   */
  const collectErrors = (step: number): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'Le prénom est requis';
      if (!formData.lastName.trim()) newErrors.lastName = 'Le nom de famille est requis';
      if (!formData.birthDate) {
        newErrors.birthDate = 'La date de naissance est requise';
      } else {
        const birthDate = new Date(formData.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age < 18) {
          newErrors.birthDate = 'Vous devez avoir au moins 18 ans';
        }
      }
      if (!formData.gender) newErrors.gender = 'Le sexe est requis';
    }

    if (step === 2) {
      // Le champ pré-remplit l'indicatif : au-delà de 4 chiffres seulement,
      // l'utilisateur a réellement commencé à saisir un numéro.
      const phoneDigits = formData.phone.replace(/\D/g, '');
      if (phoneDigits.length <= 4) {
        newErrors.phone = 'Le numéro de téléphone est requis';
      } else if (!isPhoneComplete(formData.phone)) {
        newErrors.phone = 'Ce numéro ne correspond pas au format du pays sélectionné';
      }
      if (!formData.email.trim()) {
        newErrors.email = 'L\'email est requis';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email invalide';
      }
    }

    if (step === 3) {
      const passwordError = getPasswordError(formData.password);
      if (passwordError) {
        newErrors.password = passwordError;
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Veuillez confirmer votre mot de passe';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }

    return newErrors;
  };

  const validateStep = (step: number): boolean => {
    const stepErrors = collectErrors(step);
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  /** Signale l'erreur dès que l'utilisateur quitte le champ, sans attendre l'envoi. */
  const showErrorOnBlur = (field: string) => {
    const stepErrors = collectErrors(currentStep);
    if (stepErrors[field]) {
      setErrors((prev) => ({ ...prev, [field]: stepErrors[field] }));
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
    sessionStorage.setItem('registerStep', step.toString());
  };

  const nextStep = () => {
    if (validateStep(currentStep)) goToStep(Math.min(currentStep + 1, 3));
  };

  const prevStep = () => goToStep(Math.max(currentStep - 1, 1));

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    if (!acceptedTerms) {
      setFormError('Vous devez accepter les conditions d\'utilisation pour créer votre compte.');
      return;
    }

    setFormError('');

    try {
      await register(formData.firstName, formData.lastName, formData.phone, formData.password, formData.email || undefined, formData.referralCode || undefined, acceptedTerms, formData.birthDate, formData.gender as 'masculin' | 'féminin');
      // Nettoyer le sessionStorage après inscription réussie
      sessionStorage.removeItem('registerFormData');
      sessionStorage.removeItem('registerStep');
      sessionStorage.removeItem('registerAcceptedTerms');

      success(
        'Inscription réussie !',
        'Bienvenue sur eLocation Bénin, votre compte est prêt.'
      );
      // Même destination que la connexion : l'utilisateur arrive sur les annonces.
      navigate('/ads');
    } catch (err: any) {
      const message = err.response?.data?.message;
      const readable = Array.isArray(message) ? message.join(', ') : message;
      setFormError(readable || 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.');
      error('Erreur d\'inscription', readable || 'Une erreur est survenue lors de l\'inscription');
    }
  };

  // Enter valide l'étape courante plutôt que de soumettre un formulaire incomplet.
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 3) nextStep();
    else handleSubmit();
  };

  const passwordsMatch =
    formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword;

  // Le bouton final ne s'active qu'une fois toutes les règles satisfaites et
  // les conditions acceptées. Les erreurs restent affichées sous les champs
  // concernés, pour que l'utilisateur sache toujours ce qui manque.
  const canSubmit = Object.keys(collectErrors(3)).length === 0 && acceptedTerms;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <AuthField
                label="Prénom"
                icon={User}
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                error={errors.firstName}
                required
                autoFocus
                autoComplete="given-name"
                placeholder="Jean"
              />
              <AuthField
                label="Nom de famille"
                icon={User}
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                error={errors.lastName}
                required
                autoComplete="family-name"
                placeholder="Dupont"
              />
            </div>

            <AuthField
              label="Date de naissance"
              type="date"
              icon={Calendar}
              value={formData.birthDate}
              onChange={(e) => handleChange('birthDate', e.target.value)}
              error={errors.birthDate}
              required
              autoComplete="bday"
              hint="La plateforme est réservée aux personnes majeures."
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
            />

            <GenderPicker
              value={formData.gender}
              onChange={(value) => handleChange('gender', value)}
              error={errors.gender}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <PhoneField
              label="Numéro de téléphone"
              value={formData.phone}
              onChange={(phone) => handleChange('phone', phone)}
              error={errors.phone}
              required
              autoFocus
              hint="Choisissez votre indicatif si vous n'êtes pas au Bénin."
            />

            <AuthField
              label="Email"
              type="email"
              icon={Mail}
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              error={errors.email}
              required
              autoComplete="email"
              placeholder="votre@email.com"
              hint="Sert à récupérer votre compte en cas d'oubli du mot de passe."
            />

            <AuthField
              label="Code de parrainage"
              icon={Gift}
              value={formData.referralCode}
              onChange={(e) => handleChange('referralCode', e.target.value.toUpperCase())}
              placeholder="JEA123ABC"
              maxLength={10}
              hint="Optionnel — si un proche vous a invité."
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            <div>
              <AuthField
                label="Mot de passe"
                icon={Lock}
                revealable
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                // La confirmation déjà saisie est revérifiée si le mot de passe change.
                onBlur={() => formData.confirmPassword && showErrorOnBlur('confirmPassword')}
                error={errors.password}
                required
                autoFocus
                autoComplete="new-password"
                placeholder="••••••••"
              />
              <PasswordStrength value={formData.password} />
            </div>

            <AuthField
              label="Confirmer le mot de passe"
              icon={Lock}
              revealable
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              onBlur={() => showErrorOnBlur('confirmPassword')}
              error={errors.confirmPassword}
              required
              autoComplete="new-password"
              placeholder="••••••••"
              labelAction={
                passwordsMatch ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                    <Check className="h-3.5 w-3.5" />
                    Identiques
                  </span>
                ) : undefined
              }
            />

            {/* Récapitulatif */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
              <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <UserCheck className="h-4 w-4 text-blue-600" />
                Vérifiez vos informations
              </h4>
              <dl className="space-y-2.5 text-sm">
                {[
                  { label: 'Nom complet', value: `${formData.firstName} ${formData.lastName}` },
                  { label: 'Téléphone', value: formData.phone },
                  { label: 'Email', value: formData.email },
                  { label: 'Parrainage', value: formData.referralCode },
                ]
                  .filter((row) => row.value?.trim())
                  .map((row) => (
                    <div key={row.label} className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
                      <dt className="text-slate-500">{row.label}</dt>
                      <dd className="break-all font-medium text-slate-900 sm:text-right">{row.value}</dd>
                    </div>
                  ))}
              </dl>
              <button
                type="button"
                onClick={() => goToStep(1)}
                className="mt-4 text-sm font-medium text-blue-600 underline-offset-4 transition-colors hover:text-blue-700 hover:underline"
              >
                Modifier mes informations
              </button>
            </div>

            <label
              htmlFor="terms"
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                acceptedTerms
                  ? 'border-blue-200 bg-blue-50/60'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setAcceptedTerms(checked);
                  sessionStorage.setItem('registerAcceptedTerms', JSON.stringify(checked));
                  if (checked) setFormError('');
                }}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/30"
              />
              <span className="text-sm leading-relaxed text-slate-600">
                J'accepte les{' '}
                <Link
                  to="/terms"
                  target="_blank"
                  className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
                >
                  conditions d'utilisation
                </Link>{' '}
                d'eLocation Bénin.
              </span>
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  const activeStep = STEPS[currentStep - 1];

  return (
    <AuthLayout
      wide
      panelTitle={
        <>
          Votre compte,
          <br />
          <span className="text-cyan-300">deux minutes chrono.</span>
        </>
      }
      panelSubtitle="Rejoignez la plateforme de location de référence au Bénin : louez, réservez, échangez."
      highlights={HIGHLIGHTS}
      title="Créer votre compte"
      subtitle={
        <>
          Étape {currentStep} sur {STEPS.length} · {activeStep.description}
        </>
      }
      footer={
        <>
          Vous avez déjà un compte ?{' '}
          <Link
            to="/login"
            className="font-semibold text-blue-600 underline-offset-4 transition-colors hover:text-blue-700 hover:underline"
          >
            Se connecter
          </Link>
        </>
      }
    >
      {/* Fil d'étapes : les étapes déjà validées restent cliquables. */}
      <nav aria-label="Progression de l'inscription" className="mb-8">
        <ol className="flex items-center">
          {STEPS.map((step, index) => {
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;

            return (
              <React.Fragment key={step.id}>
                <li className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => isCompleted && goToStep(step.id)}
                    disabled={!isCompleted}
                    aria-current={isActive ? 'step' : undefined}
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ${
                      isCompleted
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : isActive
                          ? 'bg-blue-600 text-white ring-4 ring-blue-500/20'
                          : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : step.id}
                  </button>
                  <span
                    className={`hidden text-sm font-medium transition-colors sm:inline ${
                      isActive ? 'text-slate-900' : isCompleted ? 'text-slate-600' : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </li>
                {index < STEPS.length - 1 && (
                  <li aria-hidden="true" className="mx-3 h-0.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <span
                      className={`block h-full rounded-full bg-blue-600 transition-all duration-500 ${
                        currentStep > step.id ? 'w-full' : 'w-0'
                      }`}
                    />
                  </li>
                )}
              </React.Fragment>
            );
          })}
        </ol>
      </nav>

      {formError && <AuthAlert>{formError}</AuthAlert>}

      <form onSubmit={handleFormSubmit} noValidate>
        <div key={currentStep} className="animate-slide-up">{renderStep()}</div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 text-[0.95rem] font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              Précédent
            </button>
          )}

          {currentStep < STEPS.length ? (
            <AuthSubmitButton type="submit" className="sm:flex-1">
              Continuer
              <ArrowRight className="h-4 w-4" />
            </AuthSubmitButton>
          ) : (
            <AuthSubmitButton
              type="submit"
              loading={loading}
              loadingLabel="Création du compte..."
              disabled={!canSubmit}
              className="sm:flex-1"
            >
              Créer mon compte
            </AuthSubmitButton>
          )}
        </div>
      </form>
    </AuthLayout>
  );
};
