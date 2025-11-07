import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface RefusalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading?: boolean;
}

const defaultReasons = [
  'Dates non disponibles',
  'Propriété en maintenance',
  'Demande incomplète',
  'Profil non adapté',
  'Tarif non négociable',
  'Conditions non respectées'
];

export const RefusalModal: React.FC<RefusalModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false
}) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const reason = useCustom ? customReason.trim() : selectedReason;
    onConfirm(reason || 'Refusé par le propriétaire');
    handleClose();
  };

  const handleClose = () => {
    setSelectedReason('');
    setCustomReason('');
    setUseCustom(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Refuser la réservation
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          Sélectionnez une raison ou expliquez pourquoi vous refusez cette demande :
        </p>

        {!useCustom ? (
          <div className="space-y-2 mb-4">
            {defaultReasons.map((reason) => (
              <label
                key={reason}
                className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name="reason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="mr-3 text-blue-600"
                />
                <span className="text-gray-700">{reason}</span>
              </label>
            ))}
            <button
              onClick={() => setUseCustom(true)}
              className="w-full p-3 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              + Autre raison (personnalisée)
            </button>
          </div>
        ) : (
          <div className="mb-4">
            <textarea
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Expliquez la raison du refus..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none"
              rows={3}
              maxLength={200}
            />
            <div className="flex justify-between items-center mt-2">
              <button
                onClick={() => setUseCustom(false)}
                className="text-sm text-blue-600 hover:underline"
              >
                ← Retour aux raisons prédéfinies
              </button>
              <span className="text-xs text-gray-500">
                {customReason.length}/200
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || (!useCustom && !selectedReason) || (useCustom && !customReason.trim())}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            {loading ? 'Refus...' : 'Refuser'}
          </Button>
        </div>
      </div>
    </div>
  );
};