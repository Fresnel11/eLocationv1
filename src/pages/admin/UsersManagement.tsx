import React, { useState, useEffect } from 'react';
import { Eye, Edit, Trash2, UserCheck, UserX, Shield, MoreVertical, Plus } from 'lucide-react';
import { DataTable } from '../../components/admin/DataTable';
import { UserDetailsModal } from '../../components/admin/UserDetailsModal';
import { CreateUserModal } from '../../components/admin/CreateUserModal';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAdminAuth } from '../../hooks/useAdminAuth';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  role: {
    id: string;
    name: string;
  };
}

export const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [canCreateUser, setCanCreateUser] = useState(false);
  const { success, error } = useToast();
  const { isSuperAdmin } = useAdminAuth();

  useEffect(() => {
    fetchUsers();
    checkCreateUserPermission();
  }, [pagination.page, filters]);

  const checkCreateUserPermission = async () => {
    try {
      const response = await api.get('/admin/permissions/create_user');
      setCanCreateUser(response.data.hasPermission || isSuperAdmin);
    } catch (err) {
      setCanCreateUser(isSuperAdmin);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.role && { role: filters.role }),
        ...(filters.status && { status: filters.status }),
      });

      const response = await api.get(`/admin/users?${params}`);
      setUsers(response.data.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.total,
        totalPages: response.data.totalPages,
      }));
    } catch (err) {
      error('Erreur', 'Impossible de charger les utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      setActionLoading(userId);
      await api.put(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      success('Succès', `Utilisateur ${!currentStatus ? 'activé' : 'désactivé'} avec succès`);
      fetchUsers();
    } catch (err) {
      error('Erreur', 'Impossible de modifier le statut');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    
    try {
      setActionLoading(userId);
      await api.delete(`/admin/users/${userId}`);
      success('Succès', 'Utilisateur supprimé avec succès');
      fetchUsers();
    } catch (err: any) {
      error('Erreur', err.response?.data?.message || 'Impossible de supprimer l\'utilisateur');
    } finally {
      setActionLoading(null);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Utilisateur',
      render: (_, row: User) => (
        <div className="flex items-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-medium text-xs sm:text-sm">
              {row.firstName?.charAt(0)}{row.lastName?.charAt(0)}
            </span>
          </div>
          <div className="ml-2 sm:ml-3 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {row.firstName} {row.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Téléphone',
      render: (value: string) => value || '-',
    },
    {
      key: 'role',
      label: 'Rôle',
      render: (_, row: User) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          row.role?.name === 'admin' ? 'bg-purple-100 text-purple-800' :
          row.role?.name === 'super_admin' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {row.role?.name === 'admin' ? 'Admin' :
           row.role?.name === 'super_admin' ? 'Super Admin' :
           'Utilisateur'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      render: (_, row: User) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          row.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {row.isActive ? 'Actif' : 'Inactif'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Inscription',
      render: (value: string) => new Date(value).toLocaleDateString('fr-FR'),
    },
  ];

  const renderActions = (row: User) => (
    <div className="flex items-center space-x-1">
      <button
        onClick={() => setSelectedUserId(row.id)}
        className="p-1 sm:p-2 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
        title="Voir détails"
      >
        <Eye className="h-4 w-4" />
      </button>
      
      <button
        onClick={() => handleStatusToggle(row.id, row.isActive)}
        disabled={actionLoading === row.id}
        className={`p-1 sm:p-2 rounded-md transition-colors ${
          row.isActive 
            ? 'text-red-600 hover:bg-red-50' 
            : 'text-green-600 hover:bg-green-50'
        } disabled:opacity-50`}
        title={row.isActive ? 'Désactiver' : 'Activer'}
      >
        {row.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
      </button>
      
      <button
        onClick={() => handleDelete(row.id)}
        disabled={actionLoading === row.id}
        className="p-1 sm:p-2 rounded-md text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
        title="Supprimer"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  const renderFilters = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <select
        value={filters.role}
        onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
      >
        <option value="">Tous les rôles</option>
        <option value="user">Utilisateur</option>
        <option value="admin">Admin</option>
        <option value="super_admin">Super Admin</option>
      </select>
      
      <select
        value={filters.status}
        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
      >
        <option value="">Tous les statuts</option>
        <option value="active">Actif</option>
        <option value="inactive">Inactif</option>
      </select>
    </div>
  );

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Gérez les utilisateurs de la plateforme eLocation
            </p>
          </div>
          {canCreateUser && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer un utilisateur
            </button>
          )}
        </div>

        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          searchPlaceholder="Rechercher par nom ou email..."
          filters={renderFilters()}
          actions={renderActions}
        />
      </div>

      <UserDetailsModal
        userId={selectedUserId || ''}
        isOpen={!!selectedUserId}
        onClose={() => setSelectedUserId(null)}
      />

      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          fetchUsers();
        }}
      />
    </>
  );
};