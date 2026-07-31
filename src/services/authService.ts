import { api } from './api';
import { cookieUtils } from '../utils/cookies';
import { getStoredToken, getStoredUserRaw } from '../utils/authToken';

export interface RegisterData {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  password: string;
  referralCode?: string;
  birthDate: string;
  gender: 'masculin' | 'féminin';
  acceptedTerms: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  profilePicture: any;
  id: string;
  email: string | null;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: {
    id: string;
    name: string;
  };
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

/** L'inscription connecte directement l'utilisateur : elle renvoie un token. */
export interface RegisterResponse extends AuthResponse {
  message: string;
}

export const authService = {
  async register(data: RegisterData): Promise<RegisterResponse> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  async forgotPassword(email: string): Promise<{ message: string; email: string; user?: User }> {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async sendPasswordResetCode(email: string): Promise<{ message: string; email: string; expiresAt: string }> {
    const response = await api.post('/auth/send-password-reset-code', { email });
    return response.data;
  },

  async resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
    const response = await api.post('/auth/reset-password', { email, code, newPassword });
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    cookieUtils.remove('token');
    cookieUtils.remove('user');
  },

  getStoredUser(): User | null {
    const user = getStoredUserRaw();
    return user ? JSON.parse(user) : null;
  },

  getStoredToken(): string | null {
    return getStoredToken();
  },

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }
};