import React, { useState, useEffect } from 'react';
import { Star, Award, TrendingUp } from 'lucide-react';
import { api } from '../../services/api';

interface UserReputationProps {
  userId: string;
  showDetails?: boolean;
}

interface ReputationData {
  averageRating: number;
  totalReviews: number;
  reputationLevel: string;
  reputationScore: number;
}

export const UserReputation: React.FC<UserReputationProps> = ({ 
  userId, 
  showDetails = false 
}) => {
  const [reputation, setReputation] = useState<ReputationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReputation();
  }, [userId]);

  const fetchReputation = async () => {
    try {
      const response = await api.get(`/users/${userId}/reputation`);
      setReputation(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement de la réputation:', err);
      // Données par défaut si l'endpoint n'existe pas encore
      setReputation({
        averageRating: 0,
        totalReviews: 0,
        reputationLevel: 'Nouveau',
        reputationScore: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const getReputationColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'très bon': return 'text-blue-600 bg-blue-100';
      case 'bon': return 'text-yellow-600 bg-yellow-100';
      case 'moyen': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-24"></div>
      </div>
    );
  }

  if (!reputation) return null;

  if (!showDetails) {
    // Version compacte
    return (
      <div className="flex items-center gap-2">
        {reputation.totalReviews > 0 ? (
          <>
            <div className="flex">
              {renderStars(Math.round(reputation.averageRating))}
            </div>
            <span className="text-sm text-gray-600">
              {reputation.averageRating.toFixed(1)} ({reputation.totalReviews})
            </span>
          </>
        ) : (
          <span className="text-sm text-gray-500">Pas d'avis</span>
        )}
      </div>
    );
  }

  // Version détaillée
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-4">
        <Award className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Réputation</h3>
      </div>

      <div className="space-y-4">
        {/* Note moyenne */}
        {reputation.totalReviews > 0 ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex">
                  {renderStars(Math.round(reputation.averageRating))}
                </div>
                <span className="text-xl font-bold text-gray-900">
                  {reputation.averageRating.toFixed(1)}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Basé sur {reputation.totalReviews} avis
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Aucun avis pour le moment</p>
        )}

        {/* Niveau de réputation */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Niveau :</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getReputationColor(reputation.reputationLevel)}`}>
            {reputation.reputationLevel}
          </span>
        </div>

        {/* Score de réputation */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Score :</span>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="font-medium text-gray-900">
              {reputation.reputationScore}/100
            </span>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${reputation.reputationScore}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};