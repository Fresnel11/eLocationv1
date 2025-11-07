import React, { useState } from 'react';
import { X, Send, Phone, Mail, MapPin, DollarSign, Image, Plus } from 'lucide-react';
import { Button } from './Button';
import { useToast } from '../../context/ToastContext';

interface RespondToRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: {
    id: string;
    title: string;
    description: string;
    location: string;
    maxBudget?: number;
    user: {
      firstName: string;
      lastName: string;
    };
  };
  onSuccess?: () => void;
}

export const RespondToRequestModal: React.FC<RespondToRequestModalProps> = ({ 
  isOpen, 
  onClose, 
  request,
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    message: '',
    proposedPrice: '',
    contactPhone: '',
    contactEmail: '',
    availableFrom: '',
    images: [] as File[]
  });
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (formData.images.length + files.length > 3) {
      error('Limite dépassée', 'Vous ne pouvez ajouter que 3 images maximum.');
      return;
    }
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const responseData = {
        message: formData.message,
        proposedPrice: formData.proposedPrice ? parseFloat(formData.proposedPrice) : undefined,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail || undefined,
        availableFrom: formData.availableFrom || undefined,
        images: [] // TODO: Handle image upload
      };

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/responses/request/${request.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(responseData)
      });

      if (response.ok) {
        success('Réponse envoyée !', 'Votre réponse a été envoyée avec succès.');
        onSuccess?.();
        onClose();
      } else {
        throw new Error('Erreur lors de l\'envoi');
      }
      
      // Reset form
      setFormData({
        message: '',
        proposedPrice: '',
        contactPhone: '',
        contactEmail: '',
        availableFrom: '',
        images: []
      });
    } catch (err: any) {
      error('Erreur', 'Une erreur est survenue lors de l\'envoi de votre réponse.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Répondre à la demande</h2>
                <div className="bg-blue-50 rounded-xl p-4">
                  <h3 className="font-semibold text-blue-900 mb-1">{request.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-blue-700">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{request.location}</span>
                    </div>
                    {request.maxBudget && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{Math.round(request.maxBudget).toLocaleString()} FCFA max</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-blue-600 mt-2">
                    Demandé par {request.user.firstName} {request.user.lastName}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="ml-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="p-6 space-y-6">
              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Votre proposition *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder="Décrivez votre offre, ce que vous proposez, les conditions..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Prix et Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix proposé (FCFA)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="number"
                      value={formData.proposedPrice}
                      onChange={(e) => handleInputChange('proposedPrice', e.target.value)}
                      placeholder="120000"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Disponible à partir du
                  </label>
                  <input
                    type="date"
                    value={formData.availableFrom}
                    onChange={(e) => handleInputChange('availableFrom', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone de contact *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="tel"
                      required
                      value={formData.contactPhone}
                      onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                      placeholder="+229 XX XX XX XX"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email de contact
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                      placeholder="votre@email.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Photos de votre offre (optionnel, 3 max)
                </label>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  
                  {formData.images.length < 3 && (
                    <label className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                      <Plus className="h-6 w-6 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-500">Ajouter</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 order-2 sm:order-1"
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="flex-1 order-1 sm:order-2 bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {loading ? 'Envoi...' : 'Envoyer ma réponse'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};