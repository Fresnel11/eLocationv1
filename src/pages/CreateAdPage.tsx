import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import IconArrowLeft from '~icons/line-md/arrow-left';
import IconImage from '~icons/material-symbols/add-photo-alternate-outline';
import IconTrash from '~icons/material-symbols/delete-outline';
import IconCheck from '~icons/material-symbols/check-circle-outline';
import IconInfo from '~icons/material-symbols/info-outline';
import { AuthSubmitButton } from '../components/auth/AuthSubmitButton';
import { AMENITIES, CITIES } from '../components/ads/AdFilters';
import {
  categoryHasAmenities,
  fieldsForCategory,
  type FieldDef,
} from '../components/ads/categoryFields';
import { api } from '../services/api';
import { adsService } from '../services/adsService';
import { demarcheursService } from '../services/demarcheursService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface Category {
  id: string;
  name: string;
}

const PAYMENT_MODES = [
  { value: 'monthly', label: 'Par mois' },
  { value: 'daily', label: 'Par jour' },
  { value: 'weekly', label: 'Par semaine' },
  { value: 'hourly', label: 'Par heure' },
  { value: 'fixed', label: 'Prix fixe' },
];

const STEPS = ['Catégorie', 'Description', 'Caractéristiques', 'Photos & contact'];

const MAX_PHOTOS = 6;

const Panel: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className = '',
  children,
}) => (
  <section className={`rounded-[1.35rem] bg-white shadow-[0_2px_16px_rgba(15,23,42,0.06)] ${className}`}>
    {children}
  </section>
);

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10';

