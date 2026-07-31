import axios from 'axios';
import { API_URL } from '../config/env';
import { getStoredToken } from '../utils/authToken';

const API_BASE_URL = API_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT.
// getStoredToken interroge localStorage, sessionStorage ET les cookies : sans
// cela, toute session ouverte sans « Se souvenir de moi » partait sans token.
api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

