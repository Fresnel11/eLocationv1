import React, { useState } from 'react';
import { MapPin, Navigation, Settings, X } from 'lucide-react';
import { Button } from './Button';
import { useGeolocation } from '../../hooks/useGeolocation';

interface LocationSelectorProps {
  onLocationChange: (location: { latitude: number; longitude: number; radius: number; isCity?: boolean } | null) => void;
  currentLocation: { latitude: number; longitude: number; radius: number; isCity?: boolean } | null;
}

const cities = [
  { name: 'Cotonou', lat: 6.3703, lng: 2.3912 },
  { name: 'Porto-Novo', lat: 6.4969, lng: 2.6283 },
  { name: 'Parakou', lat: 9.3372, lng: 2.6303 },
  { name: 'Abomey-Calavi', lat: 6.4489, lng: 2.3556 },
  { name: 'Bohicon', lat: 7.1781, lng: 2.0667 },
];

const radiusOptions = [
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 20, label: '20 km' },
  { value: 50, label: '50 km' },
  { value: 100, label: '100 km' },
];

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  onLocationChange,
  currentLocation,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState(currentLocation?.radius || 20);
  const { latitude, longitude, error, loading, requestLocation } = useGeolocation();

  const handleUseCurrentLocation = () => {
    if (latitude && longitude) {
      onLocationChange({ latitude, longitude, radius: selectedRadius });
      setShowModal(false);
    } else {
      requestLocation();
    }
  };

  // Appliquer automatiquement la géolocalisation dès qu'elle est obtenue
  React.useEffect(() => {
    if (latitude && longitude && loading === false && !error) {
      onLocationChange({ latitude, longitude, radius: selectedRadius });
      setShowModal(false);
    }
  }, [latitude, longitude, loading, error, selectedRadius, onLocationChange]);

  const handleCitySelect = (city: typeof cities[0]) => {
    onLocationChange({ latitude: city.lat, longitude: city.lng, radius: 200, isCity: true });
    setShowModal(false);
  };

  const handleClearLocation = () => {
    onLocationChange(null);
    setShowModal(false);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2"
      >
        <MapPin className="h-4 w-4" />
        {currentLocation 
          ? (currentLocation.isCity ? 'Ville sélectionnée' : `${currentLocation.radius} km autour`) 
          : 'Localisation'
        }
      </Button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b bg-gray-50 sm:bg-white">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Choisir la localisation</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Rayon - seulement pour géolocalisation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Rayon de recherche (pour géolocalisation)</label>
                <select
                  value={selectedRadius}
                  onChange={(e) => setSelectedRadius(Number(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                >
                  {radiusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  Le rayon ne s'applique qu'à votre position GPS
                </p>
              </div>

              {/* Position actuelle */}
              <div>
                <Button
                  onClick={handleUseCurrentLocation}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 text-base font-medium bg-blue-600 hover:bg-blue-700"
                >
                  <Navigation className="h-5 w-5" />
                  {loading ? 'Localisation...' : 'Utiliser ma position'}
                </Button>
                {error && (
                  <p className="text-red-500 text-sm mt-2 p-2 bg-red-50 rounded">{error}</p>
                )}
              </div>

              {/* Villes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Ou choisir une ville</label>
                <p className="text-xs text-gray-500 mb-3 p-2 bg-blue-50 rounded">
                  Affiche toutes les annonces de la ville sélectionnée
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {cities.map(city => (
                    <button
                      key={city.name}
                      onClick={() => handleCitySelect(city)}
                      className="w-full p-3 text-left hover:bg-blue-50 active:bg-blue-100 rounded-lg border border-gray-200 transition-colors text-base font-medium text-gray-700 hover:text-blue-600"
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={handleClearLocation}
                  className="flex-1 py-3 text-base font-medium"
                >
                  Supprimer filtre
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 text-base font-medium"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};