export const CreateAdPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success } = useToast();

  const [step, setStep] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDemarcheur, setIsDemarcheur] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<Record<string, any>>({
    categoryId: '',
    title: '',
    description: '',
    price: '',
    paymentMode: 'monthly',
    location: '',
    whatsappNumber: '',
    amenities: [] as string[],
    // Mandat : uniquement pour un démarcheur publiant pour un propriétaire.
    forOwner: false,
    ownerName: '',
    ownerPhone: '',
  });

  /** Annonce publiée : déclenche la bannière de confirmation. */
  const [published, setPublished] = useState<{ id: string; title: string } | null>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    api
      .get('/categories')
      .then((res) => setCategories(res.data ?? []))
      .catch(() => setCategories([]));

    demarcheursService
      .getMine()
      .then((profile) => setIsDemarcheur(profile?.status === 'approved'))
      .catch(() => setIsDemarcheur(false));
  }, []);

  // Les aperçus sont des URL d'objet : à révoquer pour ne pas fuir la mémoire.
  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [files]);

  const category = useMemo(
    () => categories.find((c) => c.id === form.categoryId),
    [categories, form.categoryId],
  );
  const dynamicFields = useMemo(() => fieldsForCategory(category?.name), [category]);
  const showAmenities = categoryHasAmenities(category?.name);

  const set = (field: string, value: any) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: '' }));
  };

  const toggleAmenity = (value: string) =>
    setForm((current) => ({
      ...current,
      amenities: current.amenities.includes(value)
        ? current.amenities.filter((a: string) => a !== value)
        : [...current.amenities, value],
    }));

  /** Erreurs de l'étape, calculées sans effet de bord. */
  const collectErrors = useCallback(
    (index: number): Record<string, string> => {
      const next: Record<string, string> = {};

      if (index === 0 && !form.categoryId) next.categoryId = 'Choisissez une catégorie';

      if (index === 1) {
        if (form.title.trim().length < 10) next.title = 'Titre trop court (10 caractères minimum)';
        if (form.description.trim().length < 20)
          next.description = 'Description trop courte (20 caractères minimum)';
        if (!form.price || Number(form.price) < 1000) next.price = 'Prix minimum : 1 000 FCFA';
        if (form.location.trim().length < 5) next.location = 'Précisez la localisation';
      }

      if (index === 2) {
        dynamicFields
          .filter((field) => field.required)
          .forEach((field) => {
            if (!form[field.name]) next[field.name] = `${field.label} est requis`;
          });
      }

      if (index === 3) {
        if (files.length === 0) next.photos = 'Ajoutez au moins une photo';
        if (!/^\+[1-9]\d{7,14}$/.test(form.whatsappNumber))
          next.whatsappNumber = 'Numéro WhatsApp au format international (+229...)';
        if (form.forOwner) {
          if (form.ownerName.trim().length < 3) next.ownerName = 'Nom du propriétaire requis';
          if (!/^\+[1-9]\d{7,14}$/.test(form.ownerPhone))
            next.ownerPhone = 'Téléphone du propriétaire au format international';
        }
      }

      return next;
    },
    [form, files, dynamicFields],
  );

  const goNext = () => {
    const stepErrors = collectErrors(step);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;
    setFormError('');
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const accepted = Array.from(incoming).filter((f) => f.type.startsWith('image/'));
    setFiles((current) => [...current, ...accepted].slice(0, MAX_PHOTOS));
  };

  const submit = async () => {
    const stepErrors = collectErrors(3);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;

    setSubmitting(true);
    setFormError('');

    try {
      // 1. Les fichiers d'abord : l'annonce référence ensuite leurs URL.
      const payload = new FormData();
      files.forEach((file) => payload.append('files', file));
      const upload = await api.post('/upload/files', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const specifics: Record<string, any> = {};
      dynamicFields.forEach((field) => {
        const value = form[field.name];
        if (value === '' || value === undefined) return;
        specifics[field.name] =
          field.type === 'number' || field.name === 'bedrooms' || field.name === 'bathrooms'
            ? Number(value)
            : value;
      });

      const created = await api.post('/ads', {
        title: form.title.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        paymentMode: form.paymentMode,
        location: form.location.trim(),
        categoryId: form.categoryId,
        whatsappNumber: form.whatsappNumber,
        photos: upload.data.photos ?? [],
        ...(showAmenities && form.amenities.length ? { amenities: form.amenities } : {}),
        ...specifics,
        ...(form.forOwner
          ? {
              publisherRole: 'middleman',
              ownerName: form.ownerName.trim(),
              ownerPhone: form.ownerPhone.trim(),
              ownerConsent: true,
            }
          : {}),
      });

      // Sans cette purge, la liste resterait sur sa version en cache (5 min)
      // et l'annonce paraîtrait absente.
      adsService.invalidateListCache();

      setPublished({ id: created.data.id, title: created.data.title });
      success('Annonce publiée', 'Elle est désormais visible par les locataires.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      const message = err.response?.data?.message;
      setFormError(
        (Array.isArray(message) ? message.join(', ') : message) ||
          'Publication impossible. Réessayez dans un instant.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FieldDef) => (
    <div key={field.name}>
      <label htmlFor={field.name} className="mb-1.5 block text-sm font-medium text-slate-700">
        {field.label}
        {field.required && <span className="ml-0.5 text-blue-600">*</span>}
      </label>

      {field.type === 'select' ? (
        <select
          id={field.name}
          value={form[field.name] ?? ''}
          onChange={(e) => set(field.name, e.target.value)}
          className={inputClass}
        >
          <option value="">Sélectionner</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <div className="relative">
          <input
            id={field.name}
            type={field.type}
            min={field.min}
            max={field.max}
            value={form[field.name] ?? ''}
            onChange={(e) => set(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={inputClass}
          />
          {field.suffix && (
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              {field.suffix}
            </span>
          )}
        </div>
      )}

      {errors[field.name] && (
        <p role="alert" className="mt-1.5 text-sm text-red-600">
          {errors[field.name]}
        </p>
      )}
    </div>
  );

  return (
    <div className={`min-h-screen bg-[#F1F2F4] ${published ? 'pb-32' : 'pb-16'}`}>
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => (step === 0 ? navigate(-1) : setStep((s) => s - 1))}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <IconArrowLeft />
          {step === 0 ? 'Retour' : STEPS[step - 1]}
        </button>

        <header className="mt-4">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Publier une annonce
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Étape {step + 1} sur {STEPS.length} · {STEPS[step]}
          </p>

          <ol className="mt-4 flex gap-1.5" aria-label="Progression">
            {STEPS.map((label, index) => (
              <li
                key={label}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  index <= step ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              />
            ))}
          </ol>
        </header>

        {formError && (
          <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </p>
        )}

        <Panel className="mt-5 p-6">
          {/* ---------------------- Étape 1 : catégorie ---------------------- */}
          {step === 0 && (
            <div>
              <h2 className="font-semibold text-slate-900">
                Que souhaitez-vous mettre en location ?
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Le formulaire s'adapte ensuite au type de bien.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {categories.map((item) => {
                  const selected = form.categoryId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => set('categoryId', item.id)}
                      aria-pressed={selected}
                      className={`flex items-center justify-between rounded-2xl border px-5 py-4 text-left font-medium transition-all ${
                        selected
                          ? 'border-blue-600 bg-blue-50 text-blue-700 ring-4 ring-blue-500/10'
                          : 'border-slate-200 bg-slate-50/70 text-slate-700 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      {item.name}
                      {selected && <IconCheck className="text-[1.2rem]" />}
                    </button>
                  );
                })}
              </div>

              {errors.categoryId && (
                <p role="alert" className="mt-3 text-sm text-red-600">
                  {errors.categoryId}
                </p>
              )}
            </div>
          )}

          {/* --------------------- Étape 2 : description --------------------- */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Titre<span className="ml-0.5 text-blue-600">*</span>
                </label>
                <input
                  id="title"
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="Appartement 2 chambres meublé à Cotonou"
                  className={inputClass}
                />
                {errors.title && (
                  <p role="alert" className="mt-1.5 text-sm text-red-600">
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Description<span className="ml-0.5 text-blue-600">*</span>
                </label>
                <textarea
                  id="description"
                  rows={6}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Décrivez le bien, son état, son environnement, les conditions de location..."
                  className={`${inputClass} resize-none`}
                />
                <p className="mt-1.5 text-xs text-slate-400">
                  {form.description.trim().length} / 20 caractères minimum
                </p>
                {errors.description && (
                  <p role="alert" className="text-sm text-red-600">
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="price" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Prix<span className="ml-0.5 text-blue-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="price"
                      type="number"
                      min={1000}
                      value={form.price}
                      onChange={(e) => set('price', e.target.value)}
                      placeholder="85000"
                      className={inputClass}
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                      FCFA
                    </span>
                  </div>
                  {errors.price && (
                    <p role="alert" className="mt-1.5 text-sm text-red-600">
                      {errors.price}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="paymentMode"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Modalité
                  </label>
                  <select
                    id="paymentMode"
                    value={form.paymentMode}
                    onChange={(e) => set('paymentMode', e.target.value)}
                    className={inputClass}
                  >
                    {PAYMENT_MODES.map((mode) => (
                      <option key={mode.value} value={mode.value}>
                        {mode.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="location" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Localisation<span className="ml-0.5 text-blue-600">*</span>
                </label>
                <input
                  id="location"
                  list="cities"
                  value={form.location}
                  onChange={(e) => set('location', e.target.value)}
                  placeholder="Cotonou, quartier Fidjrossè"
                  className={inputClass}
                />
                <datalist id="cities">
                  {CITIES.map((city) => (
                    <option key={city} value={city} />
                  ))}
                </datalist>
                {errors.location && (
                  <p role="alert" className="mt-1.5 text-sm text-red-600">
                    {errors.location}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ------------------ Étape 3 : caractéristiques ------------------- */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-semibold text-slate-900">Caractéristiques</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Champs adaptés à la catégorie « {category?.name} ».
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">{dynamicFields.map(renderField)}</div>

              {showAmenities && (
                <div className="border-t border-slate-100 pt-5">
                  <span className="mb-3 block text-sm font-medium text-slate-700">Équipements</span>
                  <div className="flex flex-wrap gap-2">
                    {AMENITIES.map((amenity) => {
                      const selected = form.amenities.includes(amenity.value);
                      return (
                        <button
                          key={amenity.value}
                          type="button"
                          onClick={() => toggleAmenity(amenity.value)}
                          aria-pressed={selected}
                          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                            selected
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <amenity.icon className="h-4 w-4" />
                          {amenity.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ------------------ Étape 4 : photos et contact ------------------ */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Photos<span className="ml-0.5 text-blue-600">*</span>
                </span>
                <p className="mb-3 text-xs text-slate-400">
                  {MAX_PHOTOS} photos maximum. La première servira de vignette.
                </p>

                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {previews.map((preview, index) => (
                    <div
                      key={preview}
                      className="group relative aspect-square overflow-hidden rounded-xl"
                    >
                      <img src={preview} alt="" className="h-full w-full object-cover" />
                      {index === 0 && (
                        <span className="absolute left-1.5 top-1.5 rounded-md bg-slate-900/70 px-1.5 py-0.5 text-[0.65rem] font-semibold text-white">
                          Vignette
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setFiles((current) => current.filter((_, i) => i !== index))}
                        aria-label="Retirer cette photo"
                        className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <IconTrash />
                      </button>
                    </div>
                  ))}

                  {files.length < MAX_PHOTOS && (
                    <label
                      htmlFor="photos"
                      className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/70 text-slate-400 transition-colors hover:border-slate-300 hover:bg-white"
                    >
                      <IconImage className="text-[1.5rem]" />
                      <span className="text-xs font-medium">Ajouter</span>
                    </label>
                  )}
                </div>
                <input
                  id="photos"
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(e) => {
                    addFiles(e.target.files);
                    e.target.value = '';
                  }}
                />
                {errors.photos && (
                  <p role="alert" className="mt-2 text-sm text-red-600">
                    {errors.photos}
                  </p>
                )}
              </div>

              <div className="border-t border-slate-100 pt-5">
                <label htmlFor="whatsapp" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Numéro WhatsApp<span className="ml-0.5 text-blue-600">*</span>
                </label>
                <input
                  id="whatsapp"
                  value={form.whatsappNumber}
                  onChange={(e) => set('whatsappNumber', e.target.value)}
                  placeholder="+22996123456"
                  className={inputClass}
                />
                <p className="mt-1.5 text-xs text-slate-400">
                  C'est par ce numéro que les locataires vous joindront.
                </p>
                {errors.whatsappNumber && (
                  <p role="alert" className="text-sm text-red-600">
                    {errors.whatsappNumber}
                  </p>
                )}
              </div>

              {/* Bloc mandat : réservé aux démarcheurs approuvés. */}
              {isDemarcheur && (
                <div className="border-t border-slate-100 pt-5">
                  <label
                    htmlFor="forOwner"
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${
                      form.forOwner
                        ? 'border-blue-200 bg-blue-50/60'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      id="forOwner"
                      type="checkbox"
                      checked={form.forOwner}
                      onChange={(e) => set('forOwner', e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/30"
                    />
                    <span className="text-sm leading-relaxed text-slate-600">
                      <span className="font-semibold text-slate-900">
                        Je publie pour le compte d'un propriétaire.
                      </span>{' '}
                      En cochant, vous attestez avoir son accord pour mettre ce bien en ligne.
                    </span>
                  </label>

                  {form.forOwner && (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="ownerName"
                          className="mb-1.5 block text-sm font-medium text-slate-700"
                        >
                          Nom du propriétaire<span className="ml-0.5 text-blue-600">*</span>
                        </label>
                        <input
                          id="ownerName"
                          value={form.ownerName}
                          onChange={(e) => set('ownerName', e.target.value)}
                          placeholder="Koffi Adjovi"
                          className={inputClass}
                        />
                        {errors.ownerName && (
                          <p role="alert" className="mt-1.5 text-sm text-red-600">
                            {errors.ownerName}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="ownerPhone"
                          className="mb-1.5 block text-sm font-medium text-slate-700"
                        >
                          Son téléphone<span className="ml-0.5 text-blue-600">*</span>
                        </label>
                        <input
                          id="ownerPhone"
                          value={form.ownerPhone}
                          onChange={(e) => set('ownerPhone', e.target.value)}
                          placeholder="+22996123456"
                          className={inputClass}
                        />
                        {errors.ownerPhone && (
                          <p role="alert" className="mt-1.5 text-sm text-red-600">
                            {errors.ownerPhone}
                          </p>
                        )}
                      </div>
                      <p className="flex items-start gap-2 text-xs leading-relaxed text-slate-400 sm:col-span-2">
                        <IconInfo className="mt-0.5 shrink-0" />
                        Ces coordonnées ne sont pas publiées. Elles servent de trace en cas de
                        contestation du propriétaire.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </Panel>

        <div className="mt-5 flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="h-12 flex-1 rounded-full border border-slate-200 bg-white text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              Précédent
            </button>
          )}

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="h-12 flex-[2] rounded-full bg-blue-600 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(37,99,235,0.35)] transition-colors hover:bg-blue-700"
            >
              Continuer
            </button>
          ) : (
            <AuthSubmitButton
              type="button"
              onClick={submit}
              loading={submitting}
              loadingLabel="Publication..."
              className="flex-[2] rounded-full"
            >
              Publier l'annonce
            </AuthSubmitButton>
          )}
        </div>
      </div>

      {/* ---- Confirmation ancrée en bas : l'action suivante reste à portée ---- */}
      {published && (
        <div className="fixed inset-x-0 bottom-0 z-40 animate-slide-up border-t border-slate-200 bg-white/95 px-4 py-4 shadow-[0_-4px_24px_rgba(15,23,42,0.10)] backdrop-blur">
          <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100 text-[1.4rem] text-green-600">
              <IconCheck />
            </span>

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900">Annonce publiée</p>
              <p className="truncate text-sm text-slate-500">{published.title}</p>
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => navigate('/ads')}
                className="h-11 rounded-full border border-slate-200 px-5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                Voir les annonces
              </button>
              <button
                type="button"
                onClick={() => navigate(`/detail/${published.id}`)}
                className="h-11 rounded-full bg-blue-600 px-6 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(37,99,235,0.35)] transition-colors hover:bg-blue-700"
              >
                Voir la publication
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
