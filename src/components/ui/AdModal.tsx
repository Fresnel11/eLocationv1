import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, Bed, Bath, Wifi, Tv, AirVent, Utensils, Car, Star, Phone, MessageCircle, Send, ThumbsUp, MessageSquare, Play, Calendar } from 'lucide-react';
import { Button } from './Button';
import { ReviewForm } from './ReviewForm';
import { ReviewsList } from './ReviewsList';
import { ContactOwnerButton } from './ContactOwnerButton';
import { BookingModal } from './BookingModal';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

interface AdModalProps {
  ad: {
    id: string;
    title: string;
    description?: string;
    price: string | number;
    location: string;
    photos: string[];
    video?: string;
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    amenities?: string[];
    allowBooking?: boolean;
    category: { name: string };
    user: { firstName: string; lastName: string };
    rating?: number;
    reviews?: number;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

const amenityIcons = {
  wifi: Wifi,
  tv: Tv,
  ac: AirVent,
  kitchen: Utensils,
  parking: Car
};

const amenityLabels = {
  wifi: 'WiFi',
  tv: 'Télévision',
  ac: 'Climatisation',
  kitchen: 'Cuisine équipée',
  parking: 'Parking',
  security: 'Sécurité',
  garden: 'Jardin',
  pool: 'Piscine'
};

export const AdModal: React.FC<AdModalProps> = ({ ad, isOpen, onClose }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [reviewsCount, setReviewsCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [refreshReviews, setRefreshReviews] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { success } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (ad?.id) {
      fetchReviewsData();
    }
  }, [ad?.id, refreshReviews]);

  const fetchReviewsData = async () => {
    if (!ad?.id) return;
    try {
      const response = await api.get(`/reviews/ad/${ad.id}/rating`);
      setReviewsCount(response.data.totalReviews);
      setAverageRating(response.data.averageRating);
    } catch (err) {
      console.error('Erreur lors du chargement des données d\'avis:', err);
    }
  };

  const handleReviewAdded = () => {
    setRefreshReviews(prev => prev + 1);
    success('Avis ajouté !', 'Votre avis a été publié avec succès');
  };

  if (!isOpen || !ad) return null;

  const media = [];
  
  // Ajouter les photos
  if (ad.photos.length > 0) {
    ad.photos.forEach(photo => {
      media.push({
        type: 'image',
        url: photo.startsWith('http') ? photo : `http://localhost:3000${photo}`
      });
    });
  }
  
  // Ajouter la vidéo si elle existe
  if (ad.video) {
    media.push({
      type: 'video',
      url: ad.video.startsWith('http') ? ad.video : `http://localhost:3000${ad.video}`
    });
  }
  
  // Si aucun média, utiliser une image par défaut
  if (media.length === 0) {
    media.push({
      type: 'image',
      url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'
    });
  }

  const nextMedia = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % media.length);
  };

  const prevMedia = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-200 shadow-lg"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>

        <div className="flex flex-col h-full">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-6 py-3 font-medium text-sm transition-colors duration-200 border-b-2 ${
                activeTab === 'details'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Détails
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-3 font-medium text-sm transition-colors duration-200 border-b-2 flex items-center gap-2 ${
                activeTab === 'reviews'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              Avis ({reviewsCount})
            </button>
          </div>

          <div className="flex flex-col lg:flex-row flex-1 overflow-hidden h-full">
          {/* Media Section */}
          <div className="relative lg:w-1/2 h-64 lg:h-auto">
            {media[currentPhotoIndex].type === 'video' ? (
              <div className="relative w-full h-full">
                <video
                  ref={videoRef}
                  src={media[currentPhotoIndex].url}
                  controls
                  preload="metadata"
                  className="w-full h-full object-cover"
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                  onEnded={() => setIsVideoPlaying(false)}
                >
                  Votre navigateur ne supporte pas la lecture de vidéos.
                </video>
                
                {/* Custom Play Button */}
                {!isVideoPlaying && (
                  <button
                    onClick={() => {
                      videoRef.current?.play();
                      setIsVideoPlaying(true);
                    }}
                    className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-all duration-200 group"
                  >
                    <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-200">
                      <Play className="h-8 w-8 text-blue-600 ml-1" fill="currentColor" />
                    </div>
                  </button>
                )}
              </div>
            ) : (
              <img
                src={media[currentPhotoIndex].url}
                alt={ad.title}
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Media Navigation */}
            {media.length > 1 && (
              <>
                <button
                  onClick={prevMedia}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-200 shadow-lg"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  onClick={nextMedia}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-200 shadow-lg"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
                
                {/* Media Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {media.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPhotoIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Category Badge */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg">
              <span className="text-sm font-medium text-gray-700">{ad.category.name}</span>
            </div>
          </div>

          {/* Content Section */}
          <div className="lg:w-1/2 p-6 overflow-y-auto h-full">
            {activeTab === 'details' ? (
            <>
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-900 pr-4">{ad.title}</h2>
                {averageRating > 0 && (
                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium text-gray-700">{averageRating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="h-5 w-5 mr-2" />
                <span className="text-lg">{ad.location}</span>
              </div>
              
              <div className="bg-blue-50 px-4 py-3 rounded-xl">
                <div className="text-3xl font-bold text-blue-600">
                  {parseInt(ad.price).toLocaleString()} FCFA
                </div>
                <div className="text-sm text-blue-600/70">par mois</div>
              </div>
            </div>

            {/* Property Details */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {ad.bedrooms && ad.bedrooms > 0 && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Bed className="h-6 w-6 mx-auto mb-1 text-gray-600" />
                  <div className="text-lg font-semibold text-gray-900">{ad.bedrooms}</div>
                  <div className="text-xs text-gray-600">Chambres</div>
                </div>
              )}
              {ad.bathrooms && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Bath className="h-6 w-6 mx-auto mb-1 text-gray-600" />
                  <div className="text-lg font-semibold text-gray-900">{ad.bathrooms}</div>
                  <div className="text-xs text-gray-600">Salles de bain</div>
                </div>
              )}
              {ad.area && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900 mb-1">{ad.area}m²</div>
                  <div className="text-xs text-gray-600">Surface</div>
                </div>
              )}
            </div>

            {/* Description */}
            {ad.description && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed">{ad.description}</p>
              </div>
            )}

            {/* Amenities */}
            {ad.amenities && ad.amenities.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Équipements</h3>
                <div className="grid grid-cols-2 gap-3">
                  {ad.amenities.map((amenity) => {
                  const Icon = amenityIcons[amenity as keyof typeof amenityIcons];
                  const label = amenityLabels[amenity as keyof typeof amenityLabels] || amenity;
                  return (
                    <div key={amenity} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      {Icon ? (
                        <Icon className="h-5 w-5 text-blue-600" />
                      ) : (
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                      <span className="text-sm text-gray-700">{label}</span>
                    </div>
                  );
                  })}
                </div>
              </div>
            )}

            {/* Owner Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Propriétaire</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">{ad.user.firstName[0]}</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{ad.user.firstName} {ad.user.lastName}</div>
                  <div className="text-sm text-gray-600">Propriétaire vérifié</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {user && (
                <Button 
                  onClick={() => setShowBookingModal(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {ad.allowBooking ? 'Réserver maintenant' : 'Voir les modalités'}
                </Button>
              )}
              <div className="flex gap-3">
                <Button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl font-medium">
                  <Phone className="h-4 w-4 mr-2" />
                  Appeler
                </Button>
                <ContactOwnerButton
                  adId={ad.id}
                  adTitle={ad.title}
                  ownerId={ad.user.id}
                  ownerName={`${ad.user.firstName} ${ad.user.lastName}`}
                  className="flex-1 py-3 rounded-xl font-medium"
                />
              </div>
            </div>
            </>
            ) : (
            /* Reviews Section */
            <div className="h-full flex flex-col">
              {/* Reviews Header */}
              {averageRating > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              star <= Math.round(averageRating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-600">{reviewsCount} avis</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Add Review Form */}
              <div className="mb-6">
                <ReviewForm adId={ad.id} onReviewAdded={handleReviewAdded} />
              </div>

              {/* Reviews List */}
              <div className="flex-1 overflow-y-auto min-h-[200px]">
                <ReviewsList adId={ad.id} refreshTrigger={refreshReviews} />
              </div>
            </div>
            )}
          </div>
          </div>
        </div>
      </div>
      
      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        ad={ad}
      />
    </div>
  );
};