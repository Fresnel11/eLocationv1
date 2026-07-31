import React from 'react';
import { AirVent, Car, Tv, Utensils, Wifi, type LucideIcon } from 'lucide-react';

export interface AdFilterState {
  search: string;
  categoryId: string;
  location: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
  amenities: string[];
  sort: string;
}

export const EMPTY_FILTERS: AdFilterState = {
  search: '',
  categoryId: '',
  location: '',
  minPrice: '',
  maxPrice: '',
  bedrooms: '',
  bathrooms: '',
  amenities: [],
  sort: 'recent',
};

export const AMENITIES: Array<{ value: string; label: string; icon: LucideIcon }> = [
  { value: 'wifi', label: 'WiFi', icon: Wifi },
  { value: 'tv', label: 'Télévision', icon: Tv },
  { value: 'ac', label: 'Climatisation', icon: AirVent },
  { value: 'kitchen', label: 'Cuisine équipée', icon: Utensils },
  { value: 'parking', label: 'Parking', icon: Car },
];

export const CITIES = [
  'Cotonou',
  'Abomey-Calavi',
  'Porto-Novo',
  'Parakou',
  'Bohicon',
  'Natitingou',
];

/** Fourchettes courantes : un clic remplace deux saisies au clavier. */
const PRICE_PRESETS = [
  { label: '< 50 000', min: '', max: '50000' },
  { label: '50 – 150 000', min: '50000', max: '150000' },
  { label: '150 – 300 000', min: '150000', max: '300000' },
  { label: '> 300 000', min: '300000', max: '' },
];

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="border-t border-slate-100 py-5 first:border-t-0 first:pt-0">
    <h3 className="mb-3 text-sm font-semibold text-slate-900">{title}</h3>
    {children}
  </div>
);

/** Sélecteur « au moins N », plus parlant qu'un menu déroulant de nombres. */
const CountPicker: React.FC<{
  value: string;
  onChange: (value: string) => void;
  max?: number;
}> = ({ value, onChange, max = 4 }) => (
  <div className="flex gap-2">
    {['', ...Array.from({ length: max }, (_, i) => String(i + 1))].map((option) => {
      const selected = value === option;
      return (
        <button
          key={option || 'any'}
          type="button"
          onClick={() => onChange(option)}
          aria-pressed={selected}
          className={`h-9 flex-1 rounded-lg border text-sm font-medium transition-colors ${
            selected
              ? 'border-blue-600 bg-blue-600 text-white'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          {option === '' ? 'Tous' : `${option}+`}
        </button>
      );
    })}
  </div>
);

interface AdFiltersProps {
  value: AdFilterState;
  onChange: (patch: Partial<AdFilterState>) => void;
  categories: Array<{ value: string; label: string }>;
  /** La catégorie est déjà pilotée par les pastilles de l'en-tête. */
  hideCategory?: boolean;
}

export const AdFilters: React.FC<AdFiltersProps> = ({ value, onChange, categories, hideCategory }) => {
  const toggleAmenity = (amenity: string) =>
    onChange({
      amenities: value.amenities.includes(amenity)
        ? value.amenities.filter((a) => a !== amenity)
        : [...value.amenities, amenity],
    });

  const inputClass =
    'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10';

  return (
    <div>
      {!hideCategory && (
      <Section title="Catégorie">
        <select
          value={value.categoryId}
          onChange={(e) => onChange({ categoryId: e.target.value })}
          className={inputClass}
        >
          <option value="">Toutes les catégories</option>
          {categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </Section>
      )}

      <Section title="Ville">
        <select
          value={value.location}
          onChange={(e) => onChange({ location: e.target.value })}
          className={inputClass}
        >
          <option value="">Tout le Bénin</option>
          {CITIES.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </Section>

      <Section title="Budget (FCFA)">
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Min"
            value={value.minPrice}
            onChange={(e) => onChange({ minPrice: e.target.value })}
            aria-label="Prix minimum"
            className={inputClass}
          />
          <span className="text-slate-300">—</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="Max"
            value={value.maxPrice}
            onChange={(e) => onChange({ maxPrice: e.target.value })}
            aria-label="Prix maximum"
            className={inputClass}
          />
        </div>

        <div className="mt-2.5 flex flex-wrap gap-2">
          {PRICE_PRESETS.map((preset) => {
            const selected = value.minPrice === preset.min && value.maxPrice === preset.max;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() =>
                  onChange(
                    selected
                      ? { minPrice: '', maxPrice: '' }
                      : { minPrice: preset.min, maxPrice: preset.max },
                  )
                }
                aria-pressed={selected}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  selected
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Chambres">
        <CountPicker value={value.bedrooms} onChange={(bedrooms) => onChange({ bedrooms })} />
      </Section>

      <Section title="Salles de bain">
        <CountPicker value={value.bathrooms} onChange={(bathrooms) => onChange({ bathrooms })} max={3} />
      </Section>

      <Section title="Équipements">
        <div className="space-y-1">
          {AMENITIES.map((amenity) => {
            const checked = value.amenities.includes(amenity.value);
            return (
              <label
                key={amenity.value}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleAmenity(amenity.value)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/30"
                />
                <amenity.icon className={`h-4 w-4 ${checked ? 'text-blue-600' : 'text-slate-400'}`} />
                <span className={`text-sm ${checked ? 'font-medium text-slate-900' : 'text-slate-600'}`}>
                  {amenity.label}
                </span>
              </label>
            );
          })}
        </div>
      </Section>
    </div>
  );
};
