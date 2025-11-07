import { api } from './api';

export interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  totalRewards: number;
}

export interface LoyaltyPoint {
  id: string;
  type: string;
  points: number;
  description: string;
  createdAt: string;
}

export interface LoyaltyData {
  total: number;
  history: LoyaltyPoint[];
}

export const referralService = {
  async getMyReferralCode(): Promise<{ referralCode: string }> {
    const response = await api.get('/referrals/my-code');
    return response.data;
  },

  async useReferralCode(code: string): Promise<{ success: boolean }> {
    const response = await api.post('/referrals/use-code', { code });
    return response.data;
  },

  async getMyReferrals(): Promise<any[]> {
    const response = await api.get('/referrals/my-referrals');
    return response.data;
  },

  async getReferralStats(): Promise<ReferralStats> {
    const response = await api.get('/referrals/stats');
    return response.data;
  },

  async getLoyaltyPoints(): Promise<LoyaltyData> {
    const response = await api.get('/referrals/loyalty-points');
    return response.data;
  },
};