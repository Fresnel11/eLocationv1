import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search, X, type LucideIcon } from 'lucide-react';

export interface PillOption {
  value: string;
  label: string;
}

interface PillSelectProps {
  icon: LucideIcon;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: PillOption[];
  /** Ajoute un champ de recherche en tête de panneau (listes longues). */
  searchable?: boolean;
  searchPlaceholder?: string;
}

const normalize = (text: string) =>
  text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

/**
 * Met en gras la portion du libellé qui correspond à la saisie, comme dans les
 * listes de suggestions : on voit d'un coup d'œil pourquoi la ligne ressort.
 */
const Highlighted: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  if (!query) return <>{text}</>;

  const start = normalize(text).indexOf(normalize(query));
  if (start === -1) return <>{text}</>;

  const end = start + query.length;
  return (
    <>
      {text.slice(0, start)}
      <strong className="font-semibold text-slate-900">{text.slice(start, end)}</strong>
      {text.slice(end)}
    </>
  );
};

/**
 * Menu déroulant sur mesure : le <select> natif affiche la liste du système
 * d'exploitation, impossible à styler. Ici le panneau est un vrai élément de
 * l'interface — coins arrondis, ombre douce, recherche intégrée.
 */
export const PillSelect: React.FC<PillSelectProps> = ({
  icon: Icon,
  label,
  value,
  onChange,
  options,
  searchable = false,
  searchPlaceholder = 'Rechercher...',
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const id = useId();

  const selected = options.find((option) => option.value === value) ?? options[0];

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    return options.filter((option) => normalize(option.label).includes(normalize(query.trim())));
  }, [options, query]);

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
    if (!open) return;
    setQuery('');
    setHighlighted(Math.max(options.findIndex((o) => o.value === value), 0));
    if (searchable) requestAnimationFrame(() => searchRef.current?.focus());
  }, [open]);

  // Garde l'option survolée visible pendant la navigation au clavier.
  useEffect(() => {
    if (open) listRef.current?.children[highlighted]?.scrollIntoView({ block: 'nearest' });
  }, [highlighted, open]);

  const close = () => {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const select = (optionValue: string) => {
    onChange(optionValue);
    close();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!open) return setOpen(true);
      setHighlighted((i) => Math.min(i + 1, filtered.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlighted((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter' && open) {
      event.preventDefault();
      const target = filtered[highlighted];
      if (target) select(target.value);
    } else if (event.key === 'Escape' && open) {
      event.preventDefault();
      close();
    }
  };

  return (
    <div ref={containerRef} className="relative" onKeyDown={onKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={`${id}-list`}
        aria-label={label}
        className="flex h-12 w-full items-center gap-3 rounded-full bg-white pl-4 pr-4 text-sm font-medium text-slate-800 shadow-[0_2px_12px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-[0_4px_16px_rgba(15,23,42,0.10)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
      >
        <Icon className="h-4 w-4 shrink-0 text-blue-600" />
        <span className="min-w-0 flex-1 truncate text-left">{selected?.label}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-50 mt-2 origin-top animate-slide-down overflow-hidden rounded-[1.25rem] bg-white p-2 shadow-[0_12px_40px_rgba(15,23,42,0.16)]">
          {searchable && (
            <div className="relative mb-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setHighlighted(0);
                }}
                placeholder={searchPlaceholder}
                aria-label={`Rechercher : ${label}`}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    searchRef.current?.focus();
                  }}
                  aria-label="Effacer la recherche"
                  className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

          <ul
            ref={listRef}
            id={`${id}-list`}
            role="listbox"
            aria-label={label}
            className="max-h-64 overflow-y-auto overscroll-contain py-0.5 [scrollbar-color:theme(colors.slate.200)_transparent] [scrollbar-width:thin]"
          >
            {filtered.map((option, index) => {
              const isSelected = option.value === value;
              return (
                <li key={option.value} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => select(option.value)}
                    onMouseEnter={() => setHighlighted(index)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm transition-colors ${
                      index === highlighted ? 'bg-slate-50' : ''
                    } ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}
                  >
                    <span className="truncate">
                      <Highlighted text={option.label} query={query.trim()} />
                    </span>
                    {isSelected && <Check className="h-4 w-4 shrink-0 text-blue-600" />}
                  </button>
                </li>
              );
            })}

            {filtered.length === 0 && (
              <li className="px-3.5 py-6 text-center text-sm text-slate-400">Aucun résultat</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
