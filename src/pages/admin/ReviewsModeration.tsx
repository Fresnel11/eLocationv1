import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, Check, X, User, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

interface Review {
  id: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  ad?: {
    id: string;
    title: string;
  } | null;
}

export const ReviewsModeration: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { success, error } = useToast();

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  const fetchPendingReviews = async () => {
    try {
      const response = await api.get('/admin/reviews/pending');
      setReviews(response.data);
    } catch (err) {
      error('Erreur', 'Impossible de charger les avis en attente');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: string) => {
    setActionLoading(reviewId);
    try {
      await api.post(`/admin/reviews/${reviewId}/approve`);
      setReviews(prev => prev.filter(review => review.id !== reviewId));
      success('Avis approuvé', 'L\'avis a été approuvé avec succès');
    } catch (err) {
      error('Erreur', 'Impossible d\'approuver l\'avis');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (reviewId: string) => {
    setActionLoading(reviewId);
    try {
      await api.post(`/admin/reviews/${reviewId}/reject`);
      setReviews(prev => prev.filter(review => review.id !== reviewId));
      success('Avis rejeté', 'L\'avis a été rejeté avec succès');
    } catch (err) {
      error('Erreur', 'Impossible de rejeter l\'avis');
    } finally {
      setActionLoading(null);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MessageSquare className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Modération des Avis</h1>
        <span className="bg-orange-100 text-orange-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
          {reviews.length} en attente
        </span>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun avis en attente</h3>
          <p className="text-gray-500">Tous les avis ont été modérés</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {review.user?.firstName || 'Utilisateur'} {review.user?.lastName || 'Inconnu'}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {renderStars(review.rating)}
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    {review.rating}/5
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Annonce concernée :</h4>
                <p className="text-gray-900">{review.ad?.title || 'Annonce supprimée'}</p>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Commentaire :</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-900 leading-relaxed">{review.comment}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => handleApprove(review.id)}
                  disabled={actionLoading === review.id}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {actionLoading === review.id ? 'Approbation...' : 'Approuver'}
                </Button>
                <Button
                  onClick={() => handleReject(review.id)}
                  disabled={actionLoading === review.id}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  {actionLoading === review.id ? 'Rejet...' : 'Rejeter'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};