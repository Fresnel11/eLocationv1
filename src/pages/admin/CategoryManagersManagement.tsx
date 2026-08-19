import React, { useState, useEffect } from 'react';
import { Edit } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface Category {
  id: string;
  name: string;
}

interface CategoryManager {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  isActive: boolean;
  managedCategories: Category[];
}

export const CategoryManagersManagement: React.FC = () => {
  const [managers, setManagers] = useState<CategoryManager[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingManager, setEditingManager] = useState<CategoryManager | null>(null);
  const { success, error } = useToast();

  useEffect(() => {
    fetchManagers();
    fetchCategories();
  }, []);

  const fetchManagers = async () => {
    try {
      const response = await api.get('/admin/category-managers');
      setManagers(response.data);
    } catch (err) {
      error('Erreur', 'Impossible de charger les gestionnaires de catégorie');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (err) {
      error('Erreur', 'Impossible de charger les catégories');
    }
  };

  const handleAssignCategories = async (userId: string, categoryIds: string[]) => {
    try {
      await api.put(`/admin/category-managers/${userId}/categories`, { categoryIds });
      success('Succès', 'Catégories déléguées mises à jour avec succès');
      fetchManagers();
      setEditingManager(null);
    } catch (err) {
      error('Erreur', 'Impossible de mettre à jour les catégories déléguées');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Délégations par catégorie</h1>
          <p className="text-gray-600">
            Les comptes ayant le rôle « Gestionnaire de catégorie » ne voient et ne peuvent gérer que les
            annonces, réservations, sous-catégories et avis des catégories qui leur sont assignées ici.
            Le compte lui-même se crée depuis « Utilisateurs » avec le rôle « Gestionnaire de catégorie ».
          </p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Gestionnaires de catégorie</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {managers.map((manager) => (
              <div key={manager.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {manager.firstName} {manager.lastName}
                      {!manager.isActive && (
                        <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Inactif</span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-500">{manager.email || 'Pas d\'email'}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {manager.managedCategories?.map((category) => (
                        <span
                          key={category.id}
                          className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full"
                        >
                          {category.name}
                        </span>
                      ))}
                      {(!manager.managedCategories || manager.managedCategories.length === 0) && (
                        <span className="text-xs text-gray-400">Aucune catégorie assignée — ce compte n'a accès à rien</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingManager(manager)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {managers.length === 0 && (
              <div className="p-8 text-center text-gray-500 text-sm">
                Aucun compte avec le rôle « Gestionnaire de catégorie » pour l'instant.
              </div>
            )}
          </div>
        </div>

        {editingManager && (
          <AssignCategoriesModal
            manager={editingManager}
            categories={categories}
            onClose={() => setEditingManager(null)}
            onSuccess={(userId, categoryIds) => handleAssignCategories(userId, categoryIds)}
          />
        )}
      </div>
    </AdminLayout>
  );
};

const AssignCategoriesModal: React.FC<{
  manager: CategoryManager;
  categories: Category[];
  onClose: () => void;
  onSuccess: (userId: string, categoryIds: string[]) => void;
}> = ({ manager, categories, onClose, onSuccess }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    manager.managedCategories?.map((c) => c.id) || []
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onSuccess(manager.id, selectedCategories);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
          <h3 className="text-lg font-medium mb-4">
            Catégories déléguées à {manager.firstName} {manager.lastName}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Catégories</label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCategories((prev) => [...prev, category.id]);
                        } else {
                          setSelectedCategories((prev) => prev.filter((id) => id !== category.id));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg">
                Annuler
              </button>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">
                {loading ? 'Mise à jour...' : 'Mettre à jour'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
