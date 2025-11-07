import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Shield, Users } from 'lucide-react';

import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface Permission {
  id: string;
  name: string;
  description: string;
  isSystemPermission: boolean;
  createdAt: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  permissions: Permission[];
}

export const PermissionsManagement: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { success, error } = useToast();

  useEffect(() => {
    fetchPermissions();
    fetchUsers();
  }, []);

  const fetchPermissions = async () => {
    try {
      const response = await api.get('/admin/permissions');
      setPermissions(response.data);
    } catch (err) {
      error('Erreur', 'Impossible de charger les permissions');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users/with-permissions');
      setUsers(response.data);
    } catch (err) {
      error('Erreur', 'Impossible de charger les utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePermission = async (permissionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette permission ?')) return;
    
    try {
      await api.delete(`/admin/permissions/${permissionId}`);
      success('Succès', 'Permission supprimée avec succès');
      fetchPermissions();
    } catch (err: any) {
      error('Erreur', err.response?.data?.message || 'Impossible de supprimer la permission');
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
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des Permissions</h1>
            <p className="text-gray-600">Gérez les permissions système et leur attribution</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Créer une permission
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Liste des permissions */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Permissions disponibles</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {permissions.map((permission) => (
                <div key={permission.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium text-gray-900">{permission.name}</h3>
                        {permission.isSystemPermission && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            Système
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{permission.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Créée le {new Date(permission.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    {!permission.isSystemPermission && (
                      <button
                        onClick={() => handleDeletePermission(permission.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Attribution des permissions */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Attribution des permissions</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {users.filter(user => user.permissions?.length > 0).map((user) => (
                <div key={user.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {user.permissions.map((permission) => (
                          <span
                            key={permission.id}
                            className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                          >
                            {permission.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowAssignModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="p-4">
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="w-full text-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  + Attribuer des permissions à un utilisateur
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de création de permission */}
        {showCreateModal && (
          <CreatePermissionModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              fetchPermissions();
            }}
          />
        )}

        {/* Modal d'attribution de permissions */}
        {showAssignModal && (
          <AssignPermissionModal
            users={users}
            permissions={permissions}
            selectedUser={selectedUser}
            onClose={() => {
              setShowAssignModal(false);
              setSelectedUser(null);
            }}
            onSuccess={() => {
              setShowAssignModal(false);
              setSelectedUser(null);
              fetchUsers();
            }}
          />
        )}
      </div>
    </div>
  );
};

// Modal de création de permission
const CreatePermissionModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/admin/permissions', formData);
      success('Succès', 'Permission créée avec succès');
      onSuccess();
    } catch (err: any) {
      error('Erreur', err.response?.data?.message || 'Impossible de créer la permission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
          <h3 className="text-lg font-medium mb-4">Créer une permission</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="ex: manage_products"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Description de la permission"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg">
                Annuler
              </button>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">
                {loading ? 'Création...' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Modal d'attribution de permissions
const AssignPermissionModal: React.FC<{
  users: User[];
  permissions: Permission[];
  selectedUser: User | null;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ users, permissions, selectedUser, onClose, onSuccess }) => {
  const [selectedUserId, setSelectedUserId] = useState(selectedUser?.id || '');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    selectedUser?.permissions?.map(p => p.id) || []
  );
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put(`/admin/users/${selectedUserId}/permissions`, {
        permissionIds: selectedPermissions
      });
      success('Succès', 'Permissions mises à jour avec succès');
      onSuccess();
    } catch (err: any) {
      error('Erreur', err.response?.data?.message || 'Impossible de mettre à jour les permissions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
          <h3 className="text-lg font-medium mb-4">Attribuer des permissions</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Utilisateur</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionner un utilisateur</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {permissions.map((permission) => (
                  <label key={permission.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(permission.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPermissions(prev => [...prev, permission.id]);
                        } else {
                          setSelectedPermissions(prev => prev.filter(id => id !== permission.id));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{permission.name} - {permission.description}</span>
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