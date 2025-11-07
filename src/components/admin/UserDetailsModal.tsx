import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Calendar, Home, MapPin } from 'lucide-react';
import { api } from '../../services/api';

interface UserDetailsModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  userId,
  isOpen,
  onClose,
}) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetails();
    }
  }, [isOpen, userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/users/${userId}`);
      setUser(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des détails:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Détails de l'utilisateur</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : user ? (
            <div className="space-y-6">
              {/* Informations personnelles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Nom complet</p>
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Téléphone</p>
                    <p className="font-medium">{user.phone || 'Non renseigné'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Inscription</p>
                    <p className="font-medium">{new Date(user.createdAt).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              </div>

              {/* Statistiques */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{user.stats?.adsCount || 0}</p>
                  <p className="text-sm text-gray-600">Annonces</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{user.stats?.bookingsCount || 0}</p>
                  <p className="text-sm text-gray-600">Réservations</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{user.payments?.length || 0}</p>
                  <p className="text-sm text-gray-600">Paiements</p>
                </div>
              </div>

              {/* Statut et rôle */}
              <div className="flex flex-wrap gap-4">
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                  user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.isActive ? 'Compte actif' : 'Compte inactif'}
                </span>
                
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                  user.role?.name === 'admin' ? 'bg-purple-100 text-purple-800' :
                  user.role?.name === 'super_admin' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {user.role?.name === 'admin' ? 'Administrateur' :
                   user.role?.name === 'super_admin' ? 'Super Administrateur' :
                   'Utilisateur'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">Impossible de charger les détails</p>
          )}
        </div>
      </div>
    </div>
  );
};