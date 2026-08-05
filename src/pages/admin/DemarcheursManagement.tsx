import React, { useCallback, useEffect, useMemo, useState } from 'react';
import IconCheck from '~icons/material-symbols/check-circle-outline';
import IconClose from '~icons/material-symbols/cancel-outline';
import IconPause from '~icons/material-symbols/block';
import IconVerified from '~icons/material-symbols/verified-outline';
import IconWarning from '~icons/material-symbols/warning-outline';
import IconRefresh from '~icons/material-symbols/refresh';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useToast } from '../../context/ToastContext';
import {
  demarcheursService,
  type DemarcheurApplication,
  type DemarcheurStatus,
} from '../../services/demarcheursService';

const TABS: Array<{ value: DemarcheurStatus | 'all'; label: string }> = [
  { value: 'pending', label: 'À examiner' },
  { value: 'approved', label: 'Approuvés' },
  { value: 'rejected', label: 'Refusés' },
  { value: 'suspended', label: 'Suspendus' },
  { value: 'all', label: 'Tous' },
];

const STATUS_BADGE: Record<DemarcheurStatus, { label: string; tone: string }> = {
  pending: { label: 'En attente', tone: 'bg-amber-50 text-amber-700' },
  approved: { label: 'Approuvé', tone: 'bg-green-50 text-green-700' },
  rejected: { label: 'Refusé', tone: 'bg-red-50 text-red-700' },
  suspended: { label: 'Suspendu', tone: 'bg-slate-200 text-slate-700' },
};

/** Décision négative : le motif est obligatoire et sera lu par le candidat. */
interface PendingDecision {
  application: DemarcheurApplication;
  status: Extract<DemarcheurStatus, 'rejected' | 'suspended'>;
}

