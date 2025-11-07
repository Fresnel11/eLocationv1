import api from './api';

export interface SubmitVerificationDto {
  selfiePhoto: string;
  documentType: 'cni' | 'cip' | 'passport';
  documentFrontPhoto: string;
  documentBackPhoto?: string;
}

export interface VerificationStatus {
  isVerified: boolean;
  verification?: {
    id: string;
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
    createdAt: string;
  };
}

export const verificationService = {
  async submitVerification(data: SubmitVerificationDto) {
    const response = await api.post('/users/verification', data);
    return response.data;
  },

  async getVerificationStatus(): Promise<VerificationStatus> {
    const response = await api.get('/users/verification/status');
    return response.data;
  },

  async getPendingVerifications() {
    const response = await api.get('/users/verification/pending');
    return response.data;
  },

  async reviewVerification(id: string, status: 'approved' | 'rejected', rejectionReason?: string) {
    const response = await api.patch(`/users/verification/${id}/review`, {
      status,
      rejectionReason
    });
    return response.data;
  }
};