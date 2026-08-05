import React, { useState } from 'react';
import { FaWhatsapp, FaFacebook, FaTelegram, FaEnvelope, FaLinkedin, FaXTwitter } from 'react-icons/fa6';
import IconClose from '~icons/line-md/close';
import IconCopy from '~icons/material-symbols/content-copy-outline';
import IconCheck from '~icons/material-symbols/check-circle-outline';
import IconShare from '~icons/material-symbols/ios-share';

interface ShareAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  adUrl: string;
  adTitle: string;
}

export const ShareAdModal: React.FC<ShareAdModalProps> = ({ isOpen, onClose, adUrl, adTitle }) => {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  if (!isOpen) return null;

  const shareText = `Découvrez cette annonce : ${adTitle} sur eLocation Bénin`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(adUrl);

  /**
   * Ces adresses sont les points d'entrée officiels de chaque service.
   * Sur mobile, le système les reconnaît et ouvre l'application installée ;
   * à défaut, elles s'ouvrent dans le navigateur. Aucun schéma propriétaire
   * du type « whatsapp:// » n'est nécessaire — il échouerait sur ordinateur.
   */
  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      color: 'bg-[#25D366]',
      url: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    },
    {
      name: 'Facebook',
      icon: FaFacebook,
      color: 'bg-[#1877F2]',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: 'Telegram',
      icon: FaTelegram,
      color: 'bg-[#229ED9]',
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    },
    {
      name: 'X',
      icon: FaXTwitter,
      color: 'bg-slate-900',
      url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
    {
      name: 'LinkedIn',
      icon: FaLinkedin,
      color: 'bg-[#0A66C2]',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: 'Email',
      icon: FaEnvelope,
      color: 'bg-slate-500',
      url: `mailto:?subject=${encodeURIComponent(adTitle)}&body=${encodedText}%20${encodedUrl}`,
    },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(adUrl);
      setCopied(true);
      setCopyFailed(false);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard exige un contexte sécurisé : on le dit au lieu d'échouer en silence.
      setCopyFailed(true);
    }
  };

  /** Feuille de partage du système : c'est elle qui propose les applications installées. */
  const nativeShare = async () => {
    try {
      await navigator.share({ title: adTitle, text: shareText, url: adUrl });
      onClose();
    } catch {
      // Partage annulé par l'utilisateur : rien à signaler.
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="w-full animate-slide-up rounded-t-[1.5rem] bg-white sm:max-w-md sm:rounded-[1.5rem]">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-lg font-bold text-slate-900">Partager l'annonce</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[1.3rem] text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <IconClose />
          </button>
        </div>

        <div className="p-5">
          {/* Proposé en premier quand le système sait le faire : c'est le chemin
              le plus court vers les applications réellement installées. */}
          {typeof navigator !== 'undefined' && !!navigator.share && (
            <button
              type="button"
              onClick={nativeShare}
              className="mb-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-blue-600 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(37,99,235,0.35)] transition-colors hover:bg-blue-700"
            >
              <IconShare />
              Partager avec mes applications
            </button>
          )}

          <label htmlFor="share-url" className="mb-2 block text-sm font-medium text-slate-700">
            Lien de l'annonce
          </label>
          <div className="flex items-center gap-2">
            <input
              id="share-url"
              type="text"
              value={adUrl}
              readOnly
              onFocus={(e) => e.currentTarget.select()}
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600"
            />
            <button
              type="button"
              onClick={copyLink}
              aria-label="Copier le lien"
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-[1.2rem] transition-colors ${
                copied ? 'bg-green-100 text-green-600' : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {copied ? <IconCheck /> : <IconCopy />}
            </button>
          </div>
          {copied && <p className="mt-2 text-sm text-green-600">Lien copié.</p>}
          {copyFailed && (
            <p className="mt-2 text-sm text-amber-600">
              Copie impossible depuis ce navigateur. Sélectionnez le lien ci-dessus.
            </p>
          )}

          <p className="mb-3 mt-6 text-sm font-medium text-slate-700">Ou partager via</p>
          <div className="grid grid-cols-3 gap-3">
            {shareOptions.map((option) => (
              <a
                key={option.name}
                href={option.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 rounded-xl p-3 transition-colors hover:bg-slate-50"
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-full text-white ${option.color}`}
                >
                  <option.icon className="h-6 w-6" />
                </span>
                <span className="text-xs text-slate-500">{option.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
