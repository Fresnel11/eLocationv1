import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AlertCircle, Check, ChevronDown, Search } from 'lucide-react';
import {
  buildCountryData,
  defaultCountries,
  parseCountry,
  usePhoneInput,
  type CountryData,
  type ParsedCountry,
} from 'react-international-phone';
import { getExampleNumber, isValidPhoneNumber, type CountryCode } from 'libphonenumber-js';
import examples from 'libphonenumber-js/mobile/examples';

/**
 * Valide un numéro E.164 selon les règles réelles du pays (longueur et
 * préfixes), et non une simple fourchette de chiffres : « +229 01 95 12 »
 * est rejeté alors qu'une regex générique le laisserait passer.
 */
export const isPhoneComplete = (phone: string): boolean => {
  try {
    return isValidPhoneNumber(phone);
  } catch {
    return false;
  }
};

/**
 * Drapeaux servis depuis nos propres assets (paquet flag-icons), et non depuis
 * le CDN twemoji utilisé par react-international-phone : pas d'appel réseau
 * tiers sur un formulaire d'inscription, et un rendu correct sous Windows où
 * les emojis drapeaux n'existent pas.
 */
const FLAG_URLS = import.meta.glob<string>('/node_modules/flag-icons/flags/4x3/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
});

const flagSrc = (iso2: string): string | undefined =>
  FLAG_URLS[`/node_modules/flag-icons/flags/4x3/${iso2}.svg`];

/** Noms de pays en français via l'API Intl du navigateur, sans données à embarquer. */
const regionNames =
  typeof Intl !== 'undefined' && 'DisplayNames' in Intl
    ? new Intl.DisplayNames(['fr'], { type: 'region' })
    : undefined;

const frenchName = (country: ParsedCountry): string => {
  try {
    return regionNames?.of(country.iso2.toUpperCase()) ?? country.name;
  } catch {
    return country.name;
  }
};

/** Bénin en tête, puis les pays voisins et la diaspora. */
const PREFERRED = ['bj', 'tg', 'ng', 'ne', 'bf', 'ci', 'gh', 'sn', 'ml', 'fr'];

interface CountryShape {
  /** Indication affichée dans le champ, ex. « 01 XX XX XX XX » pour le Bénin. */
  placeholder: string;
  /** Masque de groupement pendant la frappe, ex. « .. .. .. .. .. ». */
  mask?: string;
}

/**
 * Déduit le format d'un pays de son numéro d'exemple officiel (libphonenumber).
 *
 * On part du format INTERNATIONAL, pas du national : ce dernier inclut le
 * préfixe interurbain (le « 0 » français) qui ne fait pas partie du numéro
 * saisi après l'indicatif. Sans cette précaution la France attendrait 10
 * chiffres après +33 au lieu de 9.
 */
const shapeOf = (iso2: string, dialCode: string): CountryShape => {
  let example: string;
  try {
    const parsed = getExampleNumber(iso2.toUpperCase() as CountryCode, examples);
    if (!parsed) return { placeholder: '' };
    const international = parsed.formatInternational();
    const prefix = `+${dialCode} `;
    example = international.startsWith(prefix)
      ? international.slice(prefix.length)
      : international;
  } catch {
    return { placeholder: '' };
  }

  // Le premier groupe reste lisible (il est fixe dans la plupart des pays :
  // « 01 » au Bénin), le reste est masqué pour ne pas passer pour un vrai numéro.
  const firstSeparator = example.indexOf(' ');
  const placeholder =
    firstSeparator === -1
      ? example.replace(/[0-9]/g, 'X')
      : example.slice(0, firstSeparator) + example.slice(firstSeparator).replace(/[0-9]/g, 'X');

  return { placeholder, mask: example.replace(/[0-9]/g, '.') };
};

const SHAPES = new Map<string, CountryShape>();

const shapeFor = (iso2: string, dialCode: string): CountryShape => {
  const cached = SHAPES.get(iso2);
  if (cached) return cached;
  const shape = shapeOf(iso2, dialCode);
  SHAPES.set(iso2, shape);
  return shape;
};

/**
 * Liste des pays enrichie des masques déduits ci-dessus : la bibliothèque n'en
 * fournit que pour 75 pays sur 218, et aucun d'Afrique de l'Ouest.
 */
const COUNTRIES: CountryData[] = defaultCountries.map((entry) => {
  const country = parseCountry(entry);
  if (country.format) return entry; // masque déjà fourni et vérifié par la lib
  const { mask } = shapeFor(country.iso2, country.dialCode);
  return mask ? buildCountryData({ ...country, format: mask }) : entry;
});

/** Retire les accents pour que « benin » trouve « Bénin ». */
const normalize = (text: string) =>
  text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

