import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Lock, Bell, Shield, Trash2, Eye, EyeOff, Save, Edit, Camera } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  whatsappNumber?: string;
  gender?: string;
  birthDate?: string;
  profile?: {
    avatar?: string;
    bio?: string;
    address?: string;
  };
}

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'privacy'>('profile');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState<UserProfile>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    whatsappNumber: user?.whatsappNumber || '',
    gender: user?.gender || '',
    birthDate: user?.birthDate || '',
    profile: {
      avatar: user?.profile?.avatar || '',
      bio: user?.profile?.bio || '',
      address: user?.profile?.address || ''
    }
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false
  });

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      const profileData = response.data;
      
      setProfileData({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: profileData.phone || '',
        whatsappNumber: user?.whatsappNumber || '',
        gender: user?.gender || '',
        birthDate: user?.birthDate || '',
        profile: {
          avatar: profileData.avatar || '',
          bio: profileData.bio || '',
          address: profileData.address || ''
        }
      });
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updateData = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
        whatsappNumber: profileData.whatsappNumber,
        bio: profileData.profile?.bio,
        address: profileData.profile?.address,
        avatar: profileData.profile?.avatar
      };
      await api.patch('/users/profile', updateData);
      alert('Profil mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    try {
      await api.patch('/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      alert('Mot de passe mis à jour avec succès');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      alert('Erreur lors de la mise à jour du mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      try {
        await api.delete('/users/account');
        logout();
        navigate('/');
      } catch (error) {
        console.error('Erreur lors de la suppression du compte:', error);
        alert('Erreur lors de la suppression du compte');
      }
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'security', label: 'Sécurité', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Confidentialité', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-200/50">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Retour</span>
          </button>
          <h1 className="text-lg font-bold text-gray-900">Paramètres</h1>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-12">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white/50 rounded-lg transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Retour</span>
            </button>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Paramètres du compte</h1>
              <p className="text-gray-600">Gérez vos préférences et paramètres de sécurité</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 sticky top-8">
              <div className="p-2">
                <div className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`w-full flex items-center gap-3 px-4 py-4 text-left transition-all duration-200 rounded-xl ${
                          activeTab === tab.id
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-semibold">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-4">
            {activeTab === 'profile' && (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20">
                <div className="p-8">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Informations personnelles</h2>
                    <p className="text-gray-600">Mettez à jour vos informations de profil</p>
                  </div>
                  <form onSubmit={handleProfileUpdate} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Prénom
                        </label>
                        <input
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                          className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white"
                          placeholder="Votre prénom"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Nom
                        </label>
                        <input
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                          className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white"
                          placeholder="Votre nom"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white"
                        placeholder="votre@email.com"
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Téléphone
                        </label>
                        <input
                          type="tel"
                          value={profileData.phone || ''}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white"
                          placeholder="+229 XX XX XX XX"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          WhatsApp
                        </label>
                        <input
                          type="tel"
                          value={profileData.whatsappNumber || ''}
                          onChange={(e) => setProfileData({...profileData, whatsappNumber: e.target.value})}
                          className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white"
                          placeholder="+229 XX XX XX XX"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        Adresse
                      </label>
                      <input
                        type="text"
                        value={profileData.profile?.address || ''}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          profile: {...profileData.profile, address: e.target.value}
                        })}
                        className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white"
                        placeholder="Votre adresse"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        Bio
                      </label>
                      <textarea
                        rows={5}
                        value={profileData.profile?.bio || ''}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          profile: {...profileData.profile, bio: e.target.value}
                        })}
                        className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white resize-none"
                        placeholder="Parlez-nous de vous..."
                      />
                    </div>

                    <div className="pt-4">
                      <Button type="submit" disabled={loading} className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/25 transition-all duration-200">
                        <Save className="h-5 w-5 mr-3" />
                        {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20">
                  <div className="p-8">
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Changer le mot de passe</h2>
                      <p className="text-gray-600">Assurez-vous d'utiliser un mot de passe fort</p>
                    </div>
                    <form onSubmit={handlePasswordUpdate} className="space-y-8">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Mot de passe actuel
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                            className="w-full px-5 py-4 pr-14 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white"
                            placeholder="Votre mot de passe actuel"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Nouveau mot de passe
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            className="w-full px-5 py-4 pr-14 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white"
                            placeholder="Votre nouveau mot de passe"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Confirmer le nouveau mot de passe
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                            className="w-full px-5 py-4 pr-14 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white"
                            placeholder="Confirmez votre nouveau mot de passe"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>

                      <div className="pt-4">
                        <Button type="submit" disabled={loading} className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/25 transition-all duration-200">
                          <Lock className="h-5 w-5 mr-3" />
                          {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20">
                <div className="p-8">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Préférences de notification</h2>
                    <p className="text-gray-600">Gérez comment vous souhaitez être notifié</p>
                  </div>
                  <div className="space-y-8">
                    {Object.entries({
                      emailNotifications: 'Notifications par email',
                      pushNotifications: 'Notifications push',
                      smsNotifications: 'Notifications SMS',
                      marketingEmails: 'Emails marketing'
                    }).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between p-6 bg-gray-50/50 rounded-xl border border-gray-100 hover:bg-white transition-all duration-200">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{label}</h3>
                          <p className="text-gray-600">
                            {key === 'emailNotifications' && 'Recevez des notifications importantes par email'}
                            {key === 'pushNotifications' && 'Recevez des notifications sur votre appareil'}
                            {key === 'smsNotifications' && 'Recevez des notifications par SMS'}
                            {key === 'marketingEmails' && 'Recevez nos offres et actualités'}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-6">
                          <input
                            type="checkbox"
                            checked={notificationSettings[key as keyof typeof notificationSettings]}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings,
                              [key]: e.target.checked
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20">
                <div className="p-8">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Confidentialité et sécurité</h2>
                    <p className="text-gray-600">Gérez vos paramètres de confidentialité</p>
                  </div>
                  <div className="space-y-8">
                    <div className="bg-gradient-to-r from-red-50 to-red-100/50 border-2 border-red-200 rounded-2xl p-4 sm:p-8">
                      <div className="flex flex-col sm:flex-row items-start gap-4">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Trash2 className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="flex-1 w-full">
                          <h3 className="text-lg sm:text-xl font-bold text-red-900 mb-3">Zone de danger</h3>
                          <p className="text-red-700 mb-6 leading-relaxed text-sm sm:text-base">
                            La suppression de votre compte est irréversible. Toutes vos données, annonces et messages seront définitivement supprimés.
                          </p>
                          <Button
                            variant="destructive"
                            onClick={handleDeleteAccount}
                            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl font-semibold shadow-lg shadow-red-600/25 transition-all duration-200"
                          >
                            <Trash2 className="h-5 w-5 mr-3" />
                            Supprimer mon compte
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};