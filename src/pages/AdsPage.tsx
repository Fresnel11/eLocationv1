import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Filter, MapPin, Calendar, Users, Bed, Bath, Car, Wifi, Tv, AirVent, Utensils, ChevronDown, Grid, List, Heart, Star, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { AdModal } from '../components/ui/AdModal';
import { CreateAdButton } from '../components/ui/CreateAdButton';
import { AdCardSkeletonGrid } from '../components/ui/AdCardSkeleton';
import { LocationSelector } from '../components/ui/LocationSelector';
import { PriceRangeSlider } from '../components/ui/PriceRangeSlider';
import { MobileSearchFilter } from '../components/ui/MobileSearchFilter';
import { FavoriteButton } from '../components/ui/FavoriteButton';
import { AddReviewModal } from '../components/ui/AddReviewModal';
import { adsService, Ad } from '../services/adsService';
import { LocationService } from '../services/locationService';
import { recommendationsService } from '../services/recommendationsService';
import { RecommendedAds } from '../components/RecommendedAds';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface AdWithUI extends Ad {
  averageRating?: number;
  reviewsCount?: number;
  imageLoading?: boolean;
}



const amenityIcons = {
  wifi: Wifi,
  tv: Tv,
  ac: AirVent,
  kitchen: Utensils,
  parking: Car
};

