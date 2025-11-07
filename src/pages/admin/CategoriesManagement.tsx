import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Folder, FolderOpen } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  subCategories?: SubCategory[];
}

interface SubCategory {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  createdAt: string;
}

export const CategoriesManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  const [modalType, setModalType] = useState<'category' | 'subcategory'>('category');
  const { success, error } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      const categoriesWithSubs = await Promise.all(
        response.data.map(async (category: Category) => {
          const subResponse = await api.get(`/subcategories?categoryId=${category.id}`);
          return { ...category, subCategories: subResponse.data };
        })
      );
      setCategories(categoriesWithSubs);
    } catch (err) {
      error('Erreur', 'Impossible de charger les catégories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = () => {
    setModalType('category');
    setSelectedCategory(null);
    setShowCreateModal(true);
  };

  const handleCreateSubCategory = (category: Category) => {
    setModalType('subcategory');
    setSelectedCategory(category);
    setSelectedSubCategory(null);
    setShowCreateModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setModalType('category');
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  const handleEditSubCategory = (subCategory: SubCategory) => {
    setModalType('subcategory');
    setSelectedSubCategory(subCategory);
    setShowEditModal(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;
    
    try {
      await api.delete(`/categories/${categoryId}`);
      success('Succès', 'Catégorie supprimée avec succès');
      fetchCategories();
    } catch (err: any) {
      error('Erreur', err.response?.data?.message || 'Impossible de supprimer la catégorie');
    }
  };

  const handleDeleteSubCategory = async (subCategoryId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette sous-catégorie ?')) return;
    
    try {
      await api.delete(`/subcategories/${subCategoryId}`);
      success('Succès', 'Sous-catégorie supprimée avec succès');
      fetchCategories();
    } catch (err: any) {
      error('Erreur', err.response?.data?.message || 'Impossible de supprimer la sous-catégorie');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Catégories</h1>
            <p className="text-gray-600">Gérez les catégories et sous-catégories de la plateforme</p>
          </div>
          <button
            onClick={handleCreateCategory}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle catégorie
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="divide-y divide-gray-200">
            {categories.map((category) => (
              <div key={category.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Folder className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-gray-500">{category.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCreateSubCategory(category)}
                      className="text-green-600 hover:text-green-800"
                      title="Ajouter une sous-catégorie"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {category.subCategories && category.subCategories.length > 0 && (
                  <div className="ml-8 space-y-2">
                    {category.subCategories.map((subCategory) => (
                      <div key={subCategory.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <FolderOpen className="h-4 w-4 text-gray-500 mr-2" />
                          <div>
                            <span className="text-sm font-medium text-gray-900">{subCategory.name}</span>
                            {subCategory.description && (
                              <p className="text-xs text-gray-500">{subCategory.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditSubCategory(subCategory)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Modifier"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteSubCategory(subCategory.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Supprimer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de création */}
      {showCreateModal && (
        <CategoryModal
          type={modalType}
          category={selectedCategory}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchCategories();
          }}
        />
      )}

      {/* Modal d'édition */}
      {showEditModal && (
        <CategoryModal
          type={modalType}
          category={selectedCategory}
          subCategory={selectedSubCategory}
          isEdit={true}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            fetchCategories();
          }}
        />
      )}
    </>
  );
};

// Modal pour créer/éditer catégories et sous-catégories
const CategoryModal: React.FC<{
  type: 'category' | 'subcategory';
  category?: Category | null;
  subCategory?: SubCategory | null;
  isEdit?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ type, category, subCategory, isEdit = false, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: isEdit ? (type === 'category' ? category?.name || '' : subCategory?.name || '') : '',
    description: isEdit ? (type === 'category' ? category?.description || '' : subCategory?.description || '') : ''
  });
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (type === 'category') {
        if (isEdit && category) {
          await api.put(`/categories/${category.id}`, formData);
          success('Succès', 'Catégorie modifiée avec succès');
        } else {
          await api.post('/categories', formData);
          success('Succès', 'Catégorie créée avec succès');
        }
      } else {
        if (isEdit && subCategory) {
          await api.put(`/subcategories/${subCategory.id}`, formData);
          success('Succès', 'Sous-catégorie modifiée avec succès');
        } else {
          await api.post('/subcategories', { ...formData, categoryId: category?.id });
          success('Succès', 'Sous-catégorie créée avec succès');
        }
      }
      onSuccess();
    } catch (err: any) {
      error('Erreur', err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
          <h3 className="text-lg font-medium mb-4">
            {isEdit ? 'Modifier' : 'Créer'} {type === 'category' ? 'une catégorie' : 'une sous-catégorie'}
            {type === 'subcategory' && category && (
              <span className="text-sm text-gray-500 block">dans {category.name}</span>
            )}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Nom de la catégorie"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (optionnel)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Description de la catégorie"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg">
                Annuler
              </button>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">
                {loading ? 'En cours...' : (isEdit ? 'Modifier' : 'Créer')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};