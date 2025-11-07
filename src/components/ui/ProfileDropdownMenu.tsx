import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Shield, BarChart3, Download, LogOut, UserX, Flag, Copy, EyeOff, QrCode, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';


interface ProfileDropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isOwner: boolean;
  userName: string;
  profileUrl: string;
  userId?: string;
  onShowQRModal?: () => void;
}

export const ProfileDropdownMenu: React.FC<ProfileDropdownMenuProps> = ({
  isOpen,
  onClose,
  isOwner,
  userName,
  profileUrl,
  userId,
  onShowQRModal
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { showToast } = useToast();

  const handleExportData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/users/export-data', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mes-donnees-elocation-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showToast('success', 'Données exportées avec succès');
      } else {
        showToast('error', 'Erreur lors de l\'exportation des données');
      }
    } catch (error) {
      console.error('Erreur lors de l\'exportation:', error);
      showToast('error', 'Erreur lors de l\'exportation des données');
    }
    onClose();
  };

  // useEffect supprimé pour éviter la fermeture automatique du menu

  if (!isOpen) return null;

  const ownerMenuItems = [
    { icon: Settings, label: 'Paramètres du compte', onClick: () => navigate('/settings') },
    { icon: BarChart3, label: 'Statistiques du profil', onClick: () => navigate('/analytics') },
    { icon: Download, label: 'Exporter les données', onClick: () => handleExportData() },
    { icon: LogOut, label: 'Se déconnecter', onClick: () => { logout(); navigate('/'); }, danger: true }
  ];

  const { success, error } = useToast();

  const visitorMenuItems = [
    { icon: Copy, label: 'Copier le lien du profil', onClick: async () => {
      try {
        await navigator.clipboard.writeText(profileUrl);
        success('Lien copié !', 'Le lien du profil a été copié dans le presse-papiers');
        onClose();
      } catch (err) {
        error('Erreur', 'Impossible de copier le lien');
        onClose();
      }
    }},
    { icon: UserPlus, label: 'Ajouter aux contacts', onClick: () => alert('Fonctionnalité bientôt disponible') },
    { icon: QrCode, label: 'Partager via QR Code', onClick: () => { 
      console.log('QR Code clicked, onShowQRModal:', onShowQRModal);
      onClose(); 
      if (onShowQRModal) {
        onShowQRModal();
      }
    } },
    { icon: EyeOff, label: 'Masquer ce profil', onClick: () => alert('Fonctionnalité bientôt disponible') },
    { icon: UserX, label: 'Bloquer cet utilisateur', onClick: () => alert('Fonctionnalité bientôt disponible'), danger: true },
    { icon: Flag, label: 'Signaler le profil', onClick: () => alert('Fonctionnalité bientôt disponible'), danger: true }
  ];

  const menuItems = isOwner ? ownerMenuItems : visitorMenuItems;

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-12 right-0 bg-white rounded-xl shadow-lg border border-gray-200 py-2 min-w-56 z-50"
    >
      {menuItems.map((item, index) => (
        <button
          key={index}
          onClick={item.onClick}
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors text-left whitespace-nowrap ${
            item.danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'
          }`}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </button>
      ))}
    </div>
  );
};