import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { FaWhatsapp, FaFacebook, FaFacebookMessenger, FaTelegram, FaEnvelope, FaLinkedin } from 'react-icons/fa';

interface ShareProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileUrl: string;
  userName: string;
}

export const ShareProfileModal: React.FC<ShareProfileModalProps> = ({
  isOpen,
  onClose,
  profileUrl,
  userName
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  const shareText = `Découvrez le profil de ${userName} sur eLocation Bénin`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(profileUrl);

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      color: 'bg-green-500',
      url: `https://wa.me/?text=${encodedText}%20${encodedUrl}`
    },
    {
      name: 'Facebook',
      icon: FaFacebook,
      color: 'bg-blue-600',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    },
    {
      name: 'Messenger',
      icon: FaFacebookMessenger,
      color: 'bg-blue-500',
      url: `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=YOUR_APP_ID`
    },
    {
      name: 'Gmail',
      icon: FaEnvelope,
      color: 'bg-red-500',
      url: `mailto:?subject=${encodeURIComponent(`Profil de ${userName}`)}&body=${encodedText}%20${encodedUrl}`
    },
    {
      name: 'Telegram',
      icon: FaTelegram,
      color: 'bg-blue-400',
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
    },
    {
      name: 'LinkedIn',
      icon: FaLinkedin,
      color: 'bg-blue-700',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-sm w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Partager le profil</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            Partagez le profil de {userName}
          </p>

          {/* Lien à copier */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lien du profil
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={profileUrl}
                readOnly
                className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              />
              <button
                onClick={handleCopyLink}
                className={`p-3 rounded-lg transition-colors ${
                  copied ? 'bg-green-100 text-green-600' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            {copied && (
              <p className="text-sm text-green-600 mt-1">Lien copié !</p>
            )}
          </div>

          {/* Options de partage */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">
              Partager via
            </p>
            <div className="grid grid-cols-3 gap-3">
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={() => window.open(option.url, '_blank')}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-12 h-12 ${option.color} rounded-full flex items-center justify-center text-white`}>
                    <option.icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs text-gray-600">{option.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};