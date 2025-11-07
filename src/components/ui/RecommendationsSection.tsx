import React, { useState, useEffect } from 'react';
import { Star, MapPin, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface Ad {
  id: string;
  title: string;
  price: number;
  location: string;
  photos: string[];
  category: {
    name: string;
  };
  user: {
    firstName: string;
    lastName: string;
  };
}

export const RecommendationsSection: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchRecommendations();
    }
  }, [isAuthenticated]);

  const fetchRecommendations = async () => {
    try {
      const response = await api.get('/social/recommendations?limit=6');
      setRecommendations(response.data);
    } catch (error) {
      console.error('Erreur chargement recommandations:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackView = async (adId: string) => {
    try {
      await api.post('/social/interaction', {
        adId,
        type: 'view'
      });
    } catch (error) {
      console.error('Erreur tracking vue:', error);
    }
  };

  if (!isAuthenticated || loading) {
    return null;
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Star className="h-5 w-5 text-yellow-500" />
        <h2 className="text-lg font-semibold text-gray-900">Recommandé pour vous</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((ad) => (
          <Link
            key={ad.id}
            to={`/annonce/${ad.id}`}
            onClick={() => trackView(ad.id)}
            className="block bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="aspect-video bg-gray-200 relative">
              {ad.photos?.[0] ? (
                <img
                  src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/uploads/${ad.photos[0]}`}
                  alt={ad.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Eye className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs">
                {ad.category.name}
              </div>
            </div>
            
            <div className="p-3">
              <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
                {ad.title}
              </h3>
              <p className="text-lg font-bold text-blue-600 mb-1">
                {ad.price.toLocaleString()} FCFA
              </p>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-3 w-3 mr-1" />
                <span className="line-clamp-1">{ad.location}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};