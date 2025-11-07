import React, { useEffect, useState } from 'react';
import { ArrowLeft, Download, Trash2, Wifi } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOffline } from '../hooks/useOffline';
import { Ad } from '../types/ad';
import AdCard from '../components/AdCard';

const OfflineAdsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isOnline, savedAds, offlineAds, removeSavedAd } = useOffline();
  const [filteredAds, setFilteredAds] = useState<Ad[]>([]);

  useEffect(() => {
    // Filtrer les annonces hors ligne pour ne montrer que celles sauvegardées
    const filtered = offlineAds.filter(ad => savedAds.includes(ad.id));
    setFilteredAds(filtered);
  }, [offlineAds, savedAds]);

  const handleRemoveSaved = async (adId: string) => {
    await removeSavedAd(adId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                Annonces sauvegardées
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <Download className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {!isOnline && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-blue-700">
              <Download className="h-5 w-5" />
              <span className="text-sm">
                Mode hors ligne - Vous consultez vos annonces sauvegardées
              </span>
            </div>
          </div>
        )}

        {filteredAds.length === 0 ? (
          <div className="text-center py-12">
            <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune annonce sauvegardée
            </h3>
            <p className="text-gray-500 mb-4">
              Sauvegardez des annonces pour les consulter hors ligne
            </p>
            {isOnline && (
              <button
                onClick={() => navigate('/ads')}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Parcourir les annonces
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {filteredAds.length} annonce{filteredAds.length > 1 ? 's' : ''} sauvegardée{filteredAds.length > 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid gap-4">
              {filteredAds.map((ad) => (
                <div key={ad.id} className="relative">
                  <AdCard ad={ad} />
                  <button
                    onClick={() => handleRemoveSaved(ad.id)}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflineAdsPage;