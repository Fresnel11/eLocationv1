import React, { useMemo, useState } from 'react';
import IconCamera from '~icons/material-symbols/photo-camera-outline';
import IconUpload from '~icons/material-symbols/upload-file-outline';
import IconCheck from '~icons/material-symbols/check-circle-outline';
import IconArrowLeft from '~icons/line-md/arrow-left';
import { AuthSubmitButton } from '../auth/AuthSubmitButton';
import { CameraCapture } from './CameraCapture';
import type { DocumentType } from '../../services/demarcheursService';

/**
 * Compresse l'image avant envoi.
 *
 * Les photos partent en data URL dans le corps de la requête : une photo brute
 * de téléphone (3 à 6 Mo) ferait échouer l'envoi ou saturerait une connexion
 * mobile. 1200 px suffisent largement à lire une pièce d'identité.
 */
export const compressImage = (file: File, maxWidth = 1200, quality = 0.8): Promise<string> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = Math.min(maxWidth / image.width, maxWidth / image.height, 1);
      canvas.width = image.width * ratio;
      canvas.height = image.height * ratio;
      canvas.getContext('2d')!.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Image illisible'));
    };
    image.src = objectUrl;
  });

export interface IdentityDraft {
  documentType: DocumentType;
  /** Le type a été choisi explicitement : sinon on affiche l'écran de choix. */
  documentTypeChosen: boolean;
  documentFrontPhoto: string;
  documentBackPhoto: string;
  selfiePhoto: string;
}

type PhotoKey = 'documentFrontPhoto' | 'documentBackPhoto' | 'selfiePhoto';

interface CaptureScreen {
  key: PhotoKey;
  title: string;
  instruction: string;
  facingMode: 'user' | 'environment';
}

/**
 * Une photo par écran : l'utilisateur sait toujours ce qu'on lui demande, et
 * l'appareil photo peut être ouvert avec le bon capteur (arrière pour un
 * document, avant pour un selfie).
 */
const IdentityStepComponent: React.FC<{
  value: IdentityDraft;
  onChange: (patch: Partial<IdentityDraft>) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
}> = ({ value, onChange, onBack, onSubmit, submitting }) => {
  const [index, setIndex] = useState(0);
  const [cameraOpen, setCameraOpen] = useState(false);

  const isCni = value.documentType === 'cni';

  /** Le passeport n'a qu'une page d'identité : pas d'écran « verso ». */
  const screens = useMemo<CaptureScreen[]>(
    () => [
      {
        key: 'documentFrontPhoto',
        title: isCni ? 'Recto de la carte' : "Page d'identité du passeport",
        instruction: isCni
          ? 'Posez la carte à plat, bien éclairée. Votre photo et votre nom doivent être lisibles.'
          : 'Ouvrez le passeport à la page qui porte votre photo.',
        facingMode: 'environment',
      },
      ...(isCni
        ? [
            {
              key: 'documentBackPhoto' as const,
              title: 'Verso de la carte',
              instruction: 'Retournez la carte et cadrez toute la surface.',
              facingMode: 'environment' as const,
            },
          ]
        : []),
      {
        key: 'selfiePhoto',
        title: 'Photo de votre visage',
        instruction:
          'Regardez l\'objectif, sans lunettes de soleil ni couvre-chef. Elle sert à vérifier que vous êtes bien la personne du document.',
        facingMode: 'user',
      },
    ],
    [isCni],
  );

  // ---------------------- Écran 0 : choix de la pièce ----------------------
  if (index === 0 && !value.documentTypeChosen) {
    return (
      <div className="space-y-5">
        <div>
          <h3 className="font-semibold text-slate-900">Quelle pièce allez-vous présenter ?</h3>
          <p className="mt-1 text-sm text-slate-500">
            Seules la carte d'identité et le passeport sont acceptés.
          </p>
        </div>

        <div className="grid gap-3">
          {(
            [
              { value: 'cni' as const, label: "Carte nationale d'identité", detail: 'Recto et verso' },
              { value: 'passport' as const, label: 'Passeport', detail: "Page d'identité" },
            ]
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ documentType: option.value, documentTypeChosen: true })}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 px-5 py-4 text-left transition-colors hover:border-blue-400 hover:bg-white"
            >
              <span>
                <span className="block font-semibold text-slate-900">{option.label}</span>
                <span className="text-sm text-slate-400">{option.detail}</span>
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <IconArrowLeft />
          Revenir aux informations
        </button>
      </div>
    );
  }

  const screen = screens[index];
  const captured = value[screen.key];
  const isLast = index === screens.length - 1;

  const goBack = () => {
    if (index === 0) onBack();
    else setIndex((i) => i - 1);
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-slate-400">
          Pièce {index + 1} sur {screens.length}
        </p>
        <h3 className="mt-0.5 font-semibold text-slate-900">{screen.title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">{screen.instruction}</p>
      </div>

      {captured ? (
        <div className="overflow-hidden rounded-2xl border-2 border-green-300 bg-green-50/60 p-3">
          <img src={captured} alt="" className="mx-auto max-h-52 rounded-xl object-contain" />
          <p className="mt-3 flex items-center justify-center gap-1.5 text-sm font-medium text-green-700">
            <IconCheck />
            Photo enregistrée
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 py-10 text-center">
          <IconCamera className="mx-auto text-[2rem] text-slate-300" />
          <p className="mt-2 text-sm text-slate-400">Aucune photo pour le moment</p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setCameraOpen(true)}
          className="flex h-12 items-center justify-center gap-2 rounded-full bg-slate-900 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
        >
          <IconCamera />
          {captured ? 'Reprendre la photo' : 'Prendre une photo'}
        </button>

        <label
          htmlFor={`file-${screen.key}`}
          className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          <IconUpload />
          Importer un fichier
        </label>
        <input
          id={`file-${screen.key}`}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (file) onChange({ [screen.key]: await compressImage(file) } as Partial<IdentityDraft>);
            event.target.value = '';
          }}
        />
      </div>

      <div className="flex gap-3 border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={goBack}
          className="h-12 flex-1 rounded-full border border-slate-200 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          Retour
        </button>

        {isLast ? (
          <AuthSubmitButton
            type="button"
            onClick={onSubmit}
            disabled={!captured}
            loading={submitting}
            loadingLabel="Envoi..."
            className="flex-[2] rounded-full"
          >
            Envoyer ma candidature
          </AuthSubmitButton>
        ) : (
          <button
            type="button"
            onClick={() => setIndex((i) => i + 1)}
            disabled={!captured}
            className="h-12 flex-[2] rounded-full bg-blue-600 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
          >
            Continuer
          </button>
        )}
      </div>

      <p className="text-center text-xs leading-relaxed text-slate-400">
        Vos documents servent uniquement à établir votre identité. Ils ne sont jamais
        affichés publiquement ni transmis à des tiers.
      </p>

      {cameraOpen && (
        <CameraCapture
          facingMode={screen.facingMode}
          title={screen.title}
          hint={screen.instruction}
          onCapture={(dataUrl) => onChange({ [screen.key]: dataUrl } as Partial<IdentityDraft>)}
          onClose={() => setCameraOpen(false)}
        />
      )}
    </div>
  );
};

export const IdentityStep = IdentityStepComponent;
