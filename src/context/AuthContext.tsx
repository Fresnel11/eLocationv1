import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuthStore } from '../store/authStore';
import { User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (firstName: string, lastName: string, phone: string, password: string, email?: string, referralCode?: string, acceptedTerms?: boolean, birthDate?: string, gender?: 'masculin' | 'féminin') => Promise<void>;
  logout: () => void;
  loading: boolean;
  isInitialized: boolean;
  isAuthenticated: boolean;
  error: string | null;
  clearError: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    user,
    isLoading,
    isInitialized,
    error,
    login: storeLogin,
    register: storeRegister,
    logout: storeLogout,
    clearError,
    initializeAuth,
    updateUser: storeUpdateUser
  } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (email: string, password: string, rememberMe?: boolean) => {
    await storeLogin({ email, password, rememberMe });
  };

  const register = async (firstName: string, lastName: string, phone: string, password: string, email?: string, referralCode?: string, acceptedTerms?: boolean, birthDate?: string, gender?: 'masculin' | 'féminin') => {
    await storeRegister({ firstName, lastName, phone, password, email, referralCode, acceptedTerms: acceptedTerms || false, birthDate: birthDate || '', gender: gender || 'masculin' });
  };

  const logout = () => {
    storeLogout();
  };

  const updateUser = (user: User) => {
    storeUpdateUser(user);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading: isLoading,
    isInitialized,
    isAuthenticated: !!user,
    error,
    clearError,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};