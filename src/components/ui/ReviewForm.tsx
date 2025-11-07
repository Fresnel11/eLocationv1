import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { Button } from './Button';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface ReviewFormProps {
  adId: string;
  onReviewAdded: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ adId, onReviewAdded }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      error('Connexion requise', 'Veuillez vous connecter pour laisser un avis');
      return;
    }

    if (rating === 0) {
      error('Erreur', 'Veuillez donner une note');
      return;
    }

    if (comment.trim().length < 10) {
      error('Erreur', 'Le commentaire doit contenir au moins 10 caractères');
      return;
    }

    setLoading(true);
    try {
      await api.post('/reviews', {
        adId,
        rating,
        comment: comment.trim()
      });
      
      success('Avis ajouté', 'Votre avis a été soumis et sera publié après modération');
      setRating(0);
      setComment('');
      onReviewAdded();
    } catch (err: any) {
      error('Erreur', err.response?.data?.message || 'Impossible d\'ajouter l\'avis');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => {
      const starValue = i + 1;
      return (
        <button
          key={i}
          type="button"
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoverRating(starValue)}
          onMouseLeave={() => setHoverRating(0)}
          className="focus:outline-none"
        >
          <Star
            className={`h-6 w-6 transition-colors ${
              starValue <= (hoverRating || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 hover:text-yellow-300'
            }`}
          />
        </button>
      );
    });
  };

  if (!user) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg text-center">
        <p className="text-gray-600">Connectez-vous pour laisser un avis</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h4 className="font-medium text-gray-900 mb-4">Laisser un avis</h4>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Note *
          </label>
          <div className="flex gap-1">
            {renderStars()}
          </div>
          {rating > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {rating} étoile{rating > 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Commentaire *
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Partagez votre expérience..."
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {comment.length}/500 caractères (minimum 10)
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading || rating === 0 || comment.trim().length < 10}
          className="w-full"
        >
          <Send className="h-4 w-4 mr-2" />
          {loading ? 'Envoi...' : 'Publier l\'avis'}
        </Button>
      </form>
    </div>
  );
};