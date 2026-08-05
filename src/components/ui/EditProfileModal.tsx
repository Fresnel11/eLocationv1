import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Upload } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { ImageCropModal } from './ImageCropModal';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { analyzeProfileImage, ImageAnalysisResult } from '../../services/imageAnalysisService';
import { API_URL } from '../../config/env';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    avatar?: string;
    bio?: string;
    phone?: string;
    address?: string;
  };
  onProfileUpdated: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onProfileUpdated
}) => {
  const { success, error } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [showCrop, setShowCrop] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [formData, setFormData] = useState({
    bio: profile.bio || '',
    phone: profile.phone || '',
    address: profile.address || '',
    avatar: profile.avatar || ''
  });

  useEffect(() => {
    if (isOpen) {
      const avatarUrl = profile.avatar ? 
        (profile.avatar.startsWith('http') ? profile.avatar : `${API_URL}${profile.avatar}`) : '';
      setFormData({
        bio: profile.bio || '',
        phone: profile.phone || '',
        address: profile.address || '',
        avatar: avatarUrl
      });
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const analysisResult: ImageAnalysisResult = await analyzeProfileImage(file);
    if (!analysisResult.isValid) {
      error('Image non valide', analysisResult.reason || 'Cette image ne respecte pas nos critères.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setShowCrop(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    const formDataFile = new FormData();
    formDataFile.append('file', croppedBlob, 'avatar.jpg');

    try {
      setLoading(true);
      const response = await api.post('/upload/avatar', formDataFile, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const avatarUrl = response.data.url.startsWith('http') ? response.data.url : `${API_URL}${response.data.url}`;
      setFormData(prev => ({ ...prev, avatar: avatarUrl }));
      success('Avatar uploadé !', 'Votre photo de profil a été mise à jour.');
    } catch (err) {
      error('Erreur', 'Impossible d\'uploader l\'avatar');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.patch('/users/profile', formData);
      success('Profil mis à jour !', 'Vos informations ont été sauvegardées.');
      onProfileUpdated();
      onClose();
    } catch (err) {
      error('Erreur', 'Impossible de mettre à jour le profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Modifier le profil</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Avatar */}
              <div className="text-center">
                <div className="relative inline-block">
                  {formData.avatar ? (
                    <img
                      src={formData.avatar.startsWith('http') ? formData.avatar : `${API_URL}${formData.avatar}`}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-gray-200"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
                      <Camera className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    <Upload className="h-4 w-4" />
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="text-sm text-gray-500 mt-2">Cliquez pour changer votre photo</p>
              </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Biographie
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Parlez-nous de vous..."
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.bio.length}/500 caractères
            </p>
          </div>

          {/* Téléphone */}
          <Input
            label="Téléphone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="+229 XX XX XX XX"
          />

          {/* Adresse */}
          <Input
            label="Adresse"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Votre adresse"
          />

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
              Sauvegarder
            </Button>
          </div>
        </form>
      </div>
      
      <ImageCropModal
        isOpen={showCrop}
        onClose={() => setShowCrop(false)}
        imageSrc={selectedImage}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
};