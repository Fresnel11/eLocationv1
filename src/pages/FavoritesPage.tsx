import React, { useState, useEffect } from 'react';
import { Heart, MapPin, Calendar, Trash2, Filter, Search, TrendingDown, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

interface Favorite {
  id: string;
  createdAt: string;
  ad: {
    id: string;
    title: string;
    price: number;
    location: string;
    photos: string[];
    user: {
      firstName: string;
      lastName: string;
    };
    category: {
      name: string;
    };
  };
}

export const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<Favorite[]>([]);
  const [priceAlerts, setPriceAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterCategory, setFilterCategory] = useState('');
  const { success, error } = useToast();

  useEffect(() => {
    loadFavorites();
    loadPriceAlerts();
  }, []);

  useEffect(() => {
    filterAndSortFavorites();
  }, [favorites, searchTerm, sortBy, filterCategory]);

  const loadFavorites = async () => {
    try {
      const response = await api.get('/favorites');
      setFavorites(response.data);
    } catch (err) {
      error('Erreur', 'Impossible de charger les favoris');
    } finally {
      setLoading(false);
    }
  };

  const loadPriceAlerts = async () => {
    try {
      const response = await api.get('/price-alerts');
      setPriceAlerts(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des alertes de prix:', err);
    }
  };

  const filterAndSortFavorites = () => {
    let filtered = [...favorites];

    if (searchTerm) {
      filtered = filtered.filter(fav => 
        fav.ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fav.ad.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory) {
      filtered = filtered.filter(fav => fav.ad.category.name === filterCategory);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.ad.price - b.ad.price;
        case 'price-desc':
          return b.ad.price - a.ad.price;
        case 'title':
          return a.ad.title.localeCompare(b.ad.title);
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    setFilteredFavorites(filtered);
  };

  const getPriceAlert = (adId: string) => {
    return priceAlerts.find(alert => alert.ad.id === adId && !alert.isRead);
  };

  const categories = [...new Set(favorites.map(fav => fav.ad.category.name))];

  const removeFavorite = async (adId: string) => {
    try {
      await api.delete(`/favorites/${adId}`);
      setFavorites(prev => prev.filter(fav => fav.ad.id !== adId));
      success('Supprimé', 'Annonce supprimée des favoris');
    } catch (err) {
      error('Erreur', 'Impossible de supprimer le favori');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des favoris...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Heart className="h-8 w-8 text-red-600 mr-3" />
            Mes favoris
          </h1>
          <p className="mt-2 text-gray-600">
            {favorites.length} annonce{favorites.length > 1 ? 's' : ''} sauvegardée{favorites.length > 1 ? 's' : ''}
            {priceAlerts.filter(alert => !alert.isRead).length > 0 && (
              <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                {priceAlerts.filter(alert => !alert.isRead).length} alerte{priceAlerts.filter(alert => !alert.isRead).length > 1 ? 's' : ''} de prix
              </span>
            )}
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Aucun favori</h2>
            <p className="text-gray-600 mb-6">
              Vous n'avez pas encore ajouté d'annonces à vos favoris
            </p>
            <Link to="/ads">
              <Button>Découvrir des annonces</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={favorite.ad.photos[0] || '/placeholder-image.jpg'}
                    alt={favorite.ad.title}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => removeFavorite(favorite.ad.id)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-blue-600 font-medium">
                      {favorite.ad.category.name}
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {favorite.ad.price.toLocaleString()} FCFA
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {favorite.ad.title}
                  </h3>

                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{favorite.ad.location}</span>
                  </div>

                  <div className="flex items-center text-gray-500 mb-4">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span className="text-sm">
                      Ajouté le {new Date(favorite.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Par {favorite.ad.user.firstName} {favorite.ad.user.lastName}
                    </span>
                    <Link to={`/ads`}>
                      <Button size="sm">Voir l'annonce</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};