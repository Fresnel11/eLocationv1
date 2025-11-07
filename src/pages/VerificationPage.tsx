import React, { useState, useEffect } from 'react';
import { Camera, Upload, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { verificationService } from '../services/verificationService';

interface VerificationStatus {
  isVerified: boolean;
  verification?: {
    id: string;
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
    createdAt: string;
  };
}

const VerificationPage: React.FC = () => {
  const { user } = useAuth();
  const [documentType, setDocumentType] = useState<'cni' | 'cip' | 'passport'>('cni');
  const [selfiePhoto, setSelfiePhoto] = useState<string>('');
  const [documentFrontPhoto, setDocumentFrontPhoto] = useState<string>('');
  const [documentBackPhoto, setDocumentBackPhoto] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);

  useEffect(() => {
    loadVerificationStatus();
  }, []);

  const loadVerificationStatus = async () => {
    try {
      const status = await verificationService.getVerificationStatus();
      setVerificationStatus(status);
    } catch (error) {
      console.error('Erreur lors du chargement du statut:', error);
    }
  };

  const compressImage = (file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileUpload = async (file: File, type: 'selfie' | 'front' | 'back') => {
    const compressedImage = await compressImage(file, 1200, 0.8);
    if (type === 'selfie') setSelfiePhoto(compressedImage);
    else if (type === 'front') setDocumentFrontPhoto(compressedImage);
    else if (type === 'back') setDocumentBackPhoto(compressedImage);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selfiePhoto || !documentFrontPhoto) return;
    if (documentType === 'cni' && !documentBackPhoto) return;

    setIsSubmitting(true);
    try {
      await verificationService.submitVerification({
        selfiePhoto,
        documentType,
        documentFrontPhoto,
        documentBackPhoto: documentType === 'cni' ? documentBackPhoto : undefined
      });
      await loadVerificationStatus();
      
      // Notification de succès
      alert('Demande de vérification envoyée ! Vous recevrez une réponse sous 24-48h.');
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (verificationStatus?.isVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Compte vérifié</h2>
          <p className="text-gray-600">Votre identité a été vérifiée avec succès. Vous pouvez maintenant publier des annonces.</p>
        </div>
      </div>
    );
  }

  if (verificationStatus?.verification?.status === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vérification en cours</h2>
          <p className="text-gray-600">Votre demande de vérification est en cours d'examen. Nous vous contacterons sous 24-48h.</p>
        </div>
      </div>
    );
  }

  if (verificationStatus?.verification?.status === 'rejected') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vérification rejetée</h2>
          <p className="text-gray-600 mb-4">{verificationStatus.verification.rejectionReason}</p>
          <button 
            onClick={() => setVerificationStatus(null)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Soumettre une nouvelle demande
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <AlertCircle className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Vérification d'identité</h1>
            <p className="text-gray-600">Pour publier des annonces, vous devez vérifier votre identité</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de document d'identité
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as any)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="cni">Carte Nationale d'Identité (CNI)</option>
                <option value="cip">CIP</option>
                <option value="passport">Passeport</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Photo de vous (selfie)
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'selfie')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id="selfie-input"
                />
                <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer">
                  {selfiePhoto ? (
                    <div className="space-y-3">
                      <img src={selfiePhoto} alt="Selfie" className="max-h-40 mx-auto rounded-lg shadow-md" />
                      <p className="text-sm text-blue-600 font-medium">Photo ajoutée ✓</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
                        <Camera className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <p className="text-blue-700 font-medium">Ajouter votre selfie</p>
                        <p className="text-blue-600 text-sm mt-1">Photo claire de votre visage</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {documentType === 'cni' ? 'Face avant de la CNI' : 
                 documentType === 'cip' ? 'Photo de la CIP' : 
                 'Page d\'identité du passeport'}
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'front')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id="front-input"
                />
                <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer">
                  {documentFrontPhoto ? (
                    <div className="space-y-3">
                      <img src={documentFrontPhoto} alt="Document" className="max-h-40 mx-auto rounded-lg shadow-md" />
                      <p className="text-sm text-blue-600 font-medium">Document ajouté ✓</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
                        <Upload className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <p className="text-blue-700 font-medium">Ajouter le document</p>
                        <p className="text-blue-600 text-sm mt-1">Photo claire et nette</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {documentType === 'cni' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Face arrière de la CNI
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'back')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    id="back-input"
                  />
                  <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer">
                    {documentBackPhoto ? (
                      <div className="space-y-3">
                        <img src={documentBackPhoto} alt="Document verso" className="max-h-40 mx-auto rounded-lg shadow-md" />
                        <p className="text-sm text-blue-600 font-medium">Verso ajouté ✓</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
                          <Upload className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <p className="text-blue-700 font-medium">Ajouter le verso</p>
                          <p className="text-blue-600 text-sm mt-1">Face arrière de la CNI</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !selfiePhoto || !documentFrontPhoto || (documentType === 'cni' && !documentBackPhoto)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold disabled:bg-gray-300"
            >
              {isSubmitting ? 'Envoi en cours...' : 'Soumettre la demande'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;