interface PhoneFieldProps {
  label: string;
  /** Numéro au format E.164 (ex. +22901234567), ou chaîne vide. */
  value: string;
  onChange: (phone: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  autoFocus?: boolean;
  defaultCountry?: string;
}

export const PhoneField: React.FC<PhoneFieldProps> = ({
  label,
  value,
  onChange,
  error,
  hint,
  required,
  autoFocus,
  defaultCountry = 'bj',
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  const { inputValue, country, setCountry, handlePhoneValueChange, inputRef } = usePhoneInput({
    defaultCountry,
    value,
    countries: COUNTRIES,
    preferredCountries: PREFERRED,
    // Filet de sécurité : les pays à numéros de longueur variable ne doivent
    // pas voir leur saisie tronquée par un masque déduit d'un seul exemple.
    allowMaskOverflow: true,
    onChange: (data) => onChange(data.phone),
  });

  const placeholder = shapeFor(country.iso2, country.dialCode).placeholder;

  const countries = useMemo(() => {
    const all = COUNTRIES.map(parseCountry);
    const preferred = PREFERRED.map((iso) => all.find((c) => c.iso2 === iso)).filter(
      (c): c is ParsedCountry => !!c
    );
    const rest = all
      .filter((c) => !PREFERRED.includes(c.iso2))
      .sort((a, b) => frenchName(a).localeCompare(frenchName(b), 'fr'));
    return [...preferred, ...rest];
  }, []);

  const filtered = useMemo(() => {
    const query = normalize(search.trim()).replace(/^\+/, '');
    if (!query) return countries;
    return countries.filter(
      (c) =>
        normalize(frenchName(c)).includes(query) ||
        normalize(c.name).includes(query) ||
        c.dialCode.startsWith(query) ||
        c.iso2 === query
    );
  }, [countries, search]);

  // Fermeture au clic extérieur.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      setSearch('');
      setHighlighted(Math.max(filtered.findIndex((c) => c.iso2 === country.iso2), 0));
      // Le champ de recherche prend le focus : on tape le pays directement.
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open]);

  // Garde l'option survolée visible pendant la navigation au clavier.
  useEffect(() => {
    if (!open) return;
    listRef.current?.children[highlighted]?.scrollIntoView({ block: 'nearest' });
  }, [highlighted, open]);

  const selectCountry = (iso2: string) => {
    setCountry(iso2);
    setOpen(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleListKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlighted((i) => Math.min(i + 1, filtered.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlighted((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const target = filtered[highlighted];
      if (target) selectCountry(target.iso2);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-blue-600">*</span>}
      </label>

      <div
        className={`
          flex h-12 items-stretch overflow-hidden rounded-xl border bg-slate-50/70
          transition-all duration-200 focus-within:bg-white focus-within:ring-4
          ${
            error
              ? 'border-red-300 focus-within:border-red-500 focus-within:ring-red-500/10'
              : 'border-slate-200 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-blue-500/10'
          }
        `}
      >
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`Indicatif pays : ${frenchName(country)} (+${country.dialCode})`}
          className="flex shrink-0 items-center gap-1.5 border-r border-slate-200 px-3 transition-colors hover:bg-slate-100/70 focus:outline-none focus-visible:bg-slate-100"
        >
          <img
            src={flagSrc(country.iso2)}
            alt=""
            className="h-4 w-6 rounded-sm object-cover shadow-sm ring-1 ring-black/5"
          />
          <ChevronDown
            className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>

        <input
          id={id}
          ref={inputRef}
          type="tel"
          value={inputValue}
          onChange={handlePhoneValueChange}
          autoFocus={autoFocus}
          autoComplete="tel"
          aria-invalid={!!error}
          aria-describedby={describedBy}
          placeholder={placeholder}
          className="w-full bg-transparent px-3 text-[0.95rem] text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      {open && (
        <div className="absolute z-30 mt-2 w-full animate-slide-down overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
          <div className="border-b border-slate-100 p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setHighlighted(0);
                }}
                onKeyDown={handleListKeyDown}
                placeholder="Rechercher un pays ou un indicatif"
                aria-label="Rechercher un pays"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <ul
            ref={listRef}
            role="listbox"
            aria-label="Liste des pays"
            className="max-h-64 overflow-y-auto overscroll-contain py-1"
          >
            {filtered.map((item, index) => {
              const selected = item.iso2 === country.iso2;
              return (
                <li key={item.iso2} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onClick={() => selectCountry(item.iso2)}
                    onMouseEnter={() => setHighlighted(index)}
                    className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${
                      index === highlighted ? 'bg-blue-50' : ''
                    } ${selected ? 'font-medium text-blue-700' : 'text-slate-700'}`}
                  >
                    <img
                      src={flagSrc(item.iso2)}
                      alt=""
                      loading="lazy"
                      className="h-4 w-6 shrink-0 rounded-sm object-cover shadow-sm ring-1 ring-black/5"
                    />
                    <span className="flex-1 truncate">{frenchName(item)}</span>
                    <span className="shrink-0 tabular-nums text-slate-400">+{item.dialCode}</span>
                    {selected && <Check className="h-4 w-4 shrink-0 text-blue-600" />}
                  </button>
                </li>
              );
            })}

            {filtered.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-slate-400">Aucun pays trouvé</li>
            )}
          </ul>
        </div>
      )}

      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-1.5 text-xs text-slate-400">
            {hint}
          </p>
        )
      )}
    </div>
  );
};
