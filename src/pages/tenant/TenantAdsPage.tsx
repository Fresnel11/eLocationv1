import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Home, Bed, Bath, Car, Heart, Eye } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent } from '../../components/ui/Card';

interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  hasParking: boolean;
  images: string[];
  category: {
    name: string;
  };
  user: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface Filters {
  search: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
  location: string;
  hasParking: boolean;
  minArea: string;
  maxArea: string;
}

export const TenantAdsPage: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: '',
    location: '',
    hasParking: false,
    minArea: '',
    maxArea: ''
  });

  useEffect(() => {
    // TODO: Fetch ads from API
    setLoading(false);
  }, [filters]);

  const handleFilterChange = (key: keyof Filters, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: '',
      location: '',
      hasParking: false,
      minArea: '',
      maxArea: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <div className="w-80 flex-shrink-0">
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold flex items-center">
                    <Filter className="h-5 w-5 mr-2" />
                    Filtres
                  </h2>
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Réinitialiser
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Recherche</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Titre, description..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Type de logement</label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Tous les types</option>
                      <option value="apartment">Appartement</option>
                      <option value="house">Maison</option>
                      <option value="studio">Studio</option>
                      <option value="villa">Villa</option>
                    </select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Localisation</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Ville, quartier..."
                        value={filters.location}
                        onChange={(e) => handleFilterChange('location', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Prix (FCFA)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Min"
                        type="number"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      />
                      <Input
                        placeholder="Max"
                        type="number"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Bedrooms */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Chambres</label>
                    <select
                      value={filters.bedrooms}
                      onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Toutes</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                    </select>
                  </div>

                  {/* Bathrooms */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Salles de bain</label>
                    <select
                      value={filters.bathrooms}
                      onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Toutes</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                    </select>
                  </div>

                  {/* Area */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Surface (m²)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Min"
                        type="number"
                        value={filters.minArea}
                        onChange={(e) => handleFilterChange('minArea', e.target.value)}
                      />
                      <Input
                        placeholder="Max"
                        type="number"
                        value={filters.maxArea}
                        onChange={(e) => handleFilterChange('maxArea', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Parking */}
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.hasParking}
                        onChange={(e) => handleFilterChange('hasParking', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium">Parking disponible</span>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Annonces disponibles</h1>
              <p className="text-gray-600">Trouvez votre logement idéal</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : ads.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune annonce trouvée</h3>
                  <p className="text-gray-600">Essayez de modifier vos critères de recherche</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ads.map((ad) => (
                  <Card key={ad.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="relative">
                      <img
                        src={ad.images[0] || '/placeholder-house.jpg'}
                        alt={ad.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                        <Heart className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg truncate">{ad.title}</h3>
                        <span className="text-blue-600 font-bold text-lg">
                          {ad.price.toLocaleString()} FCFA
                        </span>
                      </div>
                      
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{ad.location}</span>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Bed className="h-4 w-4 mr-1" />
                          <span>{ad.bedrooms}</span>
                        </div>
                        <div className="flex items-center">
                          <Bath className="h-4 w-4 mr-1" />
                          <span>{ad.bathrooms}</span>
                        </div>
                        <div className="flex items-center">
                          <Home className="h-4 w-4 mr-1" />
                          <span>{ad.area}m²</span>
                        </div>
                        {ad.hasParking && (
                          <div className="flex items-center">
                            <Car className="h-4 w-4 mr-1" />
                          </div>
                        )}
                      </div>

                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {ad.description}
                      </p>

                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          Par {ad.user.firstName} {ad.user.lastName}
                        </span>
                        <Button size="sm" className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          Voir détails
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};