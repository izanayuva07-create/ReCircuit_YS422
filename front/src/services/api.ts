import axios from 'axios';
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// ============================================================
// Re-Circuit — Axios Base Configuration
// Connect to real backend by setting VITE_API_BASE_URL in .env
// ============================================================

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('rc_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle global errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      // TODO: Handle token expiry — redirect to login
      localStorage.removeItem('rc_token');
      localStorage.removeItem('rc_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
