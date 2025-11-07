import React from 'react';
import { X } from 'lucide-react';

interface AvatarPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatarUrl: string;
  userName: string;
}

export const AvatarPreviewModal: React.FC<AvatarPreviewModalProps> = ({
  isOpen,
  onClose,
  avatarUrl,
  userName
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-sm w-full">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
        >
          <X className="h-8 w-8" />
        </button>
        
        <div className="bg-white rounded-xl p-4">
          <img
            src={avatarUrl}
            alt={`Photo de profil de ${userName}`}
            className="w-full aspect-square object-cover rounded-lg"
          />
          <p className="text-center mt-3 font-medium text-gray-900">{userName}</p>
        </div>
      </div>
    </div>
  );
};