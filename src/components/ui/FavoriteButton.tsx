import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface FavoriteButtonProps {
  adId: string;
  className?: string;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({ adId, className = '' }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      checkFavoriteStatus();
    }
  }, [adId, user]);

  const checkFavoriteStatus = async () => {
    if (!user) return;
    
    try {
      const response = await api.get(`/favorites/check/${adId}`);
      setIsFavorite(response.data.isFavorite);
    } catch (err) {
      console.error('Erreur lors de la vérification du favori:', err);
      setIsFavorite(false);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${adId}`);
        setIsFavorite(false);
        success('Supprimé', 'Annonce supprimée des favoris');
      } else {
        await api.post(`/favorites/${adId}`);
        setIsFavorite(true);
        success('Ajouté', 'Annonce ajoutée aux favoris');
      }
    } catch (err: any) {
      error('Erreur', err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  // Afficher le bouton même pour les utilisateurs non connectés

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`p-2 rounded-full transition-colors flex items-center justify-center ${
        isFavorite 
          ? 'bg-red-100 text-red-600 hover:bg-red-200' 
          : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white shadow-sm'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <Heart 
        className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} 
      />
    </button>
  );
};