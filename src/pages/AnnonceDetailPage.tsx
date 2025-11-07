// elocation/frontend/src/pages/AnnonceDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adsService, Ad } from '../services/adsService';
import { bookingsService } from '../services/bookingsService';
import { favoritesService } from '../services/favoritesService';
import { api } from '../services/api';
import { ArrowLeft, Heart, Star, Bed, Bath, Square, MapPin, Plus, Phone, Share2, Calendar, Send, AlertCircle, Play, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ClickableAvatar } from '../components/ui/ClickableAvatar';
import { ShareAdModal } from '../components/ui/ShareAdModal';

const API_BASE_URL = 'http://localhost:3000';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  } | null;
}

const AnnonceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<{url: string; type: 'image' | 'video'} | null>(null);
  const [rating, setRating] = useState({ averageRating: 0, totalReviews: 0 });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showAddReview, setShowAddReview] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    message: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showBookingSection, setShowBookingSection] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  useEffect(() => {
    if (id) {
      const fetchAd = async () => {
        try {
          setLoading(true);
          const promises = [
            adsService.getAdById(id),
            api.get(`/reviews/ad/${id}/rating`),
            api.get(`/reviews/ad/${id}`)
          ];
          
          const [adData, ratingData, reviewsData] = await Promise.all(promises);
          
          const actualAdData = (adData as any).data || adData;
          const adWithVideos = {
            ...actualAdData,
            videos: actualAdData?.videos || []
          };
          console.log('Données de l\'annonce reçues:', adWithVideos);
          console.log('Photos disponibles:', adWithVideos.photos);
          console.log('Vidéos disponibles:', adWithVideos.videos);
          setAd(adWithVideos);
          setRating({
            averageRating: (ratingData as any).data.averageRating || 0,
            totalReviews: (ratingData as any).data.totalReviews || 0
          });
          setReviews((reviewsData as any).data || []);
          
          // Vérifier les favoris seulement si l'utilisateur est connecté
          if (user) {
            try {
              const favoriteData = await favoritesService.isFavorite(id);
              setIsFavorite(favoriteData.isFavorite || false);
            } catch (error) {
              console.error('Erreur lors de la vérification du favori:', error);
              setIsFavorite(false);
            }
          }
          
          const normalizePath = (path: string) => path.replace(/^\/+/, '');
          const buildMediaUrl = (path: string) => path.startsWith('http') ? path : `${API_BASE_URL}/${normalizePath(path)}`;

          if (actualAdData.photos && actualAdData.photos.length > 0) {
            const photoUrl = buildMediaUrl(actualAdData.photos[0]);
            setSelectedMedia({url: photoUrl, type: 'image'});
          } else if (actualAdData.video) {
            const videoUrl = buildMediaUrl(actualAdData.video);
            setSelectedMedia({url: videoUrl, type: 'video'});
          } else {
            console.log('Aucun média disponible dans l\'annonce');
            setSelectedMedia({url: 'https://via.placeholder.com/600x400', type: 'image'});
          }
        } catch (err) {
          setError('Impossible de charger les détails de l\'annonce.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchAd();
    }
  }, [id, user]);

  // Calculer le prix total quand les dates changent
  useEffect(() => {
    if (bookingData.startDate && bookingData.endDate && ad) {
      const price = calculateTotalPrice();
      setTotalPrice(price);
    } else {
      setTotalPrice(0);
    }
  }, [bookingData.startDate, bookingData.endDate, ad]);

  // Vérifier la disponibilité quand les dates changent
  useEffect(() => {
    if (bookingData.startDate && bookingData.endDate && (ad as any)?.allowBooking) {
      const timeoutId = setTimeout(() => {
        checkAvailability();
      }, 500); // Délai pour éviter trop d'appels API
      
      return () => clearTimeout(timeoutId);
    } else {
      setIsAvailable(true);
    }
  }, [bookingData.startDate, bookingData.endDate, id, (ad as any)?.allowBooking]);

  // Vérifier si l'utilisateur peut ajouter un avis
  const canAddReview = () => {
    if (!user || !ad) return false;
    if (ad.user.id === user.id) return false; // Propriétaire ne peut pas évaluer sa propre annonce
    const userReviewsCount = reviews.filter(review => review.user?.id === user.id).length;
    return userReviewsCount === 0; // Un seul avis par utilisateur par annonce
  };

  // Calculer le prix total
  const calculateTotalPrice = () => {
    if (!bookingData.startDate || !bookingData.endDate || !ad) return 0;
    
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const timeDiff = end.getTime() - start.getTime();
    
    switch ((ad as any).paymentMode) {
      case 'hourly':
        const hours = Math.ceil(timeDiff / (1000 * 60 * 60));
        return hours * parseFloat(ad.price.toString());
      case 'daily':
        const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        console.log(`Calcul: ${days} jours × ${ad.price} = ${days * parseFloat(ad.price.toString())}`);
        return days * parseFloat(ad.price.toString());
      case 'weekly':
        const weeks = Math.ceil(timeDiff / (1000 * 60 * 60 * 24 * 7));
        return weeks * parseFloat(ad.price.toString());
      case 'monthly':
        const months = Math.ceil(timeDiff / (1000 * 60 * 60 * 24 * 30));
        return months * parseFloat(ad.price.toString());
      case 'fixed':
      default:
        return parseFloat(ad.price.toString());
    }
  };

  // Valider les dates
  const validateDates = () => {
    if (!bookingData.startDate || !bookingData.endDate) {
      showToast('error', 'Veuillez sélectionner les dates');
      return false;
    }

    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    
    if (start >= end) {
      showToast('error', 'La date de fin doit être après la date de début');
      return false;
    }
    
    if (start < new Date()) {
      showToast('error', 'La date de début ne peut pas être dans le passé');
      return false;
    }
    
    return true;
  };

  // Vérifier la disponibilité
  const checkAvailability = async () => {
    if (!bookingData.startDate || !bookingData.endDate || !id) return;
    
    try {
      setAvailabilityLoading(true);
      const availability = await bookingsService.checkAvailability(
        id, 
        bookingData.startDate, 
        bookingData.endDate
      );
      setIsAvailable(availability.isAvailable);
      if (!availability.isAvailable) {
        showToast('error', 'Ces dates ne sont pas disponibles');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de disponibilité:', error);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  // Obtenir le libellé du mode de paiement
  const getPaymentModeLabel = (paymentMode: string) => {
    switch (paymentMode) {
      case 'monthly': return 'par mois';
      case 'daily': return 'par jour';
      case 'weekly': return 'par semaine';
      case 'hourly': return 'par heure';
      case 'fixed': return 'prix fixe';
      default: return 'par mois';
    }
  };

  // Gérer les favoris
  const handleFavoriteToggle = async () => {
    if (!user) {
      showToast('error', 'Vous devez être connecté pour ajouter aux favoris');
      return;
    }
    
    try {
      setFavoriteLoading(true);
      if (isFavorite) {
        await favoritesService.removeFromFavorites(id!);
        setIsFavorite(false);
        showToast('success', 'Retiré des favoris');
      } else {
        await favoritesService.addToFavorites(id!);
        setIsFavorite(true);
        showToast('success', 'Ajouté aux favoris');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la gestion des favoris';
      showToast('error', errorMessage);
    } finally {
      setFavoriteLoading(false);
    }
  };

  // TODO: Messagerie - À implémenter plus tard
  // Ouvrir la messagerie
  // const handleOpenMessage = async () => {
  //   if (!user) {
  //     showToast('error', 'Vous devez être connecté pour envoyer un message');
  //     return;
  //   }
  //   if (ad?.user.id === user.id) {
  //     showToast('error', 'Vous ne pouvez pas vous envoyer un message');
  //     return;
  //   }
  //   
  //   try {
  //     // Créer ou récupérer la conversation avec le propriétaire
  //     const response = await api.post('/messages/conversation', {
  //       receiverId: ad?.user.id,
  //       adId: id
  //     });
  //     
  //     // Rediriger vers la page de messagerie avec la conversation créée
  //     navigate(`/messages?conversationId=${response.data.conversationId}`);
  //   } catch (error: any) {
  //     console.error('Erreur lors de la création de la conversation:', error);
  //     // Fallback: rediriger vers la page de messagerie avec les paramètres
  //     navigate(`/messages?adId=${id}&userId=${ad?.user.id}`);
  //   }
  // };

  // Appeler le propriétaire
  const handleCallOwner = () => {
    if (!(ad?.user as any).phone) {
      showToast('error', 'Numéro de téléphone non disponible');
      return;
    }
    window.open(`tel:${(ad?.user as any)?.phone || ''}`, '_self');
  };

  // Contacter via WhatsApp
  const handleWhatsAppContact = () => {
    if (!(ad?.user as any).phone) {
      showToast('error', 'Numéro de téléphone non disponible');
      return;
    }
    const phone = (ad?.user as any).phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${phone}`, '_blank');
  };

  const handleSubmitReview = async () => {
    if (!newReview.rating || !newReview.comment.trim()) return;
    
    try {
      await api.post(`/reviews`, {
        adId: id,
        rating: newReview.rating,
        comment: newReview.comment
      });
      
      // Refresh data
      const [ratingData, reviewsData] = await Promise.all([
        api.get(`/reviews/ad/${id}/rating`),
        api.get(`/reviews/ad/${id}`)
      ]);
      
      setRating({
        averageRating: ratingData.data.averageRating || 0,
        totalReviews: ratingData.data.totalReviews || 0
      });
      setReviews(reviewsData.data || []);
      setNewReview({ rating: 0, comment: '' });
      setShowAddReview(false);
      showToast('success', 'Avis ajouté avec succès !');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'ajout de l\'avis';
      showToast('error', errorMessage);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      showToast('error', 'Vous devez être connecté pour réserver');
      return;
    }
    
    if (!validateDates()) return;
    
    if (!isAvailable) {
      showToast('error', 'Ces dates ne sont pas disponibles');
      return;
    }
    
    try {
      setBookingLoading(true);
      
      // Créer la réservation
      const booking = await bookingsService.createBooking({
        adId: id!,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        message: bookingData.message
      });
      
      // Calculer le dépôt (20% du prix total)
      const depositAmount = Math.round(totalPrice * 0.2);
      
      // Créer le paiement Moneroo immédiatement
      const paymentResponse = await fetch('http://localhost:3000/moneroo/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          amount: depositAmount,
          currency: 'XOF',
          description: `Dépôt de garantie - ${ad?.title || 'Annonce'}`,
          customer: {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
          },
          returnUrl: `${window.location.origin}/payment/return?bookingId=${booking.id}`,
          metadata: {
            bookingId: booking.id,
            adId: id,
            tenantId: user.id,
            ownerId: ad?.user?.id,
          },
        }),
      });
      
      if (paymentResponse.ok) {
        const paymentData = await paymentResponse.json();
        // Rediriger vers Moneroo
        window.location.href = paymentData.checkout_url;
      } else {
        showToast('error', 'Erreur lors de la création du paiement');
      }
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la réservation';
      showToast('error', errorMessage);
    } finally {
      setBookingLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  // Créer la liste complète des médias
  const allMedia = React.useMemo(() => {
    const media = [];
    if (ad?.photos) {
      ad.photos.forEach(photo => {
        const url = photo.startsWith('http') ? photo : `${API_BASE_URL}/${photo.replace(/^\/+/, '')}`;
        media.push({ url, type: 'image' as const });
      });
    }
    if ((ad as any)?.video) {
      const url = (ad as any).video.startsWith('http') ? (ad as any).video : `${API_BASE_URL}/${(ad as any).video.replace(/^\/+/, '')}`;
      media.push({ url, type: 'video' as const });
    }
    return media;
  }, [ad]);

  // Mettre à jour l'index quand le média sélectionné change
  useEffect(() => {
    if (selectedMedia && allMedia.length > 0) {
      const index = allMedia.findIndex(media => media.url === selectedMedia.url);
      if (index !== -1) {
        setCurrentMediaIndex(index);
      }
    }
  }, [selectedMedia, allMedia]);

  // Navigation entre les médias
  const navigateMedia = (direction: 'prev' | 'next') => {
    if (allMedia.length <= 1) return;
    
    let newIndex;
    if (direction === 'prev') {
      newIndex = currentMediaIndex > 0 ? currentMediaIndex - 1 : allMedia.length - 1;
    } else {
      newIndex = currentMediaIndex < allMedia.length - 1 ? currentMediaIndex + 1 : 0;
    }
    
    setCurrentMediaIndex(newIndex);
    setSelectedMedia(allMedia[newIndex]);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  if (!ad) {
    return <div className="text-center mt-10">Annonce non trouvée.</div>;
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Mobile Layout */}
      <div className="lg:hidden">
      {(() => {
  console.log('État actuel de selectedMedia:', selectedMedia);
  console.log('Médias disponibles dans l\'annonce:', {
    photos: ad?.photos,
    videos: ad?.videos
  });
  return null;
})()}
        {/* Image principale avec overlay */}
        <div className="relative h-96">
          {selectedMedia ? (
            selectedMedia.type === 'image' ? (
              <img 
                src={selectedMedia.url} 
                alt={ad.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={selectedMedia.url}
                controls
                className="w-full h-full object-cover"
              />
            )
          ) : (
            <img 
              src={'https://via.placeholder.com/600x400'} 
              alt={ad.title} 
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Header avec boutons */}
          <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 bg-gradient-to-b from-black/50 to-transparent z-40">
            <button 
              onClick={() => navigate(-1)} 
              className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </button>
            <button 
              onClick={handleFavoriteToggle}
              disabled={favoriteLoading}
              className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all"
            >
              <Heart className={`h-5 w-5 transition-colors ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-white'
              }`} />
            </button>
          </div>
        </div>
        
        {/* Miniatures des médias en bas */}
        {((ad.photos && ad.photos.length > 1) || (ad as any).video) && (
          <div className="px-6 py-4 bg-white">
            <div className="flex space-x-2 overflow-x-auto">
              {ad.photos?.map((url, index) => {
                const mediaUrl = url.startsWith('http') ? url : `${API_BASE_URL}/${url.replace(/^\/+/, '')}`;
                return (
                  <img
                    key={`photo-${index}`}
                    src={mediaUrl}
                    alt={`Miniature ${index + 1}`}
                    className={`w-16 h-12 object-cover rounded-lg cursor-pointer border-2 flex-shrink-0 ${
                      selectedMedia?.url === mediaUrl ? 'border-blue-500' : 'border-gray-300'
                    }`}
                    onClick={() => setSelectedMedia({url: mediaUrl, type: 'image'})}
                  />
                );
              })}
              {(ad as any).video && (
                <div
                  className={`w-16 h-12 relative rounded-lg cursor-pointer border-2 flex-shrink-0 ${
                    selectedMedia?.type === 'video' ? 'border-blue-500' : 'border-gray-300'
                  }`}
                  onClick={() => {
                    const videoUrl = (ad as any).video.startsWith('http') ? (ad as any).video : `${API_BASE_URL}/${(ad as any).video.replace(/^\/+/, '')}`;
                    setSelectedMedia({url: videoUrl, type: 'video'});
                  }}
                >
                  <video
                    src={(ad as any).video.startsWith('http') ? (ad as any).video : `${API_BASE_URL}/${(ad as any).video.replace(/^\/+/, '')}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contenu principal mobile */}
        <div className="bg-white rounded-t-3xl mt-0 relative z-0 px-6 pt-2 pb-24">
          {/* Titre et rating */}
          <div className="mb-3">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{ad.title}</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={`h-4 w-4 ${
                    star <= Math.round(rating.averageRating) 
                      ? 'fill-orange-400 text-orange-400' 
                      : 'text-gray-300'
                  }`} 
                />
              ))}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {rating.averageRating > 0 ? rating.averageRating.toFixed(1) : '0.0'}
            </span>
            <span className="text-sm text-gray-500">({rating.totalReviews})</span>
          </div>
        </div>

          {/* Caractéristiques */}
          <div className="flex items-center gap-6 mb-4">
          {ad.bedrooms && ad.bedrooms > 0 && (
            <div className="flex items-center gap-2">
              <Bed className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-600">{ad.bedrooms} Bed</span>
            </div>
          )}
          {ad.bathrooms && (
            <div className="flex items-center gap-2">
              <Bath className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-600">{ad.bathrooms} Bathroom</span>
            </div>
          )}
          {ad.area && (
            <div className="flex items-center gap-2">
              <Square className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-600">{ad.area} Sqft</span>
            </div>
          )}
        </div>

          {/* Section Details */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Details</h3>
            <p className="text-gray-600 leading-relaxed">
              {(() => {
                const description = ad.description || "The prestige of one of Polo Alto's most sought-after neighborhoods takes center stage in this magnificent home that...";
                const isLong = description.length > 150;
                
                if (!isLong) return description;
                
                return (
                  <>
                    {showFullDescription ? description : `${description.substring(0, 150)}...`}
                    <span 
                      className="text-blue-600 font-medium cursor-pointer ml-1"
                      onClick={() => setShowFullDescription(!showFullDescription)}
                    >
                      {showFullDescription ? ' Lire moins' : ' Lire plus'}
                    </span>
                  </>
                );
              })()} 
            </p>
          </div>

          {/* Localisation */}
          <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-5 w-5 text-red-500" />
            <span className="text-gray-900 font-medium">{ad.location}</span>
          </div>
        </div>

          {/* Propriétaire */}
          <div className="flex items-center gap-3 mb-4">
          <ClickableAvatar
            avatarUrl={ad.user?.profilePicture}
            userName={`${ad.user?.firstName || 'Utilisateur'} ${ad.user?.lastName || ''}`}
            size="lg"
          />
          <div className="flex-1">
            <p className="font-semibold text-gray-900">{ad.user?.firstName || 'Utilisateur'} {ad.user?.lastName || ''}</p>
            <p className="text-sm text-gray-500">Propriétaire</p>
          </div>
          <div className="flex gap-2">
            {/* TODO: Messagerie - À implémenter plus tard */}
            {/* <button 
              onClick={handleOpenMessage}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors"
            >
              <MessageCircle className="h-5 w-5 text-white" />
            </button> */}
            {(ad.user as any)?.phone && (
              <>
                <button 
                  onClick={handleCallOwner}
                  className="w-10 h-10 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center transition-colors"
                >
                  <Phone className="h-5 w-5 text-white" />
                </button>
                <button 
                  onClick={handleWhatsAppContact}
                  className="w-10 h-10 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors"
                >
                  <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Bouton pour ouvrir la section réservation mobile */}
        {(ad as any).allowBooking && !showBookingSection && (
          <div className="bg-white rounded-t-3xl p-6 mt-6">
            <button 
              onClick={() => setShowBookingSection(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Calendar className="h-5 w-5" />
              Réserver et Payer
            </button>
          </div>
        )}

        {/* Section réservation mobile */}
        {showBookingSection && (
          <div className="bg-white rounded-t-3xl p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Réserver ce logement</h3>
              <button 
                onClick={() => setShowBookingSection(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Arrivée
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={bookingData.startDate}
                    onChange={(e) => setBookingData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Départ
                  </label>
                  <input
                    type="date"
                    min={bookingData.startDate || today}
                    value={bookingData.endDate}
                    onChange={(e) => setBookingData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message (optionnel)
                </label>
                <textarea
                  value={bookingData.message}
                  onChange={(e) => setBookingData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Présentez-vous au propriétaire..."
                  className="w-full p-2 border border-gray-300 rounded-lg resize-none h-16 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Indicateur de disponibilité */}
              {bookingData.startDate && bookingData.endDate && (
                <div className="mt-4">
                  {availabilityLoading ? (
                    <div className="flex items-center gap-2 text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                      <span className="text-sm">Vérification de la disponibilité...</span>
                    </div>
                  ) : (
                    <div className={`flex items-center gap-2 ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                      <div className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm font-medium">
                        {isAvailable ? 'Disponible' : 'Non disponible'}
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              <button 
                onClick={handleBooking}
                disabled={bookingLoading || !bookingData.startDate || !bookingData.endDate || !isAvailable || availabilityLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
              >
                {bookingLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Réserver et Payer'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Message pour annonces sans réservation */}
        {!(ad as any).allowBooking && (
          <div className="bg-white rounded-t-3xl p-6 mt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Réservation non disponible</h3>
              <p className="text-gray-600 text-sm mb-4">Cette annonce n'accepte pas les réservations en ligne.</p>
              <p className="text-gray-600 text-sm">Contactez directement le propriétaire pour plus d'informations.</p>
            </div>
          </div>
        )}

          {/* Section Avis */}
          <div className="mb-6 bg-white rounded-t-3xl p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Avis ({rating.totalReviews})</h3>
            {canAddReview() ? (
              <button 
                onClick={() => setShowAddReview(!showAddReview)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                <Plus className="h-4 w-4" />
                Ajouter un avis
              </button>
            ) : (
              <div className="text-sm text-gray-500">
                {!user ? 'Connectez-vous pour laisser un avis' : 
                 ad?.user.id === user.id ? 'Vous ne pouvez pas évaluer votre propre annonce' :
                 'Vous avez déjà laissé un avis pour cette annonce'}
              </div>
            )}
          </div>

            {/* Formulaire d'ajout d'avis */}
            {showAddReview && (
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                      className="p-1"
                    >
                      <Star 
                        className={`h-6 w-6 ${
                          star <= newReview.rating 
                            ? 'fill-orange-400 text-orange-400' 
                            : 'text-gray-300'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Commentaire</label>
                <textarea
                  value={newReview.comment}
                  onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Partagez votre expérience..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none h-20 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSubmitReview}
                  disabled={!newReview.rating || !newReview.comment.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:bg-gray-300"
                >
                  Publier
                </button>
                <button
                  onClick={() => {
                    setShowAddReview(false);
                    setNewReview({ rating: 0, comment: '' });
                  }}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

            {/* Liste des avis */}
            <div className="space-y-4">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                  <div key={review.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <ClickableAvatar
                      avatarUrl={review.user?.profilePicture}
                      userName={review.user ? `${review.user.firstName} ${review.user.lastName}` : 'Utilisateur anonyme'}
                      size="md"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          {review.user ? (
                            <Link 
                              to={`/user/${review.user.id}`}
                              className="font-semibold text-gray-900 text-sm hover:text-blue-600 transition-colors cursor-pointer"
                            >
                              {review.user.firstName && review.user.lastName 
                                ? `${review.user.firstName} ${review.user.lastName}` 
                                : review.user.firstName || 'Utilisateur anonyme'
                              }
                            </Link>
                          ) : (
                            <p className="font-semibold text-gray-900 text-sm">
                              Utilisateur anonyme
                            </p>
                          )}
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                className={`h-3 w-3 ${
                                  star <= review.rating 
                                    ? 'fill-orange-400 text-orange-400' 
                                    : 'text-gray-300'
                                }`} 
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">Aucun avis pour le moment</p>
                <p className="text-xs mt-1">Soyez le premier à laisser un avis !</p>
              </div>
            )}
          </div>
        </div>
      </div>

        {/* Footer fixe avec prix et bouton */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {parseInt(ad.price.toString()).toLocaleString()} FCFA
                </p>
                <p className="text-sm text-gray-500">{getPaymentModeLabel((ad as any).paymentMode)}</p>
                {totalPrice > 0 && (
                  <div className="mt-2">
                    <p className="text-lg font-semibold text-blue-600">
                      Total: {totalPrice.toLocaleString()} FCFA
                    </p>
                    <p className="text-sm font-medium text-green-600">
                      Dépôt requis: {Math.round(totalPrice * 0.2).toLocaleString()} FCFA (20%)
                    </p>
                  </div>
                )}
              </div>
            </div>
            {(ad as any).allowBooking ? (
              <button 
                onClick={() => setShowBookingSection(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Calendar className="h-5 w-5" />
                Réserver et Payer
              </button>
            ) : (
              /* TODO: Messagerie - À implémenter plus tard */
              <button 
                className="bg-gray-400 text-white px-8 py-3 rounded-xl font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                disabled
              >
                {/* <MessageCircle className="h-5 w-5" /> */}
                Contacter le propriétaire
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Layout - Design Moderne */}
      <div className="hidden lg:block bg-gray-50 min-h-screen">
        {/* Header minimaliste */}
        <div className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-8 py-4">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => navigate(-1)} 
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors group"
              >
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Retour</span>
              </button>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleFavoriteToggle}
                  disabled={favoriteLoading}
                  className="p-3 hover:bg-gray-100 rounded-full transition-colors group"
                >
                  <Heart className={`h-5 w-5 transition-colors ${
                    isFavorite 
                      ? 'fill-red-500 text-red-500' 
                      : 'text-gray-600 group-hover:text-red-500'
                  }`} />
                </button>
                <button 
                  onClick={() => setShowShareModal(true)}
                  className="p-3 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Share2 className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="grid grid-cols-12 gap-12">
            {/* Section principale - 8 colonnes */}
            <div className="col-span-8 space-y-8">
              {/* Média principal */}
              <div className="h-[600px] mb-4">
                {selectedMedia?.type === 'video' ? (
                  <video
                    src={selectedMedia.url}
                    controls
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <img 
                    src={selectedMedia?.url || (ad.photos?.[0] ? (ad.photos[0].startsWith('http') ? ad.photos[0] : `${API_BASE_URL}/${ad.photos[0].replace(/^\/+/, '')}`) : 'https://via.placeholder.com/600x400')} 
                    alt={ad.title} 
                    className="w-full h-full object-cover rounded-2xl"
                  />
                )}
              </div>
              
              {/* Miniatures en bas */}
              {((ad.photos && ad.photos.length > 1) || (ad as any).video) && (
                <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
                  {ad.photos?.map((image, index) => {
                    const mediaUrl = image.startsWith('http') ? image : `${API_BASE_URL}/${image.replace(/^\/+/, '')}`;
                    return (
                      <button
                        key={`photo-${index}`}
                        onClick={() => setSelectedMedia({url: mediaUrl, type: 'image'})}
                        className={`w-20 h-16 rounded-lg overflow-hidden transition-all hover:scale-105 flex-shrink-0 ${
                          selectedMedia?.url === mediaUrl ? 'ring-2 ring-blue-500' : ''
                        }`}
                      >
                        <img
                          src={mediaUrl}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                  {(ad as any).video && (
                    <button
                      onClick={() => {
                        const videoUrl = (ad as any).video.startsWith('http') ? (ad as any).video : `${API_BASE_URL}/${(ad as any).video.replace(/^\/+/, '')}`;
                        setSelectedMedia({url: videoUrl, type: 'video'});
                      }}
                      className={`w-20 h-16 rounded-lg overflow-hidden transition-all hover:scale-105 relative flex-shrink-0 ${
                        selectedMedia?.type === 'video' ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <video
                        src={(ad as any).video.startsWith('http') ? (ad as any).video : `${API_BASE_URL}/${(ad as any).video.replace(/^\/+/, '')}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                        <Play className="w-4 h-4 text-white" />
                      </div>
                    </button>
                  )}
                </div>
              )}

              {/* Informations principales */}
              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">{ad.title}</h1>
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <MapPin className="h-5 w-5 text-red-500" />
                      <span className="text-lg">{ad.location}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`h-5 w-5 ${
                              star <= Math.round(rating.averageRating) 
                                ? 'fill-orange-400 text-orange-400' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-lg font-semibold text-gray-900">
                        {rating.averageRating > 0 ? rating.averageRating.toFixed(1) : '0.0'}
                      </span>
                      <span className="text-gray-500">({rating.totalReviews} avis)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-gray-900">
                      {parseInt(ad.price.toString()).toLocaleString()} FCFA
                    </div>
                    <div className="text-gray-600">{getPaymentModeLabel((ad as any).paymentMode)}</div>
                  </div>
                </div>

                {/* Caractéristiques */}
                <div className="flex items-center gap-8 py-6 border-y border-gray-200">
                  {ad.bedrooms && ad.bedrooms > 0 && (
                    <div className="flex items-center gap-3">
                      <Bed className="h-6 w-6 text-blue-600" />
                      <span className="text-lg font-medium">{ad.bedrooms} Chambres</span>
                    </div>
                  )}
                  {ad.bathrooms && (
                    <div className="flex items-center gap-3">
                      <Bath className="h-6 w-6 text-blue-600" />
                      <span className="text-lg font-medium">{ad.bathrooms} Salles de bain</span>
                    </div>
                  )}
                  {ad.area && (
                    <div className="flex items-center gap-3">
                      <Square className="h-6 w-6 text-blue-600" />
                      <span className="text-lg font-medium">{ad.area} m²</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mt-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
                  <p className="text-gray-700 text-lg leading-relaxed mb-8">
                    {ad.description}
                  </p>
                  
                  {/* Informations hôte */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center gap-4">
                      <ClickableAvatar
                        avatarUrl={ad.user?.profilePicture}
                        userName={`${ad.user?.firstName || 'Utilisateur'} ${ad.user?.lastName || ''}`}
                        size="lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {ad.user?.firstName || 'Utilisateur'} {ad.user?.lastName || ''}
                        </h4>
                      </div>
                      <div className="flex gap-3">
                        {/* TODO: Messagerie - À implémenter plus tard */}
                        {/* <button 
                          onClick={handleOpenMessage}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                          <MessageCircle className="h-4 w-4" />
                          Message
                        </button> */}
                        {(ad.user as any)?.phone && (
                          <button 
                            onClick={handleWhatsAppContact}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                          >
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                            </svg>
                            WhatsApp
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Avis */}
              <div className="bg-white rounded-3xl p-8 shadow-lg">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Avis</h2>
                  {canAddReview() ? (
                    <button 
                      onClick={() => setShowAddReview(!showAddReview)}
                      className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Plus className="h-5 w-5" />
                      Ajouter un avis
                    </button>
                  ) : (
                    <div className="text-sm text-gray-500">
                      {!user ? 'Connectez-vous pour laisser un avis' : 
                       ad?.user.id === user.id ? 'Vous ne pouvez pas évaluer votre propre annonce' :
                       'Vous avez déjà laissé un avis pour cette annonce'}
                    </div>
                  )}
                </div>
                
                {/* Formulaire d'ajout d'avis */}
                {showAddReview && (
                  <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star 
                              className={`h-8 w-8 ${
                                star <= newReview.rating 
                                  ? 'fill-orange-400 text-orange-400' 
                                  : 'text-gray-300'
                              }`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Commentaire</label>
                      <textarea
                        value={newReview.comment}
                        onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                        placeholder="Partagez votre expérience..."
                        className="w-full p-4 border border-gray-300 rounded-xl resize-none h-32 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleSubmitReview}
                        disabled={!newReview.rating || !newReview.comment.trim()}
                        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium disabled:bg-gray-300 hover:bg-blue-700 transition-colors"
                      >
                        Publier l'avis
                      </button>
                      <button
                        onClick={() => {
                          setShowAddReview(false);
                          setNewReview({ rating: 0, comment: '' });
                        }}
                        className="bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Liste des avis */}
                <div className="space-y-6">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                        <div className="flex items-start gap-4">
                          <ClickableAvatar
                            avatarUrl={review.user?.profilePicture}
                            userName={review.user ? `${review.user.firstName} ${review.user.lastName}` : 'Utilisateur anonyme'}
                            size="lg"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {review.user ? `${review.user.firstName} ${review.user.lastName}` : 'Utilisateur anonyme'}
                              </h4>
                              <span className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mb-3">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star} 
                                  className={`h-4 w-4 ${
                                    star <= review.rating 
                                      ? 'fill-orange-400 text-orange-400' 
                                      : 'text-gray-300'
                                  }`} 
                                />
                              ))}
                            </div>
                            <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <p className="text-lg">Aucun avis pour le moment</p>
                      <p className="text-sm mt-2">Soyez le premier à partager votre expérience !</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Réservation - 4 colonnes */}
            <div className="col-span-4">
              <div className="bg-white rounded-3xl p-8 shadow-xl sticky top-24">
                <div className="mb-8">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {parseInt(ad.price.toString()).toLocaleString()} FCFA
                  </div>
                  <div className="text-gray-600">{getPaymentModeLabel((ad as any)?.paymentMode || 'monthly')}</div>
                  {totalPrice > 0 && (
                    <div className="mt-3">
                      <div className="text-xl font-semibold text-blue-600">
                        Total: {totalPrice.toLocaleString()} FCFA
                      </div>
                      <div className="text-lg font-medium text-green-600 mt-1">
                        Dépôt requis: {Math.round(totalPrice * 0.2).toLocaleString()} FCFA (20%)
                      </div>
                    </div>
                  )}
                </div>

                {/* Section réservation */}
                {(ad as any).allowBooking ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          Arrivée
                        </label>
                        <input
                          type="date"
                          min={today}
                          value={bookingData.startDate}
                          onChange={(e) => setBookingData(prev => ({ ...prev, startDate: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          Départ
                        </label>
                        <input
                          type="date"
                          min={bookingData.startDate || today}
                          value={bookingData.endDate}
                          onChange={(e) => setBookingData(prev => ({ ...prev, endDate: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message (optionnel)
                      </label>
                      <textarea
                        value={bookingData.message}
                        onChange={(e) => setBookingData(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Présentez-vous au propriétaire..."
                        className="w-full p-3 border border-gray-300 rounded-xl resize-none h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    {/* Indicateur de disponibilité */}
                    {bookingData.startDate && bookingData.endDate && (
                      <div className="mb-4">
                        {availabilityLoading ? (
                          <div className="flex items-center gap-2 text-gray-500 justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                            <span className="text-sm">Vérification de la disponibilité...</span>
                          </div>
                        ) : (
                          <div className={`flex items-center gap-2 justify-center ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                            <div className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-sm font-medium">
                              {isAvailable ? 'Disponible pour ces dates' : 'Non disponible pour ces dates'}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <button 
                      onClick={handleBooking}
                      disabled={bookingLoading || !bookingData.startDate || !bookingData.endDate || !isAvailable || availabilityLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 px-6 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                    >
                      {bookingLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          Réserver et Payer
                        </>
                      )}
                    </button>
                    
                    <div className="text-center text-sm text-gray-500">
                      <p>Vous ne serez pas débité pour le moment</p>
                      <p className="mt-1">Un dépôt de 20% sera demandé à la confirmation</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Réservation non disponible</h3>
                    <p className="text-gray-600 mb-4">Cette annonce n'accepte pas les réservations en ligne.</p>
                    <p className="text-gray-600 text-sm mb-6">Contactez directement le propriétaire pour plus d'informations.</p>
                    {/* TODO: Messagerie - À implémenter plus tard */}
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 mx-auto">
                      {/* <MessageCircle className="h-5 w-5" /> */}
                      Contacter le propriétaire
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>


      </div>
      
      {/* Modal de partage */}
      <ShareAdModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        adUrl={window.location.href}
        adTitle={ad?.title || ''}
      />
    </div>
  );
};

export default AnnonceDetailPage;