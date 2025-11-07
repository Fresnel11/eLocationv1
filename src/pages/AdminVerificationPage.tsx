import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, User, Calendar, FileText, MessageSquare } from 'lucide-react';
import { verificationService } from '../services/verificationService';
import { AdminLayout } from '../components/admin/AdminLayout';

interface PendingVerification {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  selfiePhoto: string;
  documentType: 'cni' | 'cip' | 'passport';
  documentFrontPhoto: string;
  documentBackPhoto?: string;
  createdAt: string;
}

const AdminVerificationPage: React.FC = () => {
  const [verifications, setVerifications] = useState<PendingVerification[]>([]);
  const [selectedVerification, setSelectedVerification] = useState<PendingVerification | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    loadPendingVerifications();
    
    // Écouter les nouvelles vérifications via CustomEvent
    const handleNewVerification = (event: any) => {
      const verification = event.detail;
      setVerifications(prev => [verification, ...prev]);
      console.log('Nouvelle vérification ajoutée à la liste');
    };
    
    window.addEventListener('new_verification', handleNewVerification);
    
    return () => {
      window.removeEventListener('new_verification', handleNewVerification);
    };
  }, []);

  const loadPendingVerifications = async () => {
    try {
      const data = await verificationService.getPendingVerifications();
      setVerifications(data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    }
  };

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    setIsProcessing(true);
    try {
      await verificationService.reviewVerification(
        id, 
        status, 
        status === 'rejected' ? rejectionReason : undefined
      );
      await loadPendingVerifications();
      setSelectedVerification(null);
      setRejectionReason('');
      setShowRejectModal(false);
    } catch (error) {
      console.error('Erreur lors de la révision:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'cni': return 'CNI';
      case 'cip': return 'CIP';
      case 'passport': return 'Passeport';
      default: return type;
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Vérifications d'identité
          </h1>
          <p className="text-gray-600">
            {verifications.length} demande{verifications.length > 1 ? 's' : ''} en attente
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Liste des vérifications */}
          <div className="space-y-4">
            {verifications.map((verification) => (
              <div
                key={verification.id}
                className={`bg-white rounded-lg shadow p-6 cursor-pointer border-2 ${
                  selectedVerification?.id === verification.id ? 'border-blue-500' : 'border-transparent'
                }`}
                onClick={() => setSelectedVerification(verification)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <User className="h-8 w-8 text-gray-400" />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {verification.user.firstName} {verification.user.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{verification.user.email}</p>
                    </div>
                  </div>
                  <Eye className="h-5 w-5 text-gray-400" />
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    {getDocumentTypeLabel(verification.documentType)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(verification.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}

            {verifications.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune vérification en attente</p>
              </div>
            )}
          </div>

          {/* Détails de la vérification sélectionnée */}
          {selectedVerification && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Vérification de {selectedVerification.user.firstName} {selectedVerification.user.lastName}
                </h2>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  En attente
                </span>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Photo selfie</h3>
                  <img
                    src={selectedVerification.selfiePhoto}
                    alt="Selfie"
                    className="w-full max-w-xs rounded-lg border"
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Document ({getDocumentTypeLabel(selectedVerification.documentType)})
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Face avant</p>
                      <img
                        src={selectedVerification.documentFrontPhoto}
                        alt="Document face avant"
                        className="w-full max-w-xs rounded-lg border"
                      />
                    </div>
                    {selectedVerification.documentBackPhoto && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Face arrière</p>
                        <img
                          src={selectedVerification.documentBackPhoto}
                          alt="Document face arrière"
                          className="w-full max-w-xs rounded-lg border"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="mb-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Informations utilisateur</h4>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p><span className="font-medium">Email:</span> {selectedVerification.user.email}</p>
                        <p><span className="font-medium">Demande créée:</span> {new Date(selectedVerification.createdAt).toLocaleString()}</p>
                        <p><span className="font-medium">Type de document:</span> {getDocumentTypeLabel(selectedVerification.documentType)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleReview(selectedVerification.id, 'approved')}
                      disabled={isProcessing}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:bg-gray-300 transition-colors"
                    >
                      <CheckCircle className="h-5 w-5" />
                      Approuver
                    </button>
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={isProcessing}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:bg-gray-300 transition-colors"
                    >
                      <XCircle className="h-5 w-5" />
                      Rejeter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de rejet */}
      {showRejectModal && selectedVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Rejeter la vérification</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              Expliquez à l'utilisateur pourquoi sa demande est rejetée :
            </p>
            
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Ex: Photos floues, document non valide, selfie non conforme..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 text-sm"
              required
            />
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  if (rejectionReason.trim()) {
                    handleReview(selectedVerification.id, 'rejected');
                    setShowRejectModal(false);
                  }
                }}
                disabled={!rejectionReason.trim() || isProcessing}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-300 transition-colors"
              >
                Confirmer le rejet
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminVerificationPage;