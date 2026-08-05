/**
 * Champs spécifiques à chaque catégorie d'annonce.
 *
 * Le rapprochement se fait sur un nom NORMALISÉ (sans accents, sans casse) et
 * non sur le libellé affiché : les catégories en base s'écrivent « Electroménager »
 * et « Evènementiel », alors que le code cherchait « Électroménager » et
 * « Événementiel ». Ces deux catégories n'affichaient donc aucun champ.
 *
 * Toute catégorie inconnue retombe sur DEFAULT_FIELDS plutôt que de n'afficher
 * rien : ajouter une catégorie en base ne casse plus le formulaire.
 */

export type FieldType = 'number' | 'text' | 'select';

export interface FieldDef {
  /** Nom de la propriété envoyée à l'API (colonne de l'entité Ad). */
  name: 'bedrooms' | 'bathrooms' | 'area' | 'brand' | 'model' | 'year' | 'condition' | 'color' | 'fuel';
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  suffix?: string;
  min?: number;
  max?: number;
  options?: Array<{ value: string; label: string }>;
}

const CONDITION: FieldDef = {
  name: 'condition',
  label: 'État',
  type: 'select',
  options: [
    { value: 'neuf', label: 'Neuf' },
    { value: 'tres-bon', label: 'Très bon état' },
    { value: 'bon', label: 'Bon état' },
    { value: 'usage', label: 'Usagé' },
  ],
};

const BRAND: FieldDef = { name: 'brand', label: 'Marque', type: 'text', placeholder: 'Toyota, LG...' };
const MODEL: FieldDef = { name: 'model', label: 'Modèle', type: 'text', placeholder: 'Corolla, Inverter...' };

const YEAR: FieldDef = {
  name: 'year',
  label: 'Année',
  type: 'number',
  min: 1950,
  max: new Date().getFullYear() + 1,
  placeholder: '2018',
};

const IMMOBILIER: FieldDef[] = [
  {
    name: 'bedrooms',
    label: 'Chambres',
    type: 'select',
    required: true,
    options: [1, 2, 3, 4, 5].map((n) => ({
      value: String(n),
      label: n === 5 ? '5 et plus' : `${n} chambre${n > 1 ? 's' : ''}`,
    })),
  },
  {
    name: 'bathrooms',
    label: 'Salles de bain',
    type: 'select',
    required: true,
    options: [1, 2, 3].map((n) => ({
      value: String(n),
      label: n === 3 ? '3 et plus' : `${n} salle${n > 1 ? 's' : ''} de bain`,
    })),
  },
  { name: 'area', label: 'Surface', type: 'number', required: true, suffix: 'm²', min: 1, placeholder: '65' },
];

const VEHICULES: FieldDef[] = [
  { ...BRAND, required: true },
  { ...MODEL, required: true },
  YEAR,
  {
    name: 'fuel',
    label: 'Carburant',
    type: 'select',
    options: [
      { value: 'essence', label: 'Essence' },
      { value: 'diesel', label: 'Diesel' },
      { value: 'hybride', label: 'Hybride' },
      { value: 'electrique', label: 'Électrique' },
    ],
  },
  { name: 'color', label: 'Couleur', type: 'text', placeholder: 'Gris métallisé' },
  CONDITION,
];

const ELECTROMENAGER: FieldDef[] = [{ ...BRAND, required: true }, MODEL, YEAR, CONDITION];

/** Catégories sans caractéristiques propres : on ne demande que l'essentiel. */
const DEFAULT_FIELDS: FieldDef[] = [BRAND, CONDITION];

/** Retire accents et casse : « Evènementiel » et « Événementiel » se rejoignent. */
export const normalizeCategory = (name: string): string =>
  name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();

const BY_CATEGORY: Record<string, FieldDef[]> = {
  immobilier: IMMOBILIER,
  vehicules: VEHICULES,
  vehicule: VEHICULES,
  electromenager: ELECTROMENAGER,
  evenementiel: DEFAULT_FIELDS,
  loisirs: DEFAULT_FIELDS,
  professionnel: DEFAULT_FIELDS,
};

export const fieldsForCategory = (categoryName?: string): FieldDef[] => {
  if (!categoryName) return [];
  return BY_CATEGORY[normalizeCategory(categoryName)] ?? DEFAULT_FIELDS;
};

/** Les équipements ne concernent que les biens immobiliers. */
export const categoryHasAmenities = (categoryName?: string): boolean =>
  !!categoryName && normalizeCategory(categoryName) === 'immobilier';