export const AdsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ads, setAds] = useState<AdWithUI[]>([]);
  const [filteredAds, setFilteredAds] = useState<AdWithUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoadingStates, setImageLoadingStates] = useState<{[key: string]: boolean}>({});

  const [selectedAd, setSelectedAd] = useState<AdWithUI | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewModalAd, setReviewModalAd] = useState<AdWithUI | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [totalAds, setTotalAds] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userLocation, setUserLocation] = useState<{latitude: number; longitude: number; radius: number; isCity?: boolean} | null>(null);
  const [userCity, setUserCity] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [priceFilterActive, setPriceFilterActive] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    categoryId: '',
    bedrooms: '',
    bathrooms: '',
    amenities: [] as string[]
  });

  const locations = ['Cotonou', 'Calavi', 'Abomey-Calavi', 'Porto-Novo', 'Parakou'];
  const [categories, setCategories] = useState<{value: string, label: string}[]>([]);
  const amenitiesList = [
    { value: 'wifi', label: 'WiFi' },
    { value: 'tv', label: 'Télévision' },
    { value: 'ac', label: 'Climatisation' },
    { value: 'kitchen', label: 'Cuisine équipée' },
    { value: 'parking', label: 'Parking' }
  ];

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.map((cat: any) => ({ value: cat.id, label: cat.name })));
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  }, []);

  const fetchAds = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      
      const response = await adsService.getAds(page, 12, userLocation || undefined, userCity || undefined);
      const adsArray = response.ads || [];
      
      // Précharger la page suivante en arrière-plan
      if (page === 1 && response.pagination.pages > 1) {
        setTimeout(() => {
          adsService.getAds(2, 12, userLocation || undefined, userCity || undefined)
            .catch(() => {}); // Ignorer les erreurs de préchargement
        }, 1000);
      }
      
      // Récupérer les ratings pour chaque annonce
      const adsWithRatings = await Promise.all(
        adsArray.map(async (ad) => {
          try {
            const ratingResponse = await api.get(`/reviews/ad/${ad.id}/rating`);
            return {
              ...ad,
              averageRating: ratingResponse.data.averageRating,
              reviewsCount: ratingResponse.data.totalReviews,
              imageLoading: true
            };
          } catch (error) {
            return {
              ...ad,
              averageRating: 0,
              reviewsCount: 0,
              imageLoading: true
            };
          }
        })
      );
      
      setAds(adsWithRatings);
      setTotalAds(response.pagination.total);
      setTotalPages(response.pagination.pages);
      setCurrentPage(page);
      
      // Initialiser les états de chargement des images
      const initialLoadingStates: {[key: string]: boolean} = {};
      adsWithRatings.forEach(ad => {
        initialLoadingStates[ad.id] = true;
      });
      setImageLoadingStates(initialLoadingStates);
    } catch (error) {
      console.error('Erreur lors du chargement des annonces:', error);
    } finally {
      setLoading(false);
    }
  }, [userLocation, userCity]);



  useEffect(() => {
    fetchCategories();
    fetchAds();
    
    // Détecter la ville de l'utilisateur au chargement
    LocationService.detectUserCity().then(city => {
      if (city) {
        setUserCity(city);
      }
    });
  }, [fetchCategories, fetchAds]);

  useEffect(() => {
    let filtered = [...ads];

    // Filtre par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(ad => 
        ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par prix
    if (priceFilterActive) {
      filtered = filtered.filter(ad => {
        const price = parseInt(ad.price.toString());
        return price >= priceRange[0] && price <= priceRange[1];
      });
    }

    // Filtre par localisation
    if (filters.location) {
      filtered = filtered.filter(ad => 
        ad.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Filtre par catégorie
    if (filters.categoryId) {
      filtered = filtered.filter(ad => ad.category.id === filters.categoryId);
    }

    // Filtre par chambres
    if (filters.bedrooms) {
      const minBedrooms = parseInt(filters.bedrooms);
      filtered = filtered.filter(ad => ad.bedrooms >= minBedrooms);
    }

    // Filtre par salles de bain
    if (filters.bathrooms) {
      const minBathrooms = parseInt(filters.bathrooms);
      filtered = filtered.filter(ad => ad.bathrooms >= minBathrooms);
    }

    // Filtre par équipements
    if (filters.amenities.length > 0) {
      filtered = filtered.filter(ad => 
        filters.amenities.every(amenity => ad.amenities.includes(amenity))
      );
    }

    setFilteredAds(filtered);
  }, [ads, searchTerm, priceRange, priceFilterActive, filters]);

  const handleFilterChange = (key: string, value: string | string[]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleAmenity = (amenity: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };



  const handleImageLoad = (adId: string) => {
    setImageLoadingStates(prev => ({ ...prev, [adId]: false }));
  };

  const handleImageError = (adId: string) => {
    setImageLoadingStates(prev => ({ ...prev, [adId]: false }));
  };

  const openModal = (ad: AdWithUI) => {
    setSelectedAd(ad);
    setIsModalOpen(true);
    
    // Tracker la vue
    recommendationsService.trackView(ad.id, ad.category.id, ad.location, ad.price);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAd(null);
  };

  const openReviewModal = (ad: AdWithUI) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setReviewModalAd(ad);
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setReviewModalAd(null);
  };

  const handleReviewAdded = () => {
    // Recharger les données des annonces pour mettre à jour les ratings
    fetchAds(currentPage);
  };

  const hasActiveFilters = () => {
    return priceFilterActive || filters.location || filters.categoryId || 
           filters.bedrooms || filters.bathrooms || filters.amenities.length > 0 || 
           searchTerm || userLocation;
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      categoryId: '',
      bedrooms: '',
      bathrooms: '',
      amenities: []
    });
    setPriceRange([0, 500000]);
    setPriceFilterActive(false);
    setSearchTerm('');
    setUserLocation(null);
    // Recharger les données
    setCurrentPage(1);
    fetchAds(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec recherche */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Rechercher par titre ou localisation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <LocationSelector
                onLocationChange={setUserLocation}
                currentLocation={userLocation}
              />
              

              
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtres
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
              
              <div className="hidden sm:flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar des filtres */}
          <div className="hidden lg:block lg:w-80">
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Filtres</h3>
                  {hasActiveFilters() && (
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 rounded-lg transition-all duration-200 hover:shadow-sm"
                    >
                      <X className="h-3.5 w-3.5" />
                      Effacer tout
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Prix */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Prix (FCFA)</label>
                    <PriceRangeSlider
                      min={0}
                      max={500000}
                      value={priceRange}
                      onChange={(value) => {
                        setPriceRange(value);
                        setPriceFilterActive(true);
                      }}
                    />
                  </div>

                  {/* Localisation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Localisation</label>
                    <select
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Toutes les villes</option>
                      {locations.map(location => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                  </div>

                  {/* Catégorie */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Catégorie</label>
                    <select
                      value={filters.categoryId}
                      onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Toutes les catégories</option>
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>{category.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Chambres */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Chambres minimum</label>
                    <select
                      value={filters.bedrooms}
                      onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Peu importe</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                    </select>
                  </div>

                  {/* Salles de bain */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Salles de bain minimum</label>
                    <select
                      value={filters.bathrooms}
                      onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Peu importe</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                    </select>
                  </div>

                  {/* Équipements */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Équipements</label>
                    <div className="space-y-2">
                      {amenitiesList.map(amenity => (
                        <label key={amenity.value} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.amenities.includes(amenity.value)}
                            onChange={() => toggleAmenity(amenity.value)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{amenity.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Liste des annonces */}
          <div className="flex-1">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-gray-600">
                  {filteredAds.length} sur {totalAds} annonce{totalAds > 1 ? 's' : ''}
                  {filteredAds.length !== ads.length && (
                    <span className="text-blue-600 ml-1">(filtrées)</span>
                  )}
                </p>
                {userLocation && (
                  <p className="text-sm text-blue-600">
                    📍 {userLocation.isCity 
                      ? 'Résultats pour la ville sélectionnée' 
                      : `Résultats dans un rayon de ${userLocation.radius} km`
                    }
                  </p>
                )}
              </div>
              <CreateAdButton onSuccess={() => window.location.reload()} />
            </div>

            {loading ? (
              <AdCardSkeletonGrid count={6} />
            ) : (
              <>
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6' 
                  : 'space-y-4 sm:space-y-6'
                }>
                  {filteredAds.map((ad, index) => (
                <div 
                  key={ad.id} 
                  className="group cursor-pointer"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Mobile Design */}
                  <div 
                    className="sm:hidden relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-4 shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => navigate(`/annonce/${ad.id}`)}
                  >
                    {/* Image Section */}
                    <div className="relative h-56 mb-4 rounded-2xl overflow-hidden">
                      {imageLoadingStates[ad.id] && (
                        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center rounded-2xl">
                          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                        </div>
                      )}
                      <img
                        src={ad.photos[0] 
                          ? (ad.photos[0].startsWith('http') 
                              ? ad.photos[0] 
                              : `http://localhost:3000${ad.photos[0]}`
                            )
                          : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop'
                        }
                        alt={ad.title}
                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-2xl ${
                          imageLoadingStates[ad.id] ? 'opacity-0' : 'opacity-100'
                        }`}
                        onLoad={() => handleImageLoad(ad.id)}
                        onError={() => handleImageError(ad.id)}
                      />
                      
                      {/* Heart Button */}
                      <div className="absolute top-3 right-3">
                        <FavoriteButton 
                          adId={ad.id} 
                          className="w-10 h-10 bg-white/20 backdrop-blur-md hover:bg-white/30 shadow-lg border border-white/20" 
                        />
                      </div>
                      
                      {/* Price Badge */}
                      <div className="absolute bottom-3 left-3 bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
                        <span className="text-lg font-bold text-white">{parseInt(ad.price.toString()).toLocaleString()}</span>
                        <span className="text-sm text-white/80 ml-1">FCFA/mois</span>
                      </div>
                    </div>
                    
                    {/* Content Section with Glassmorphism */}
                    <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                      {/* Title */}
                      <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">
                        {ad.title}
                      </h3>
                      
                      {/* Location */}
                      <div className="flex items-center text-gray-700 mb-3">
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="text-sm font-medium truncate">{ad.location}</span>
                      </div>
                      
                      {/* Property Details */}
                      <div className="flex items-center gap-2 mb-4 flex-wrap">
                        {ad.bedrooms > 0 && (
                          <div className="flex items-center gap-1 bg-white/30 backdrop-blur-sm px-2 py-1 rounded-lg">
                            <Bed className="h-4 w-4 text-gray-700" />
                            <span className="text-sm font-medium text-gray-700">{ad.bedrooms}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 bg-white/30 backdrop-blur-sm px-2 py-1 rounded-lg">
                          <Bath className="h-4 w-4 text-gray-700" />
                          <span className="text-sm font-medium text-gray-700">{ad.bathrooms}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-white/30 backdrop-blur-sm px-2 py-1 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">{ad.area}m²</span>
                        </div>
                        <div className="flex items-center gap-1 bg-white/30 backdrop-blur-sm px-2 py-1 rounded-lg">
                          <Star className="h-4 w-4 text-gray-700" />
                          <span className="text-sm font-medium text-gray-700">
                            {ad.averageRating && ad.averageRating > 0 ? ad.averageRating.toFixed(1) : '0.0'}
                          </span>
                          <span className="text-xs text-gray-600">({ad.reviewsCount || 0})</span>
                        </div>
                      </div>
                      
                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{ad.user.firstName[0]}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-800">{ad.user.firstName}</span>
                        </div>
                        <div className="bg-blue-600 text-white px-4 py-2 rounded-full">
                          <span className="text-sm font-semibold">Voir</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Design (unchanged) */}
                  <Card 
                    className="hidden sm:block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer border border-gray-100 overflow-hidden"
                    onClick={() => navigate(`/annonce/${ad.id}`)}
                  >
                    {/* Image Section */}
                    <div className="relative h-48 overflow-hidden">
                      {imageLoadingStates[ad.id] && (
                        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                        </div>
                      )}
                      <img
                        src={ad.photos[0] 
                          ? (ad.photos[0].startsWith('http') 
                              ? ad.photos[0] 
                              : `http://localhost:3000${ad.photos[0]}`
                            )
                          : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop'
                        }
                        alt={ad.title}
                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                          imageLoadingStates[ad.id] ? 'opacity-0' : 'opacity-100'
                        }`}
                        onLoad={() => handleImageLoad(ad.id)}
                        onError={() => handleImageError(ad.id)}
                      />
                      
                      {/* Heart Button */}
                      <div className="absolute top-3 right-3">
                        <FavoriteButton 
                          adId={ad.id} 
                          className="w-8 h-8 bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm" 
                        />
                      </div>
                      
                      {/* Category Badge */}
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md">
                        <span className="text-xs font-medium text-gray-700">{ad.category.name}</span>
                      </div>
                      
                      {/* Price Badge */}
                      <div className="absolute bottom-3 left-3 bg-blue-600 text-white px-3 py-1.5 rounded-lg">
                        <span className="text-sm font-semibold">{parseInt(ad.price.toString()).toLocaleString()} FCFA</span>
                        <span className="text-xs opacity-90">/mois</span>
                      </div>
                    </div>
                    
                    {/* Content Section */}
                    <div className="p-4">
                      {/* Title */}
                      <h3 className="font-semibold text-gray-900 text-base mb-2 line-clamp-1">
                        {ad.title}
                      </h3>
                      
                      {/* Location */}
                      <div className="flex items-center text-gray-500 mb-3">
                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="text-sm truncate">{ad.location}</span>
                      </div>
                      
                      {/* Property Details */}
                      <div className="flex items-center gap-4 mb-3">
                        {ad.bedrooms > 0 && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Bed className="h-4 w-4" />
                            <span className="text-sm">{ad.bedrooms}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-gray-600">
                          <Bath className="h-4 w-4" />
                          <span className="text-sm">{ad.bathrooms}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <span className="text-sm">{ad.area}m²</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 ml-auto">
                          <Star className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium">
                            {ad.averageRating && ad.averageRating > 0 ? ad.averageRating.toFixed(1) : '0.0'}
                          </span>
                          <span className="text-xs text-gray-500">({ad.reviewsCount || 0})</span>
                        </div>
                      </div>
                      
                      {/* Amenities */}
                      <div className="flex items-center gap-1 mb-4">
                        {ad.amenities.slice(0, 3).map(amenity => {
                          const Icon = amenityIcons[amenity as keyof typeof amenityIcons];
                          return Icon ? (
                            <div key={amenity} className="w-7 h-7 bg-gray-50 rounded-md flex items-center justify-center">
                              <Icon className="h-3.5 w-3.5 text-gray-600" />
                            </div>
                          ) : null;
                        })}
                        {ad.amenities.length > 3 && (
                          <div className="w-7 h-7 bg-gray-50 rounded-md flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">+{ad.amenities.length - 3}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 -ml-3 border-t border-gray-100">
                        <div 
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded-lg transition-colors duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/user/${ad.user.id}`);
                          }}
                        >
                          <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">{ad.user.firstName[0]}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900 truncate max-w-[100px] hover:text-blue-600 transition-colors">
                              {ad.user.firstName}
                            </span>
                            <span className="text-xs text-gray-500">Propriétaire</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/annonce/${ad.id}`);
                            }}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-xs font-medium rounded-lg transition-colors duration-200"
                          >
                            Voir détails
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              openReviewModal(ad);
                            }}
                            className="px-3 py-2 text-xs font-medium rounded-lg transition-colors duration-200"
                          >
                            <Star className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => fetchAds(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Précédent
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} sur {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => fetchAds(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Suivant
                    </Button>
                  </div>
                )}

              </>
            )}

            {filteredAds.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {hasActiveFilters() ? 'Aucune annonce ne correspond aux filtres' : 'Aucune annonce trouvée'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {hasActiveFilters() 
                    ? 'Essayez de modifier vos critères de recherche' 
                    : 'Aucune annonce disponible pour le moment'
                  }
                </p>
                <div className="flex gap-2 justify-center">
                  {userLocation && (
                    <Button 
                      variant="outline" 
                      onClick={() => setUserLocation(null)}
                    >
                      Supprimer filtre localisation
                    </Button>
                  )}
                  <Button onClick={clearFilters}>Effacer tous les filtres</Button>
                </div>
                
                {/* Recommandations quand aucune annonce trouvée */}
                <div className="mt-8">
                  <RecommendedAds limit={6} />
                </div>
              </div>
            )}
            
            {/* Recommandations en bas de page */}
            {filteredAds.length > 0 && (
              <div className="mt-12">
                <RecommendedAds limit={6} />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <AdModal 
        ad={selectedAd}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
      
      {reviewModalAd && (
        <AddReviewModal
          isOpen={isReviewModalOpen}
          onClose={closeReviewModal}
          adId={reviewModalAd.id}
          adTitle={reviewModalAd.title}
          onReviewAdded={handleReviewAdded}
        />
      )}
      
      {/* Mobile Filter Bottom Sheet */}
      <MobileSearchFilter 
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onSearch={(filters) => {
          setFilters({
            location: filters.city,
            categoryId: filters.category,
            bedrooms: filters.bedrooms,
            bathrooms: filters.bathrooms,
            amenities: filters.amenities
          });
          setPriceRange([0, filters.priceRange[1]]);
          setPriceFilterActive(filters.priceRange[1] < 500000);
        }}
        categories={categories}
      />
    </div>
  );
};