import { api } from './api';

export type DemarcheurStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

/** Candidature de l'utilisateur courant (vue privée). */
export interface DemarcheurProfile {
  id: string;
  userId: string;
  zones: string[];
  experienceYears: number;
  motivation: string;
  bio: string | null;
  status: DemarcheurStatus;
  rejectionReason: string | null;
  approvedAt: string | null;
  createdAt: string;
}

/** Fiche publique d'un démarcheur approuvé. */
export interface PublicDemarcheur {
  userId: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  zones: string[];
  experienceYears: number;
  bio: string | null;
  adsCount: number;
  demarcheurSince: string | null;
}

export type DocumentType = 'cni' | 'passport';

/** Dossier tel que présenté à l'administration. */
export interface DemarcheurApplication {
  id: string;
  userId: string;
  zones: string[];
  experienceYears: number;
  motivation: string;
  bio: string | null;
  status: DemarcheurStatus;
  rejectionReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
  approvedAt: string | null;
  candidate: {
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    profilePicture?: string;
    isVerified: boolean;
  };
}

export interface ApplyDemarcheurPayload {
  zones: string[];
  experienceYears: number;
  motivation: string;
  bio?: string;
  /** Pièce d'identité : requise uniquement si le compte n'est pas déjà vérifié. */
  documentType?: DocumentType;
  documentFrontPhoto?: string;
  documentBackPhoto?: string;
  selfiePhoto?: string;
}

export const demarcheursService = {
  /** Renvoie null si l'utilisateur n'a jamais candidaté. */
  async getMine(): Promise<DemarcheurProfile | null> {
    const response = await api.get('/demarcheurs/me');
    return response.data ?? null;
  },

  async apply(payload: ApplyDemarcheurPayload): Promise<DemarcheurProfile> {
    const response = await api.post('/demarcheurs/apply', payload);
    return response.data;
  },

  async list(zone?: string): Promise<PublicDemarcheur[]> {
    const response = await api.get('/demarcheurs', { params: zone ? { zone } : undefined });
    return response.data;
  },

  async getPublic(userId: string): Promise<PublicDemarcheur> {
    const response = await api.get(`/demarcheurs/${userId}`);
    return response.data;
  },

  // ---------------------------- Administration ------------------------------

  async listApplications(status?: DemarcheurStatus): Promise<DemarcheurApplication[]> {
    const response = await api.get('/demarcheurs/applications', {
      params: status ? { status } : undefined,
    });
    return response.data;
  },

  async review(id: string, status: DemarcheurStatus, reason?: string) {
    const response = await api.patch(`/demarcheurs/applications/${id}`, { status, reason });
    return response.data;
  },
};
