import React from 'react';
import { Download, Check } from 'lucide-react';
import { useOffline } from '../hooks/useOffline';

interface SaveForOfflineButtonProps {
  adId: string;
  className?: string;
  compact?: boolean;
}

const SaveForOfflineButton: React.FC<SaveForOfflineButtonProps> = ({ adId, className = '', compact = false }) => {
  const { savedAds, saveAdForOffline, removeSavedAd } = useOffline();
  const isSaved = savedAds.includes(adId);

  const handleToggle = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isSaved) {
      await removeSavedAd(adId);
    } else {
      await saveAdForOffline(adId);
    }
  };

  if (compact) {
    return (
      <button
        onClick={handleToggle}
        className={`p-2 rounded-full transition-colors shadow-md ${
          isSaved 
            ? 'bg-green-500 text-white hover:bg-green-600' 
            : 'bg-white text-gray-700 hover:bg-gray-50'
        } ${className}`}
      >
        {isSaved ? (
          <Check className="h-4 w-4" />
        ) : (
          <Download className="h-4 w-4" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
        isSaved 
          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      } ${className}`}
    >
      {isSaved ? (
        <>
          <Check className="h-4 w-4" />
          <span className="text-sm">Sauvegardée</span>
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          <span className="text-sm">Sauvegarder</span>
        </>
      )}
    </button>
  );
};

export default SaveForOfflineButton;