import React, { useState, useEffect } from 'react';
import { X, MapPin, DollarSign, Home, Bath } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface SearchAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAlertCreated: () => void;
}

interface Category {
  id: string;
  name: string;
}

export const SearchAlertModal: React.FC<SearchAlertModalProps> = ({
  isOpen,
  onClose,
  onAlertCreated,
}) => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    categoryId: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des catégories:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const alertData = {
        name: formData.name,
        location: formData.location || undefined,
        categoryId: formData.categoryId || undefined,
        minPrice: formData.minPrice ? parseFloat(formData.minPrice) : undefined,
        maxPrice: formData.maxPrice ? parseFloat(formData.maxPrice) : undefined,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
      };

      await api.post('/notifications/search-alerts', alertData);
      success('Alerte créée', 'Vous serez notifié des nouvelles annonces correspondantes');
      onAlertCreated();
      onClose();
      setFormData({
        name: '',
        location: '',
        categoryId: '',
        minPrice: '',
        maxPrice: '',
        bedrooms: '',
        bathrooms: '',
      });
    } catch (err: any) {
      error('Erreur', err.response?.data?.message || 'Impossible de créer l\'alerte');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">Créer une alerte de recherche</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Nom de l'alerte"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            placeholder="Ex: Appartement centre-ville"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 inline mr-1" />
              Localisation
            </label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Ex: Cotonou, Porto-Novo..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes les catégories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Prix min (FCFA)
              </label>
              <Input
                type="number"
                value={formData.minPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, minPrice: e.target.value }))}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix max (FCFA)
              </label>
              <Input
                type="number"
                value={formData.maxPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, maxPrice: e.target.value }))}
                placeholder="∞"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Home className="h-4 w-4 inline mr-1" />
                Chambres min
              </label>
              <Input
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData(prev => ({ ...prev, bedrooms: e.target.value }))}
                placeholder="0"
                min="0"
                max="10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Bath className="h-4 w-4 inline mr-1" />
                Salles de bain min
              </label>
              <Input
                type="number"
                value={formData.bathrooms}
                onChange={(e) => setFormData(prev => ({ ...prev, bathrooms: e.target.value }))}
                placeholder="0"
                min="0"
                max="10"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="flex-1"
            >
              Créer l'alerte
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};