import React, { useState } from 'react';
import { X, Flag } from 'lucide-react';
import { Button } from './Button';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'ad' | 'user';
  targetId: string;
  targetTitle: string;
}

const reportReasons = {
  ad: [
    { value: 'inappropriate_content', label: 'Contenu inapproprié' },
    { value: 'spam', label: 'Spam ou publicité' },
    { value: 'fraud', label: 'Fraude ou arnaque' },
    { value: 'fake_listing', label: 'Annonce factice' },
    { value: 'other', label: 'Autre' }
  ],
  user: [
    { value: 'harassment', label: 'Harcèlement' },
    { value: 'offensive_behavior', label: 'Comportement offensant' },
    { value: 'spam', label: 'Spam' },
    { value: 'fraud', label: 'Fraude' },
    { value: 'other', label: 'Autre' }
  ]
};

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  type,
  targetId,
  targetTitle
}) => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    reason: '',
    description: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reason) {
      error('Erreur', 'Veuillez sélectionner une raison');
      return;
    }

    setLoading(true);
    try {
      await api.post('/reports', {
        type,
        reason: formData.reason,
        description: formData.description,
        ...(type === 'ad' ? { reportedAdId: targetId } : { reportedUserId: targetId })
      });

      success('Signalement envoyé', 'Votre signalement a été transmis à notre équipe.');
      onClose();
      setFormData({ reason: '', description: '' });
    } catch (err) {
      error('Erreur', 'Impossible d\'envoyer le signalement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Flag className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-semibold">Signaler</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Vous signalez : <span className="font-medium">{targetTitle}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Raison du signalement *
            </label>
            <div className="space-y-2">
              {reportReasons[type].map((reason) => (
                <label key={reason.value} className="flex items-center">
                  <input
                    type="radio"
                    name="reason"
                    value={reason.value}
                    checked={formData.reason === reason.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">{reason.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Détails (optionnel)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              placeholder="Décrivez le problème..."
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/1000 caractères
            </p>
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
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              Signaler
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};