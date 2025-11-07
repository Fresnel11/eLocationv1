import React, { useState, useEffect } from 'react';
import { Star, User } from 'lucide-react';
import { api } from '../../services/api';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface ReviewsListProps {
  adId: string;
  refreshTrigger?: number;
}

export const ReviewsList: React.FC<ReviewsListProps> = ({ adId, refreshTrigger }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
    fetchRating();
  }, [adId, refreshTrigger]);

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/reviews/ad/${adId}`);
      setReviews(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des avis:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRating = async () => {
    try {
      const response = await api.get(`/reviews/ad/${adId}/rating`);
      setRating(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement de la note:', err);
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
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-200 h-20 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          Aucun avis pour cette annonce
        </p>
      ) : (
        reviews.map((review) => (
          <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">
                    {review.user.firstName} {review.user.lastName}
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};