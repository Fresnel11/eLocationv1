import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { Button } from './Button';

interface MobileSearchFilterProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: SearchFilters) => void;
  categories: { value: string; label: string }[];
}

interface SearchFilters {
  category: string;
  rating: number;
  priceRange: [number, number];
  city: string;
  district: string;
  bedrooms: string;
  bathrooms: string;
  amenities: string[];
}

export const MobileSearchFilter: React.FC<MobileSearchFilterProps> = ({ isOpen, onClose, onSearch, categories }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRating, setSelectedRating] = useState(0);
  const [priceRange, setPriceRange] = useState<[number, number]>([20000, 300000]);
  const [priceFilterTouched, setPriceFilterTouched] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedBedrooms, setSelectedBedrooms] = useState('');
  const [selectedBathrooms, setSelectedBathrooms] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const categoryButtons = [
    { value: '', label: 'Tout' },
    ...categories.slice(0, 2)
  ];

  const cities = [
    'Cotonou', 'Calavi', 'Abomey-Calavi', 'Porto-Novo', 'Parakou'
  ];

  const districts = [
    'Akpakpa', 'Cadjehoun', 'Fidjrossè', 'Godomey', 'Agla', 'Dantokpa'
  ];

  const handleSearch = () => {
    onSearch({
      category: selectedCategory,
      rating: selectedRating,
      priceRange,
      city: selectedCity,
      district: selectedDistrict,
      bedrooms: selectedBedrooms,
      bathrooms: selectedBathrooms,
      amenities: selectedAmenities
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl transform transition-transform duration-300 ease-out flex flex-col" style={{ height: '60vh' }}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">Filtres</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        
        {/* Content - Scrollable */}
        <div className="px-6 flex-1 overflow-y-auto">
          <div className="space-y-3 pb-4">
            {/* Ville */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">Toutes les villes</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">Toutes les catégories</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
            </div>

            {/* Prix */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix max: {priceRange[1].toLocaleString()} FCFA
              </label>
              <input
                type="range"
                min="10000"
                max="500000"
                step="5000"
                value={priceRange[1]}
                onChange={(e) => {
                  setPriceRange([priceRange[0], parseInt(e.target.value)]);
                  setPriceFilterTouched(true);
                }}
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                  priceFilterTouched ? 'bg-blue-200' : 'bg-gray-200'
                }`}
                style={{
                  background: priceFilterTouched 
                    ? `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((priceRange[1] - 10000) / (500000 - 10000)) * 100}%, #e5e7eb ${((priceRange[1] - 10000) / (500000 - 10000)) * 100}%, #e5e7eb 100%)`
                    : '#e5e7eb'
                }}
              />
            </div>

            {/* Note minimum */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note minimum</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setSelectedRating(star === selectedRating ? 0 : star)}
                    className="p-1"
                  >
                    <Star
                      className={`h-5 w-5 ${
                        star <= selectedRating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Chambres et Salles de bain */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chambres min</label>
                <select 
                  value={selectedBedrooms}
                  onChange={(e) => setSelectedBedrooms(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Toutes</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SDB min</label>
                <select 
                  value={selectedBathrooms}
                  onChange={(e) => setSelectedBathrooms(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Toutes</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                </select>
              </div>
            </div>

            {/* Équipements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Équipements</label>
              <div className="grid grid-cols-3 gap-2">
                {['WiFi', 'Parking', 'Piscine', 'Climatisation', 'Sécurité', 'Jardin'].map((amenity) => (
                  <button
                    key={amenity}
                    onClick={() => {
                      setSelectedAmenities(prev => 
                        prev.includes(amenity) 
                          ? prev.filter(a => a !== amenity)
                          : [...prev, amenity]
                      );
                    }}
                    className={`p-2 text-xs border rounded-lg transition-colors ${
                      selectedAmenities.includes(amenity)
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer - Fixed at bottom */}
        <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0 bg-white">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCategory('');
                setSelectedRating(0);
                setPriceRange([20000, 300000]);
                setPriceFilterTouched(false);
                setSelectedCity('');
                setSelectedDistrict('');
                setSelectedBedrooms('');
                setSelectedBathrooms('');
                setSelectedAmenities([]);
              }}
              className="flex-1"
            >
              Effacer
            </Button>
            <Button
              onClick={handleSearch}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Appliquer
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};