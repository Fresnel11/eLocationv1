import React, { useState } from 'react';
import { X, Download, Copy, Loader2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileUrl: string;
  userName: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  profileUrl,
  userName
}) => {
  const { success, error } = useToast();
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!isOpen) return null;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(profileUrl)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      success('Lien copié !', 'Le lien du profil a été copié');
    } catch (err) {
      error('Erreur', 'Impossible de copier le lien');
    }
  };

  const handleDownloadQR = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-code-${userName}.png`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      error('Erreur', 'Impossible de télécharger le QR Code');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Code QR du profil</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="text-center">
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="relative mx-auto mb-4" style={{ width: 200, height: 200 }}>
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                </div>
              )}
              <img
                src={qrCodeUrl}
                alt="QR Code du profil"
                className={`mx-auto transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                width={200}
                height={200}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
              />
            </div>
            <p className="text-sm text-gray-600">
              Scannez ce code QR pour accéder au profil de <span className="font-semibold">{userName}</span>
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCopyLink}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
            >
              <Copy className="h-4 w-4" />
              Copier le lien
            </button>
            <button
              onClick={handleDownloadQR}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
            >
              <Download className="h-4 w-4" />
              Télécharger QR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};