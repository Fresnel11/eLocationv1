import React, { useState, useEffect } from 'react';
import { Search, Plus, MapPin, Clock, MessageCircle, User, Filter, Eye, Edit } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { CreateRequestModal } from '../components/ui/CreateRequestModal';
import { RespondToRequestModal } from '../components/ui/RespondToRequestModal';
import { ClickableAvatar } from '../components/ui/ClickableAvatar';

interface Request {
  id: string;
  title: string;
  description: string;
  location: string;
  maxBudget?: number;
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  desiredAmenities: string[];
  isActive: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  userId: string;
  category: {
    id: string;
    name: string;
  };
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

export const RequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isRespondModalOpen, setIsRespondModalOpen] = useState(false);
  const [editRequest, setEditRequest] = useState<Request | null>(null);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a moins d\'1h';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays}j`;
  };

  const isModified = (request: Request) => {
    return new Date(request.updatedAt).getTime() > new Date(request.createdAt).getTime();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header iOS Style */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Demandes</h1>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-3 sm:px-6 py-2 shadow-lg text-sm"
            >
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Nouvelle demande</span>
            </Button>
          </div>
          
          {/* Search Bar iOS Style */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher une demande..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="bg-white rounded-2xl shadow-sm border-0 overflow-hidden hover:shadow-md transition-all duration-300">
                <div className="p-4 sm:p-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
                    <div className="flex-1">
                      <h3 
                        className="text-base sm:text-lg font-semibold text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => navigate(`/requests/${request.id}`)}
                      >
                        {request.title}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{request.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 flex-shrink-0" />
                          <span className="text-xs sm:text-sm">
                            {isModified(request) 
                              ? `Modifié ${getTimeAgo(request.updatedAt)}`
                              : `Publié ${getTimeAgo(request.createdAt)}`
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2 justify-between sm:justify-start">
                      <span className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full text-xs font-medium">
                        {request.category.name}
                      </span>
                      {request.maxBudget && (
                        <span className="text-base sm:text-lg font-bold text-green-600">
                          {Math.round(request.maxBudget).toLocaleString()} FCFA
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {request.description}
                  </p>

                  {/* Details - uniquement pour Immobilier */}
                  {request.category.name === 'Immobilier' && (request.bedrooms || request.bathrooms || request.minArea) && (
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 text-sm text-gray-600">
                      {request.bedrooms && (
                        <span className="bg-gray-100 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm">
                          {request.bedrooms} ch.
                        </span>
                      )}
                      {request.bathrooms && (
                        <span className="bg-gray-100 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm">
                          {request.bathrooms} sdb
                        </span>
                      )}
                      {request.minArea && (
                        <span className="bg-gray-100 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm">
                          {request.minArea}m² min
                        </span>
                      )}
                    </div>
                  )}

                  {/* Amenities */}
                  {request.desiredAmenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {request.desiredAmenities.slice(0, 3).map((amenity) => (
                        <span key={amenity} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs">
                          {amenity}
                        </span>
                      ))}
                      {request.desiredAmenities.length > 3 && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs">
                          +{request.desiredAmenities.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-100 gap-3">
                    <div className="flex items-center gap-3">
                      <ClickableAvatar
                        avatarUrl={request.user.profilePicture}
                        userName={`${request.user.firstName} ${request.user.lastName}`}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <Link 
                          to={`/user/${request.user.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors cursor-pointer truncate block"
                        >
                          {request.user.firstName} {request.user.lastName}
                        </Link>
                        <p className="text-xs text-gray-500">Demandeur</p>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500 sm:hidden">
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-sm">0</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                      <div className="hidden sm:flex items-center gap-1 text-gray-500">
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-sm">0</span>
                      </div>
                      
                      {/* Bouton modifier - visible uniquement pour le propriétaire */}
                      {user?.id === request.userId && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setEditRequest(request);
                            setIsCreateModalOpen(true);
                          }}
                          className="rounded-lg px-2 sm:px-3 py-2 text-orange-600 border-orange-200 hover:bg-orange-50 text-xs sm:text-sm"
                        >
                          <Edit className="h-4 w-4 sm:mr-1" />
                          <span className="hidden sm:inline">Modifier</span>
                        </Button>
                      )}
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/requests/${request.id}`)}
                        className="rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm"
                      >
                        <Eye className="h-4 w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Voir</span>
                      </Button>
                      
                      {/* Bouton répondre - masqué pour le propriétaire */}
                      {user?.id !== request.userId && (
                        <Button 
                          size="sm" 
                          onClick={() => {
                            setSelectedRequest(request);
                            setIsRespondModalOpen(true);
                          }}
                          className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm"
                        >
                          Répondre
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && requests.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune demande trouvée
            </h3>
            <p className="text-gray-600 mb-6">
              Soyez le premier à publier une demande de location
            </p>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-6 py-3"
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer une demande
            </Button>
          </div>
        )}
      </div>

      {/* Modal de création/modification */}
      <CreateRequestModal 
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditRequest(null);
        }}
        editRequest={editRequest ? {
          id: editRequest.id,
          title: editRequest.title,
          description: editRequest.description,
          location: editRequest.location,
          maxBudget: editRequest.maxBudget,
          bedrooms: editRequest.bedrooms,
          bathrooms: editRequest.bathrooms,
          minArea: editRequest.minArea,
          categoryId: editRequest.categoryId,
          desiredAmenities: editRequest.desiredAmenities
        } : undefined}
        onSuccess={() => {
          // Recharger les demandes
          fetchRequests();
        }}
      />

      {/* Modal de réponse */}
      {selectedRequest && (
        <RespondToRequestModal 
          isOpen={isRespondModalOpen}
          onClose={() => {
            setIsRespondModalOpen(false);
            setSelectedRequest(null);
          }}
          request={selectedRequest}
          onSuccess={() => {
            // Optionnel: recharger les demandes ou afficher un message
            fetchRequests();
          }}
        />
      )}
    </div>
  );
};