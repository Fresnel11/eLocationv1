import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useOffline } from '../hooks/useOffline';

const OfflineIndicator: React.FC = () => {
  const { isOnline } = useOffline();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-500 text-white px-4 py-2 text-center text-sm z-50">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="h-4 w-4" />
        Mode hors ligne - Consultation des annonces sauvegardées uniquement
      </div>
    </div>
  );
};

export default OfflineIndicator;