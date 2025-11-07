import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Phone, Mail, Star, Grid, List, MessageCircle, Settings, Edit, Share2, MoreVertical, Heart, Eye, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { AdCardSkeletonGrid } from '../components/ui/AdCardSkeleton';
import { AdModal } from '../components/ui/AdModal';
import { MessageModal } from '../components/ui/MessageModal';
import { ProfileCard } from '../components/ui/ProfileCard';
import { EditProfileModal } from '../components/ui/EditProfileModal';
import { BookingHistory } from '../components/ui/BookingHistory';
import { UserReputation } from '../components/ui/UserReputation';
import { ReportModal } from '../components/ui/ReportModal';
import { ClickableAvatar } from '../components/ui/ClickableAvatar';
import { ShareProfileModal } from '../components/ui/ShareProfileModal';
import { QRCodeModal } from '../components/ui/QRCodeModal';
import { ProfileDropdownMenu } from '../components/ui/ProfileDropdownMenu';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  whatsappNumber?: string;
  createdAt: string;
  profile?: {
    avatar?: string;
    bio?: string;
    address?: string;
    averageRating?: number;
    totalBookings?: number;
  };
  _count?: {
    ads: number;
  };
}

interface UserAd {
  id: string;
  title: string;
  description?: string;
  price: number;
  location: string;
  photos: string[];
  video?: string;
  category: {
    id: string;
    name: string;
  };
  subCategory?: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  amenities?: string[];
  whatsappNumber?: string;
  isAvailable?: boolean;
  isActive?: boolean;
  // Propriétés UI ajoutées pour compatibilité avec AdModal
  isLiked?: boolean;
  rating?: number;
  reviews?: number;
}

