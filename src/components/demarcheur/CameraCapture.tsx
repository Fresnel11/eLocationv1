import React, { useCallback, useEffect, useRef, useState } from 'react';
import IconClose from '~icons/line-md/close';
import IconAlert from '~icons/material-symbols/error-outline';

type FacingMode = 'user' | 'environment';

interface CameraCaptureProps {
  /** « environment » pour un document, « user » pour un selfie. */
  facingMode: FacingMode;
  title: string;
  hint?: string;
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}

/** Largeur maximale de la photo produite : suffisant pour lire une pièce. */
const MAX_WIDTH = 1200;

/**
 * Prise de vue directement dans la page, via l'appareil photo de l'appareil.
 *
 * getUserMedia exige un contexte sécurisé : la caméra ne s'ouvre qu'en HTTPS ou
 * sur localhost. Testée depuis un téléphone sur l'IP locale en HTTP, elle sera
 * refusée par le navigateur — d'où le repli sur l'import de fichier, toujours
 * proposé à côté.
 */
export const CameraCapture: React.FC<CameraCaptureProps> = ({
  facingMode,
  title,
  hint,
  onCapture,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [ready, setReady] = useState(false);
  const [shot, setShot] = useState<string>('');

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      if (!window.isSecureContext) {
        setError(
          "L'appareil photo n'est accessible qu'en connexion sécurisée (HTTPS). Importez un fichier à la place.",
        );
        return;
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Votre navigateur ne permet pas d'accéder à l'appareil photo.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 1920 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
        setReady(true);
      } catch (err) {
        const name = (err as DOMException)?.name;
        setError(
          name === 'NotAllowedError'
            ? "Vous avez refusé l'accès à l'appareil photo. Autorisez-le dans les réglages du navigateur, ou importez un fichier."
            : name === 'NotFoundError'
              ? "Aucun appareil photo détecté sur cet appareil."
              : "L'appareil photo n'a pas pu être ouvert.",
        );
      }
    };

    start();
    return () => {
      cancelled = true;
      stop();
    };
  }, [facingMode, stop]);

  // La caméra doit s'éteindre dès la photo prise, sans attendre la fermeture.
  const take = () => {
    const video = videoRef.current;
    if (!video) return;

    const ratio = Math.min(MAX_WIDTH / video.videoWidth, 1);
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth * ratio;
    canvas.height = video.videoHeight * ratio;

    const context = canvas.getContext('2d')!;
    // Le selfie est affiché en miroir : on le redresse pour l'enregistrement.
    if (facingMode === 'user') {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    setShot(canvas.toDataURL('image/jpeg', 0.85));
    stop();
    setReady(false);
  };

  const confirm = () => {
    onCapture(shot);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-slate-900">
      <div className="flex items-center justify-between px-5 py-4 text-white">
        <div className="min-w-0">
          <p className="truncate font-semibold">{title}</p>
          {hint && <p className="truncate text-sm text-white/60">{hint}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer l'appareil photo"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[1.35rem] text-white/80 transition-colors hover:bg-white/10"
        >
          <IconClose />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {error ? (
          <div className="max-w-sm px-6 text-center text-white">
            <IconAlert className="mx-auto mb-3 text-[2rem] text-amber-400" />
            <p className="leading-relaxed text-white/80">{error}</p>
          </div>
        ) : shot ? (
          <img src={shot} alt="Photo prise" className="max-h-full max-w-full object-contain" />
        ) : (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              className={`h-full w-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />
            {/* Cadre de visée : aide à cadrer le document sans le rogner. */}
            {facingMode === 'environment' && (
              <span className="pointer-events-none absolute inset-x-6 top-1/2 aspect-[1.586/1] -translate-y-1/2 rounded-2xl border-2 border-dashed border-white/70" />
            )}
          </>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 px-5 py-6">
        {error ? (
          <button
            type="button"
            onClick={onClose}
            className="h-12 rounded-full bg-white px-8 text-sm font-semibold text-slate-900"
          >
            Fermer
          </button>
        ) : shot ? (
          <>
            <button
              type="button"
              onClick={() => {
                setShot('');
                setReady(false);
                // Relance la caméra pour une nouvelle tentative.
                setError('');
                window.setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
                navigator.mediaDevices
                  ?.getUserMedia({ video: { facingMode }, audio: false })
                  .then((stream) => {
                    streamRef.current = stream;
                    if (videoRef.current) videoRef.current.srcObject = stream;
                    setReady(true);
                  })
                  .catch(() => setError("L'appareil photo n'a pas pu être rouvert."));
              }}
              className="h-12 rounded-full border border-white/30 px-8 text-sm font-semibold text-white"
            >
              Reprendre
            </button>
            <button
              type="button"
              onClick={confirm}
              className="h-12 rounded-full bg-blue-600 px-8 text-sm font-semibold text-white"
            >
              Utiliser cette photo
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={take}
            disabled={!ready}
            aria-label="Prendre la photo"
            className="h-16 w-16 rounded-full border-4 border-white bg-white/20 transition-transform active:scale-95 disabled:opacity-40"
          />
        )}
      </div>
    </div>
  );
};
