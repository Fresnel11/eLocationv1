import { create } from 'zustand';
import { authService, User, LoginData, RegisterData } from '../services/authService';
import { cookieUtils } from '../utils/cookies';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  // Actions
  login: (data: LoginData & { rememberMe?: boolean }) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  initializeAuth: () => void;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  login: async (data: LoginData & { rememberMe?: boolean }) => {
    set({ isLoading: true, error: null });
    try {
      const { rememberMe, ...loginData } = data;
      const response = await authService.login(loginData);
      if (rememberMe) {
        // Stocker dans localStorage ET cookies (30 jours)
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('rememberMe', 'true');
        cookieUtils.set('token', response.access_token, 30);
        cookieUtils.set('user', JSON.stringify(response.user), 30);
      } else {
        // Stocker seulement dans sessionStorage
        sessionStorage.setItem('token', response.access_token);
        sessionStorage.setItem('user', JSON.stringify(response.user));
      }
      set({ 
        user: response.user, 
        token: response.access_token, 
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Erreur de connexion', 
        isLoading: false 
      });
      throw error;
    }
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register(data);
      // L'inscription authentifie directement : on stocke la session comme
      // pour une connexion sans « se souvenir de moi ».
      sessionStorage.setItem('token', response.access_token);
      sessionStorage.setItem('user', JSON.stringify(response.user));
      set({
        user: response.user,
        token: response.access_token,
        isLoading: false
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Erreur d\'inscription',
        isLoading: false
      });
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    localStorage.removeItem('rememberMe');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    cookieUtils.remove('token');
    cookieUtils.remove('user');
    set({ user: null, token: null, error: null });
  },

  clearError: () => {
    set({ error: null });
  },

  initializeAuth: () => {
    const token = authService.getStoredToken();
    const user = authService.getStoredUser();
    if (token && user) {
      set({ token, user, isInitialized: true });
    } else {
      set({ isInitialized: true });
    }
  },

  updateUser: (user: User) => {
    // Mettre à jour l'utilisateur dans le store
    set({ user });
    
    // Mettre à jour dans le stockage local
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    if (rememberMe) {
      localStorage.setItem('user', JSON.stringify(user));
      cookieUtils.set('user', JSON.stringify(user), 30);
    } else {
      sessionStorage.setItem('user', JSON.stringify(user));
    }
  }
}));