export const DemarcheursManagement: React.FC = () => {
  const { success, error: toastError } = useToast();

  const [tab, setTab] = useState<DemarcheurStatus | 'all'>('pending');
  const [applications, setApplications] = useState<DemarcheurApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [decision, setDecision] = useState<PendingDecision | null>(null);
  const [reason, setReason] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setFailed(false);
    demarcheursService
      .listApplications(tab === 'all' ? undefined : tab)
      .then(setApplications)
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, [tab]);

  useEffect(load, [load]);

  const counts = useMemo(
    () => applications.filter((a) => a.status === 'pending').length,
    [applications],
  );

  const approve = async (application: DemarcheurApplication) => {
    setBusyId(application.id);
    try {
      await demarcheursService.review(application.id, 'approved');
      success('Démarcheur approuvé', `${application.candidate.firstName} porte désormais le badge.`);
      load();
    } catch (err: any) {
      toastError('Action impossible', err.response?.data?.message ?? 'Réessayez dans un instant.');
    } finally {
      setBusyId(null);
    }
  };

  const confirmDecision = async () => {
    if (!decision) return;
    if (reason.trim().length < 10) {
      toastError('Motif trop court', 'Le candidat doit pouvoir comprendre la décision.');
      return;
    }

    setBusyId(decision.application.id);
    try {
      await demarcheursService.review(decision.application.id, decision.status, reason.trim());
      success(
        decision.status === 'rejected' ? 'Candidature refusée' : 'Démarcheur suspendu',
        'Le candidat a été notifié avec le motif.',
      );
      setDecision(null);
      setReason('');
      load();
    } catch (err: any) {
      toastError('Action impossible', err.response?.data?.message ?? 'Réessayez dans un instant.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Démarcheurs</h1>
            <p className="mt-1 text-sm text-slate-500">
              Examen des candidatures et gestion des badges.
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            <IconRefresh />
            Actualiser
          </button>
        </header>

        <div className="mt-6 flex flex-wrap gap-2">
          {TABS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setTab(item.value)}
              className={`h-10 rounded-full px-4 text-sm font-medium transition-colors ${
                tab === item.value
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {item.label}
              {item.value === 'pending' && tab === 'pending' && counts > 0 && (
                <span className="ml-2 rounded-full bg-white/20 px-1.5 text-xs">{counts}</span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {loading ? (
            Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl bg-white" />
            ))
          ) : failed ? (
            <div className="rounded-xl bg-white p-10 text-center">
              <p className="font-semibold text-slate-900">Chargement impossible</p>
              <button
                type="button"
                onClick={load}
                className="mt-4 h-10 rounded-lg bg-slate-900 px-5 text-sm font-medium text-white"
              >
                Réessayer
              </button>
            </div>
          ) : applications.length === 0 ? (
            <div className="rounded-xl bg-white p-12 text-center">
              <p className="font-semibold text-slate-900">Aucune candidature</p>
              <p className="mt-1 text-sm text-slate-500">
                {tab === 'pending'
                  ? 'Rien à examiner pour le moment.'
                  : 'Aucun dossier dans cette catégorie.'}
              </p>
            </div>
          ) : (
            applications.map((application) => {
              const badge = STATUS_BADGE[application.status];
              const busy = busyId === application.id;

              return (
                <article key={application.id} className="rounded-xl bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-slate-900">
                          {application.candidate.firstName} {application.candidate.lastName}
                        </h2>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badge.tone}`}>
                          {badge.label}
                        </span>
                        {application.candidate.isVerified ? (
                          <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                            <IconVerified />
                            Identité vérifiée
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                            <IconWarning />
                            Identité non vérifiée
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        {application.candidate.email}
                        {application.candidate.phone && ` · ${application.candidate.phone}`}
                      </p>
                    </div>

                    <p className="shrink-0 text-sm text-slate-400">
                      Déposée le {new Date(application.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>

                  <dl className="mt-5 grid gap-4 sm:grid-cols-3">
                    <div>
                      <dt className="text-xs text-slate-400">Zones</dt>
                      <dd className="mt-0.5 text-sm font-medium text-slate-900">
                        {application.zones.join(', ')}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-slate-400">Expérience</dt>
                      <dd className="mt-0.5 text-sm font-medium text-slate-900">
                        {application.experienceYears} an(s)
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-4 rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">Activité déclarée</p>
                    <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-700">
                      {application.motivation}
                    </p>
                  </div>

                  {application.rejectionReason && (
                    <p className="mt-3 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                      <span className="font-semibold">Motif enregistré : </span>
                      {application.rejectionReason}
                    </p>
                  )}

                  {!application.candidate.isVerified && application.status === 'pending' && (
                    <p className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                      <IconWarning className="mt-0.5 shrink-0" />
                      <span>
                        L'identité de ce candidat n'a pas encore été validée. Traitez d'abord son
                        dossier dans <strong>Vérifications</strong> : approuver ici lui donnerait un
                        badge « vérifié » sans contrôle réel.
                      </span>
                    </p>
                  )}

                  <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                    {application.status !== 'approved' && (
                      <button
                        type="button"
                        onClick={() => approve(application)}
                        disabled={busy}
                        className="flex h-11 items-center gap-2 rounded-lg bg-green-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                      >
                        <IconCheck />
                        Approuver
                      </button>
                    )}

                    {application.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => {
                          setDecision({ application, status: 'rejected' });
                          setReason('');
                        }}
                        disabled={busy}
                        className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                      >
                        <IconClose />
                        Refuser
                      </button>
                    )}

                    {application.status === 'approved' && (
                      <button
                        type="button"
                        onClick={() => {
                          setDecision({ application, status: 'suspended' });
                          setReason('');
                        }}
                        disabled={busy}
                        className="flex h-11 items-center gap-2 rounded-lg border border-red-200 px-5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                      >
                        <IconPause />
                        Suspendre le badge
                      </button>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>

      {/* ---------- Motif obligatoire pour un refus ou une suspension ---------- */}
      {decision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setDecision(null)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900">
              {decision.status === 'rejected' ? 'Refuser la candidature' : 'Suspendre le badge'}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
              Ce motif sera envoyé à {decision.application.candidate.firstName} dans sa
              notification. Soyez explicite : c'est ce qui lui permettra de corriger.
            </p>

            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              autoFocus
              placeholder={
                decision.status === 'rejected'
                  ? "Ex. : les zones d'intervention ne correspondent pas aux villes couvertes."
                  : 'Ex. : plusieurs signalements pour des biens déjà loués.'
              }
              className="mt-4 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
            />
            <p className="mt-1.5 text-xs text-slate-400">
              {reason.trim().length} / 10 caractères minimum
            </p>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setDecision(null)}
                className="h-11 flex-1 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmDecision}
                disabled={reason.trim().length < 10 || busyId === decision.application.id}
                className="h-11 flex-[2] rounded-lg bg-red-600 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {decision.status === 'rejected' ? 'Confirmer le refus' : 'Confirmer la suspension'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
