import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { Button } from './Button';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  adId: string;
  adTitle: string;
  onReviewAdded: () => void;
}

export const AddReviewModal: React.FC<AddReviewModalProps> = ({
  isOpen,
  onClose,
  adId,
  adTitle,
  onReviewAdded
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      onClose();
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
            className={`h-8 w-8 transition-colors ${
              starValue <= (hoverRating || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 hover:text-yellow-300'
            }`}
          />
        </button>
      );
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Laisser un avis</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Donnez votre avis sur : <span className="font-medium">{adTitle}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Note */}
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

            {/* Commentaire */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commentaire *
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Partagez votre expérience avec cette annonce..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {comment.length}/500 caractères (minimum 10)
              </p>
            </div>

            {/* Boutons */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={loading || rating === 0 || comment.trim().length < 10}
              >
                {loading ? 'Envoi...' : 'Publier l\'avis'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};