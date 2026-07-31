/**
 * Source unique des règles de mot de passe : la jauge, la validation du
 * formulaire et le message d'erreur en découlent tous, ils ne peuvent donc pas
 * diverger. Les mêmes règles sont appliquées côté API (RegisterDto,
 * ResetPasswordDto) : le contrôle navigateur guide, il ne protège pas.
 */

export const MIN_PASSWORD_LENGTH = 8;
/** Longueur à partir de laquelle le mot de passe atteint le niveau maximal. */
const STRONG_PASSWORD_LENGTH = 12;

export interface PasswordRule {
  id: string;
  /** Libellé affiché sous le champ. */
  label: string;
  /** Formulation courte, utilisée dans le message d'erreur. */
  shortLabel: string;
  test: (value: string) => boolean;
  /** Une règle conseillée renforce la jauge mais ne bloque pas l'envoi. */
  required: boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: 'length',
    label: `Au moins ${MIN_PASSWORD_LENGTH} caractères`,
    shortLabel: `${MIN_PASSWORD_LENGTH} caractères`,
    test: (v) => v.length >= MIN_PASSWORD_LENGTH,
    required: true,
  },
  {
    id: 'uppercase',
    label: 'Une lettre majuscule',
    shortLabel: 'une majuscule',
    test: (v) => /[A-Z]/.test(v),
    required: true,
  },
  {
    id: 'lowercase',
    label: 'Une lettre minuscule',
    shortLabel: 'une minuscule',
    test: (v) => /[a-z]/.test(v),
    required: true,
  },
  {
    id: 'digit',
    label: 'Un chiffre',
    shortLabel: 'un chiffre',
    test: (v) => /\d/.test(v),
    required: true,
  },
  {
    id: 'special',
    label: 'Un caractère spécial (conseillé)',
    shortLabel: 'un caractère spécial',
    test: (v) => /[^A-Za-z0-9]/.test(v),
    required: false,
  },
];

const REQUIRED_RULES = PASSWORD_RULES.filter((rule) => rule.required);

interface Level {
  from: number;
  label: string;
  bar: string;
  text: string;
}

/** Le niveau « Bon » correspond exactement au seuil de validité (80). */
const LEVELS: Level[] = [
  { from: 0, label: 'Très faible', bar: 'bg-red-500', text: 'text-red-600' },
  { from: 40, label: 'Faible', bar: 'bg-orange-500', text: 'text-orange-600' },
  { from: 60, label: 'Moyen', bar: 'bg-amber-500', text: 'text-amber-600' },
  { from: 80, label: 'Bon', bar: 'bg-blue-500', text: 'text-blue-600' },
  { from: 100, label: 'Excellent', bar: 'bg-green-500', text: 'text-green-600' },
];

export interface PasswordEvaluation {
  /** Remplissage de la barre, de 0 à 100. */
  score: number;
  label: string;
  barClass: string;
  textClass: string;
  /** Vrai quand toutes les règles obligatoires sont satisfaites. */
  isValid: boolean;
  results: Array<PasswordRule & { ok: boolean }>;
}

export const evaluatePassword = (value: string): PasswordEvaluation => {
  const results = PASSWORD_RULES.map((rule) => ({ ...rule, ok: rule.test(value) }));
  const requiredMet = results.filter((r) => r.required && r.ok).length;

  // 20 points par règle obligatoire (80), puis deux bonus de 10 pour
  // distinguer un mot de passe simplement valide d'un mot de passe solide.
  let score = requiredMet * 20;
  if (value.length >= MIN_PASSWORD_LENGTH) {
    if (results.find((r) => r.id === 'special')?.ok) score += 10;
    if (value.length >= STRONG_PASSWORD_LENGTH) score += 10;
  }
  score = Math.min(score, 100);

  const level = [...LEVELS].reverse().find((l) => score >= l.from) ?? LEVELS[0];

  return {
    score,
    label: level.label,
    barClass: level.bar,
    textClass: level.text,
    isValid: requiredMet === REQUIRED_RULES.length,
    results,
  };
};

/** Message de validation du formulaire, ou undefined si le mot de passe convient. */
export const getPasswordError = (value: string): string | undefined => {
  if (!value) return 'Le mot de passe est requis';

  const missing = REQUIRED_RULES.filter((rule) => !rule.test(value));
  if (missing.length === 0) return undefined;

  return `Il manque : ${missing.map((rule) => rule.shortLabel).join(', ')}`;
};
