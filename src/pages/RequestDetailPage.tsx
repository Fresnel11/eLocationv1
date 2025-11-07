import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, DollarSign, User, Phone, Mail, Calendar, MessageCircle, Star, Image, Eye } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { RespondToRequestModal } from '../components/ui/RespondToRequestModal';

interface RequestDetail {
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
  };
  category: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  responses?: Response[];
}

interface Response {
  id: string;
  message: string;
  proposedPrice?: number;
  contactPhone: string;
  contactEmail?: string;
  availableFrom?: string;
  images: string[];
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export const RequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRespondModalOpen, setIsRespondModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRequestDetail(id);
    }
  }, [id]);

  const fetchRequestDetail = async (requestId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      // Récupérer la demande
      const requestResponse = await fetch(`http://localhost:3000/requests/${requestId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (requestResponse.ok) {
        const requestData = await requestResponse.json();
        
        // Récupérer les réponses
        const responsesResponse = await fetch(`http://localhost:3000/responses/request/${requestId}`);
        const responsesData = responsesResponse.ok ? await responsesResponse.json() : [];
        
        setRequest({ ...requestData, responses: responsesData });
      } else {
        console.error('Erreur lors du chargement de la demande');
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la demande:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a moins d\'1h';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays}j`;
  };

  const isModified = (request: RequestDetail) => {
    return new Date(request.updatedAt).getTime() > new Date(request.createdAt).getTime();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Demande introuvable</h2>
          <p className="text-gray-600 mb-4">Cette demande n'existe pas ou a été supprimée.</p>
          <Button onClick={() => navigate('/requests')}>
            Retour aux demandes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/requests')}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Détail de la demande</h1>
              <p className="text-sm text-gray-500">
                {isModified(request) 
                  ? `Modifié ${getTimeAgo(request.updatedAt)}`
                  : `Publié ${getTimeAgo(request.createdAt)}`
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Request Details */}
        <Card className="bg-white rounded-xl sm:rounded-2xl shadow-sm border-0 overflow-hidden">
          <div className="p-4 sm:p-6">
            {/* Mobile layout */}
            <div className="block sm:hidden">
              <div className="mb-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                  {request.category.name}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{request.title}</h2>
              <div className="flex flex-col gap-2 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{request.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {isModified(request) 
                      ? `Modifié ${getTimeAgo(request.updatedAt)}`
                      : `Publié ${getTimeAgo(request.createdAt)}`
                    }
                  </span>
                </div>
              </div>
              {request.maxBudget && (
                <div className="bg-green-50 p-3 rounded-lg mb-4">
                  <p className="text-xs text-green-600 mb-1">Budget maximum</p>
                  <span className="text-lg font-bold text-green-700">
                    {Math.round(request.maxBudget).toLocaleString()} FCFA
                  </span>
                </div>
              )}
            </div>
            
            {/* Desktop layout */}
            <div className="hidden sm:block">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">{request.title}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{request.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        {isModified(request) 
                          ? `Modifié ${getTimeAgo(request.updatedAt)}`
                          : `Publié ${getTimeAgo(request.createdAt)}`
                        }
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {request.category.name}
                  </span>
                  {request.maxBudget && (
                    <span className="text-xl font-bold text-green-600">
                      {Math.round(request.maxBudget).toLocaleString()} FCFA max
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-gray-700 mb-6 leading-relaxed">{request.description}</p>

            {/* Criteria - uniquement pour Immobilier */}
            {request.category.name === 'Immobilier' && (request.bedrooms || request.bathrooms || request.minArea) && (
              <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 sm:mb-6">
                {request.bedrooms && (
                  <span className="bg-gray-100 px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium">
                    {request.bedrooms} chambres min
                  </span>
                )}
                {request.bathrooms && (
                  <span className="bg-gray-100 px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium">
                    {request.bathrooms} sdb min
                  </span>
                )}
                {request.minArea && (
                  <span className="bg-gray-100 px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium">
                    {request.minArea}m² min
                  </span>
                )}
              </div>
            )}

            {/* Amenities */}
            {request.desiredAmenities.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Équipements souhaités :</h3>
                <div className="flex flex-wrap gap-2">
                  {request.desiredAmenities.map((amenity) => (
                    <span key={amenity} className="bg-blue-50 text-blue-700 px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Requester Info */}
            <div className="pt-4 border-t border-gray-100">
              {/* Mobile layout */}
              <div className="block sm:hidden">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {request.user.firstName[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {request.user.firstName} {request.user.lastName}
                    </p>
                    <p className="text-xs text-gray-500">Demandeur</p>
                  </div>
                </div>
                <Button 
                  onClick={() => setIsRespondModalOpen(true)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-3"
                >
                  Répondre à cette demande
                </Button>
              </div>
              
              {/* Desktop layout */}
              <div className="hidden sm:flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {request.user.firstName[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {request.user.firstName} {request.user.lastName}
                    </p>
                    <p className="text-sm text-gray-500">Demandeur</p>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setIsRespondModalOpen(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-6 py-2"
                >
                  Répondre à cette demande
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Responses */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 px-1">
            Réponses reçues ({request.responses?.length || 0})
          </h3>
          
          {request.responses && request.responses.length > 0 ? (
            <div className="space-y-6">
              {request.responses.map((response) => (
                <Card key={response.id} className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden">
                  <div className="p-4 sm:p-6">
                    {/* Mobile layout */}
                    <div className="block sm:hidden mb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {response.user.firstName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {response.user.firstName} {response.user.lastName}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {getTimeAgo(response.createdAt)}
                          </p>
                        </div>
                      </div>
                      {response.proposedPrice && (
                        <div className="bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                          <p className="text-xs text-green-600 font-medium mb-1">Prix proposé</p>
                          <span className="text-lg font-bold text-green-700">
                            {Math.round(response.proposedPrice).toLocaleString()}
                          </span>
                          <span className="text-sm text-green-600 ml-1">FCFA</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Desktop layout */}
                    <div className="hidden sm:flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {response.user.firstName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-lg">
                            {response.user.firstName} {response.user.lastName}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {getTimeAgo(response.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      {response.proposedPrice && (
                        <div className="text-right">
                          <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                            <p className="text-xs text-green-600 font-medium mb-1">Prix proposé</p>
                            <span className="text-xl font-bold text-green-700">
                              {Math.round(response.proposedPrice).toLocaleString()}
                            </span>
                            <span className="text-sm text-green-600 ml-1">FCFA</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Message */}
                    <div className="mb-4 sm:mb-6">
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                        <p className="text-gray-800 leading-relaxed text-sm sm:text-base">{response.message}</p>
                      </div>
                    </div>

                    {/* Images si présentes */}
                    {response.images && response.images.length > 0 && (
                      <div className="mb-4 sm:mb-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-2 sm:mb-3 flex items-center gap-2">
                          <Image className="h-4 w-4" />
                          Photos de l'offre
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                          {response.images.map((image, index) => (
                            <div key={index} className="relative group cursor-pointer">
                              <img
                                src={image}
                                alt={`Image ${index + 1}`}
                                className="w-full h-20 sm:h-24 lg:h-28 object-cover rounded-lg border border-gray-200 group-hover:shadow-lg transition-all duration-300"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-300 flex items-center justify-center">
                                <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Informations de contact */}
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-2 sm:mb-3">Informations de contact</h4>
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500">Téléphone</p>
                            <p className="font-medium text-gray-900 text-sm sm:text-base">{response.contactPhone}</p>
                          </div>
                        </div>
                        
                        {response.contactEmail && (
                          <div className="flex items-start gap-3">
                            <Mail className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-500">Email</p>
                              <p className="font-medium text-gray-900 break-all text-sm sm:text-base">{response.contactEmail}</p>
                            </div>
                          </div>
                        )}
                        
                        {response.availableFrom && (
                          <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500">Disponible</p>
                              <p className="font-medium text-gray-900 text-sm sm:text-base">
                                {new Date(response.availableFrom).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1 py-2 sm:py-1"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        <span className="text-sm">Contacter</span>
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 sm:py-1"
                      >
                        <Star className="h-4 w-4 mr-2" />
                        <span className="text-sm">Marquer comme intéressant</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100">
              <div className="p-8 sm:p-12 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                </div>
                <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Aucune réponse pour le moment</h4>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                  Soyez le premier à répondre à cette demande
                </p>
                <Button 
                  onClick={() => setIsRespondModalOpen(true)}
                  className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 sm:py-2"
                >
                  Répondre maintenant
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Response Modal */}
      <RespondToRequestModal 
        isOpen={isRespondModalOpen}
        onClose={() => setIsRespondModalOpen(false)}
        request={request}
        onSuccess={() => {
          // Recharger les réponses
          if (request.id) fetchRequestDetail(request.id);
        }}
      />
    </div>
  );
};