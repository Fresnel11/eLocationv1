import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin } from 'lucide-react';
import { recommendationsService } from '../services/recommendationsService';
import { Ad } from '../services/adsService';

interface RecommendedAdsProps {
  limit?: number;
  className?: string;
}

export const RecommendedAds: React.FC<RecommendedAdsProps> = ({ limit = 6, className = '' }) => {
  const [recommendations, setRecommendations] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const ads = await recommendationsService.getRecommendations(limit);
        setRecommendations(ads);
      } catch (error) {
        console.error('Erreur recommandations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [limit]);

  if (loading) {
    return (
      <div className={`${className}`}>
        <h3 className="text-lg font-semibold mb-4">Recommandé pour vous</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-48"></div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <div className={`${className}`}>
      <h3 className="text-lg font-semibold mb-4">Recommandé pour vous</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((ad) => (
          <div
            key={ad.id}
            className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/annonce/${ad.id}`)}
          >
            <div className="relative h-32">
              <img
                src={ad.photos && ad.photos.length > 0 
                  ? (ad.photos[0].startsWith('http') 
                      ? ad.photos[0] 
                      : `http://localhost:3000${ad.photos[0]}`
                    )
                  : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop'
                }
                alt={ad.title}
                className="w-full h-full object-cover rounded-t-lg"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop';
                }}
              />
              <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs">
                {parseInt(ad.price.toString()).toLocaleString()} FCFA
              </div>
            </div>
            <div className="p-3">
              <h4 className="font-medium text-sm mb-1 line-clamp-1">{ad.title}</h4>
              <div className="flex items-center text-gray-500 text-xs mb-2">
                <MapPin className="h-3 w-3 mr-1" />
                <span>{ad.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">{ad.category.name}</span>
                <div className="flex items-center text-xs text-gray-600">
                  <Star className="h-3 w-3 mr-1" />
                  <span>4.2</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};