export const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [userAds, setUserAds] = useState<UserAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [adsLoading, setAdsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAd, setSelectedAd] = useState<UserAd | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ads' | 'bookings' | 'requests'>('ads');
  const [userRequests, setUserRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [deleteRequestId, setDeleteRequestId] = useState<string | null>(null);
  const { user: currentUser, updateUser } = useAuth();
  const { showToast } = useToast();

  const isOwner = currentUser?.id === userId;

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchUserAds();
      if (isOwner) {
        fetchUserRequests();
      }
    }
  }, [userId, isOwner]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get(`/users/${userId}/profile`);
      setUser(response.data);
    } catch (error) {
      // Erreur lors du chargement du profil
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdated = async () => {
    await fetchUserProfile();
    // Mettre à jour l'utilisateur dans le contexte si c'est le propriétaire
    if (isOwner && currentUser) {
      try {
        const response = await api.get('/auth/me');
        const updatedUserData = {
          ...currentUser,
          profilePicture: response.data.profilePicture
        };
        updateUser(updatedUserData);
      } catch (error) {
        console.error('Erreur lors de la mise à jour du contexte utilisateur:', error);
      }
    }
  };

  const getProfileForEdit = () => {
    const profileData = {
      avatar: user?.profile?.avatar,
      bio: user?.profile?.bio,
      address: user?.profile?.address,
      phone: user?.phone
    };
    return profileData;
  };

  const fetchUserAds = async () => {
    try {
      const response = await api.get(`/ads/user/${userId}`);
      setUserAds(response.data.ads || []);
    } catch (error) {
      // Erreur lors du chargement des annonces
    } finally {
      setAdsLoading(false);
    }
  };

  const fetchUserRequests = async () => {
    try {
      setRequestsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Filtrer les demandes pour ne garder que celles de l'utilisateur connecté
        const userOwnRequests = data.filter((request: any) => request.userId === userId);
        setUserRequests(userOwnRequests);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error);
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/requests/${requestId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setUserRequests(prev => prev.filter((req: any) => req.id !== requestId));
        setDeleteRequestId(null);
        showToast('success', 'Demande supprimée avec succès');
      } else {
        showToast('error', 'Erreur lors de la suppression de la demande');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showToast('error', 'Erreur lors de la suppression de la demande');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long'
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const openModal = (ad: UserAd) => {
    // Ajouter les propriétés manquantes pour AdModal
    const adWithUIProps = {
      ...ad,
      isLiked: false,
      rating: 4.5 + Math.random() * 0.5,
      reviews: Math.floor(Math.random() * 30) + 5,
      amenities: ad.amenities || [],
      description: ad.description || '',
      video: ad.video || undefined
    };
    setSelectedAd(adWithUIProps);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAd(null);
  };

  const handleContactUser = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setIsMessageModalOpen(true);
  };

  const handleWhatsAppContact = () => {
    if (user?.whatsappNumber) {
      const message = encodeURIComponent(`Bonjour ${user.firstName}, je vous contacte via eLocation Bénin.`);
      window.open(`https://wa.me/${user.whatsappNumber.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Utilisateur introuvable</h2>
          <p className="text-gray-600 mb-4">Ce profil n'existe pas ou a été supprimé.</p>
          <Button onClick={() => navigate('/ads')}>Retour aux annonces</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 lg:bg-white">
      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Desktop Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Retour</span>
            </button>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Share2 className="h-4 w-4" />
                <span>Partager</span>
              </button>
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDropdownOpen(!isDropdownOpen);
                  }}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                <ProfileDropdownMenu
                  isOpen={isDropdownOpen}
                  onClose={() => setIsDropdownOpen(false)}
                  isOwner={isOwner}
                  userName={`${user.firstName} ${user.lastName}`}
                  profileUrl={`${window.location.origin}/user/${user.id}`}
                  userId={user.id}
                  onShowQRModal={() => {
                    console.log('Opening QR Modal');
                    setIsQRModalOpen(true);
                  }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
                {/* Profile Avatar & Basic Info */}
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <ClickableAvatar
                      avatarUrl={user.profile?.avatar || user.profilePicture}
                      userName={`${user.firstName} ${user.lastName}`}
                      size="xl"
                      className="w-24 h-24 mx-auto"
                    />
                    {isOwner && (
                      <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
                    {user.firstName} {user.lastName}
                  </h1>
                  <div className="flex items-center justify-center gap-2 text-gray-600 mb-3">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">Membre depuis {formatDate(user.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-orange-400 fill-orange-400" />
                      <span className="text-sm font-medium">{user.profile?.averageRating ? Number(user.profile.averageRating).toFixed(1) : '0.0'}</span>
                      <span className="text-xs text-gray-500">({user.profile?.totalBookings || 0} avis)</span>
                    </div>
                  </div>
                  {user.profile?.bio && (
                    <p className="text-sm text-gray-600 mb-4">{user.profile.bio}</p>
                  )}
                  {user.profile?.address && (
                    <div className="flex items-center justify-center gap-1 text-gray-600 mb-4">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{user.profile.address}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {!isOwner && (
                  <div className="space-y-3 mb-6">
                    <button
                      onClick={handleContactUser}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <MessageCircle className="h-5 w-5" />
                      Envoyer un message
                    </button>
                    {user.whatsappNumber && (
                      <button
                        onClick={handleWhatsAppContact}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                      >
                        <Phone className="h-5 w-5" />
                        Contacter sur WhatsApp
                      </button>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{user._count?.ads || 0}</div>
                    <div className="text-sm text-gray-600">Annonces</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{user.profile?.averageRating ? Number(user.profile.averageRating).toFixed(1) : '0.0'}</div>
                    <div className="text-sm text-gray-600">Note</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{user.profile?.totalBookings || 0}</div>
                    <div className="text-sm text-gray-600">Avis</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Content */}
            <div className="lg:col-span-2">
              {/* Tabs */}
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  onClick={() => setActiveTab('ads')}
                  className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                    activeTab === 'ads'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Annonces ({userAds.length})
                </button>
                {isOwner && (
                  <>
                    <button
                      onClick={() => setActiveTab('bookings')}
                      className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                        activeTab === 'bookings'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Réservations
                    </button>
                    <button
                      onClick={() => setActiveTab('requests')}
                      className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                        activeTab === 'requests'
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Demandes ({userRequests.length})
                    </button>
                  </>
                )}
              </div>

              {/* Content */}
              {activeTab === 'ads' && (
                <div>
                  {adsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white rounded-xl h-64 animate-pulse border border-gray-100"></div>
                      ))}
                    </div>
                  ) : userAds.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Grid className="h-10 w-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-900 mb-3">
                        Aucune annonce
                      </h3>
                      <p className="text-gray-600">
                        {isOwner ? 'Vous n\'avez pas encore publié d\'annonce.' : `${user.firstName} n'a pas encore publié d'annonces.`}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {userAds.map((ad) => (
                        <div 
                          key={ad.id}
                          className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => navigate(`/annonce/${ad.id}`)}
                        >
                          <div className="aspect-video relative">
                            <img
                              src={ad.photos[0] 
                                ? (ad.photos[0].startsWith('http') 
                                    ? ad.photos[0] 
                                    : `http://localhost:3000${ad.photos[0]}`
                                  )
                                : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop'
                              }
                              alt={ad.title}
                              className="w-full h-full object-cover"
                            />
                            <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                              <Heart className="h-4 w-4 text-gray-600" />
                            </button>
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                              {ad.title}
                            </h3>
                            <div className="flex items-center text-gray-500 mb-3">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span className="text-sm truncate">{ad.location}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="text-blue-600 font-bold text-lg">
                                {parseInt(ad.price.toString()).toLocaleString()} FCFA
                                <span className="text-sm text-gray-500 font-normal">/mois</span>
                              </div>
                              <div className="flex items-center gap-3 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  <span>24</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
                                  <span>4.8</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'bookings' && isOwner && (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Calendar className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-3">
                    Aucune réservation
                  </h3>
                  <p className="text-gray-600">
                    Vos réservations apparaîtront ici.
                  </p>
                </div>
              )}
              
              {activeTab === 'requests' && isOwner && (
                <div>
                  {requestsLoading ? (
                    <div className="grid grid-cols-1 gap-6">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-xl h-32 animate-pulse border border-gray-100"></div>
                      ))}
                    </div>
                  ) : userRequests.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MessageCircle className="h-10 w-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-900 mb-3">
                        Aucune demande
                      </h3>
                      <p className="text-gray-600">
                        Vous n'avez pas encore créé de demande.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userRequests.map((request: any) => (
                        <div 
                          key={request.id}
                          className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h3 
                              className="font-semibold text-gray-900 text-lg cursor-pointer hover:text-blue-600"
                              onClick={() => navigate(`/requests/${request.id}`)}
                            >
                              {request.title}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                {request.category.name}
                              </span>
                              <button
                                onClick={() => navigate(`/requests?edit=${request.id}`)}
                                className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                title="Modifier"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setDeleteRequestId(request.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <p 
                            className="text-gray-600 mb-3 line-clamp-2 cursor-pointer"
                            onClick={() => navigate(`/requests/${request.id}`)}
                          >
                            {request.description}
                          </p>
                          <div 
                            className="flex items-center justify-between text-sm text-gray-500 cursor-pointer"
                            onClick={() => navigate(`/requests/${request.id}`)}
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{request.location}</span>
                              </div>
                              {request.maxBudget && (
                                <span className="font-semibold text-green-600">
                                  {Math.round(request.maxBudget).toLocaleString()} FCFA
                                </span>
                              )}
                            </div>
                            <span className="text-xs">
                              {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="relative">
          {/* Background gradient */}
          <div className="h-48 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700"></div>
          
          {/* Header controls */}
          <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 pt-12">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </button>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsShareModalOpen(true)}
                className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center"
              >
                <Share2 className="h-5 w-5 text-white" />
              </button>
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDropdownOpen(!isDropdownOpen);
                  }}
                  className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center"
                >
                  <MoreVertical className="h-5 w-5 text-white" />
                </button>
                <ProfileDropdownMenu
                  isOpen={isDropdownOpen}
                  onClose={() => setIsDropdownOpen(false)}
                  isOwner={isOwner}
                  userName={`${user.firstName} ${user.lastName}`}
                  profileUrl={`${window.location.origin}/user/${user.id}`}
                  userId={user.id}
                  onShowQRModal={() => {
                    console.log('Opening QR Modal');
                    setIsQRModalOpen(true);
                  }}
                />
              </div>
            </div>
          </div>

          
          {/* Profile Section */}
          <div className="bg-white rounded-t-3xl -mt-6 relative z-10 px-6 pt-6">
            {/* Profile Info */}
            <div className="flex items-start gap-4 mb-6">
              <div className="-mt-10 border-4 border-white shadow-lg rounded-full">
                <ClickableAvatar
                  avatarUrl={user.profile?.avatar || user.profilePicture}
                  userName={`${user.firstName} ${user.lastName}`}
                  size="lg"
                  className="w-20 h-20"
                />
              </div>
              <div className="flex-1 pt-2">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {user.firstName} {user.lastName}
                </h1>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Membre depuis {formatDate(user.createdAt)}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-orange-400 fill-orange-400" />
                    <span className="text-sm font-medium">{user.profile?.averageRating ? Number(user.profile.averageRating).toFixed(1) : '0.0'}</span>
                    <span className="text-xs text-gray-500">({user.profile?.totalBookings || 0} avis)</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {user._count?.ads || 0} annonce{(user._count?.ads || 0) > 1 ? 's' : ''}
                  </div>
                </div>
                {user.profile?.bio && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{user.profile.bio}</p>
                )}
                {user.profile?.address && (
                  <div className="flex items-center gap-1 text-gray-600 mt-1">
                    <MapPin className="h-3 w-3" />
                    <span className="text-xs">{user.profile.address}</span>
                  </div>
                )}
              </div>
              {isOwner && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mt-2"
                >
                  <Edit className="h-4 w-4 text-gray-600" />
                </button>
              )}
            </div>
            
            {/* Action Buttons */}
            {!isOwner && (
              <div className="flex gap-3 mb-6">
                <button
                  onClick={handleContactUser}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  Message
                </button>
                {user.whatsappNumber && (
                  <button
                    onClick={handleWhatsAppContact}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2"
                  >
                    <Phone className="h-5 w-5" />
                    WhatsApp
                  </button>
                )}
              </div>
            )}
            
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{user._count?.ads || 0}</div>
                <div className="text-sm text-gray-600">Annonces</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{user.profile?.averageRating ? Number(user.profile.averageRating).toFixed(1) : '0.0'}</div>
                <div className="text-sm text-gray-600">Note</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{user.profile?.totalBookings || 0}</div>
                <div className="text-sm text-gray-600">Avis</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab('ads')}
                className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
                  activeTab === 'ads'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500'
                }`}
              >
                Annonces ({userAds.length})
              </button>
              {isOwner && (
                <>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
                      activeTab === 'bookings'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500'
                    }`}
                  >
                    Réservations
                  </button>
                  <button
                    onClick={() => setActiveTab('requests')}
                    className={`flex-1 py-3 text-center font-medium border-b-2 transition-colors ${
                      activeTab === 'requests'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500'
                    }`}
                  >
                    Demandes ({userRequests.length})
                  </button>
                </>
              )}
            </div>
                
            {/* Content */}
            {activeTab === 'ads' && (
              <div>

                {adsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-gray-100 rounded-xl h-32 animate-pulse"></div>
                    ))}
                  </div>
                ) : userAds.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Grid className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Aucune annonce
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {isOwner ? 'Vous n\'avez pas encore publié d\'annonce.' : `${user.firstName} n'a pas encore publié d'annonces.`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userAds.map((ad) => (
                      <div 
                        key={ad.id}
                        className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm"
                        onClick={() => navigate(`/annonce/${ad.id}`)}
                      >
                        <div className="flex">
                          <div className="w-24 h-24 flex-shrink-0">
                            <img
                              src={ad.photos[0] 
                                ? (ad.photos[0].startsWith('http') 
                                    ? ad.photos[0] 
                                    : `http://localhost:3000${ad.photos[0]}`
                                  )
                                : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop'
                              }
                              alt={ad.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 flex-1">
                                {ad.title}
                              </h3>
                              <button className="ml-2 p-1">
                                <Heart className="h-4 w-4 text-gray-400" />
                              </button>
                            </div>
                            <div className="flex items-center text-gray-500 mb-2">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span className="text-xs truncate">{ad.location}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="text-blue-600 font-bold text-sm">
                                {parseInt(ad.price.toString()).toLocaleString()} FCFA
                                <span className="text-xs text-gray-500 font-normal">/mois</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  <span>24</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-orange-400 text-orange-400" />
                                  <span>4.8</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'bookings' && isOwner && (
              <div className="space-y-4">
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune réservation
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Vos réservations apparaîtront ici.
                  </p>
                </div>
              </div>
            )}
            
            {activeTab === 'requests' && isOwner && (
              <div className="space-y-4">
                {requestsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-gray-100 rounded-xl h-24 animate-pulse"></div>
                    ))}
                  </div>
                ) : userRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Aucune demande
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Vous n'avez pas encore créé de demande.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userRequests.map((request: any) => (
                      <div 
                        key={request.id}
                        className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 
                            className="font-semibold text-gray-900 text-sm line-clamp-1 flex-1 cursor-pointer hover:text-blue-600"
                            onClick={() => navigate(`/requests/${request.id}`)}
                          >
                            {request.title}
                          </h3>
                          <div className="flex items-center gap-1 ml-2">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                              {request.category.name}
                            </span>
                            <button
                              onClick={() => navigate(`/requests?edit=${request.id}`)}
                              className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => setDeleteRequestId(request.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <p 
                          className="text-gray-600 text-sm mb-3 line-clamp-2 cursor-pointer"
                          onClick={() => navigate(`/requests/${request.id}`)}
                        >
                          {request.description}
                        </p>
                        <div 
                          className="flex items-center justify-between text-xs text-gray-500 cursor-pointer"
                          onClick={() => navigate(`/requests/${request.id}`)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{request.location}</span>
                            </div>
                            {request.maxBudget && (
                              <span className="font-semibold text-green-600">
                                {Math.round(request.maxBudget).toLocaleString()} FCFA
                              </span>
                            )}
                          </div>
                          <span>
                            {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <AdModal 
        ad={selectedAd}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
      
      {user && (
        <MessageModal
          isOpen={isMessageModalOpen}
          onClose={() => setIsMessageModalOpen(false)}
          adId="" // Pas d'annonce spécifique pour un contact direct
          adTitle={`Contact avec ${user.firstName} ${user.lastName}`}
          otherUserId={user.id}
          otherUserName={`${user.firstName} ${user.lastName}`}
        />
      )}
      
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={getProfileForEdit()}
        onProfileUpdated={handleProfileUpdated}
      />
      
      {!isOwner && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          type="user"
          targetId={user.id}
          targetTitle={`${user.firstName} ${user.lastName}`}
        />
      )}
      
      <ShareProfileModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        profileUrl={`${window.location.origin}/user/${user.id}`}
        userName={`${user.firstName} ${user.lastName}`}
      />
      
      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        profileUrl={`${window.location.origin}/user/${user.id}`}
        userName={`${user.firstName} ${user.lastName}`}
      />
      
      {/* Modal de confirmation de suppression */}
      {deleteRequestId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Supprimer la demande</h3>
            <p className="text-gray-600 mb-6">Êtes-vous sûr de vouloir supprimer cette demande ? Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteRequestId(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteRequest(deleteRequestId)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};