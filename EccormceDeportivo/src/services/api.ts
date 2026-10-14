import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const rawApiUrl = import.meta.env.VITE_API_URL || 'https://victoria-backend-api.onrender.com/api/v1';
const formattedApiUrl = rawApiUrl.startsWith('http')
  ? (rawApiUrl.endsWith('/api/v1') ? rawApiUrl : `${rawApiUrl.replace(/\/+$/, '')}/api/v1`)
  : `https://${rawApiUrl.replace(/\/+$/, '')}/api/v1`;

export const api = axios.create({
  baseURL: formattedApiUrl,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);
