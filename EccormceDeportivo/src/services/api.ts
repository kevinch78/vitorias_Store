import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

let rawApiUrl = import.meta.env.VITE_API_URL || 'https://victoria-backend-api.onrender.com/api/v1';

// Si Render inyectó el hostname interno sin TLD público (ej. 'victoria-backend-api')
if (rawApiUrl === 'victoria-backend-api' || !rawApiUrl.includes('.')) {
  rawApiUrl = 'https://victoria-backend-api.onrender.com/api/v1';
}

const formattedApiUrl = rawApiUrl.startsWith('http')
  ? (rawApiUrl.endsWith('/api/v1') ? rawApiUrl : `${rawApiUrl.replace(/\/+$/, '')}/api/v1`)
  : (rawApiUrl.includes('.') ? `https://${rawApiUrl.replace(/\/+$/, '')}/api/v1` : `https://${rawApiUrl}.onrender.com/api/v1`);

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
