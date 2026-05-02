import axios from 'axios';
import type { User, ApiResponse } from '../types';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
  withCredentials: true, // for httpOnly refresh token cookie
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await api.post<{ accessToken: string }>('/api/auth/refresh');
        useAuthStore.getState().setAuth(
          useAuthStore.getState().user!,
          data.accessToken
        );
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export { api };

export const authService = {
  register: async (payload: { name: string; email: string; password: string }) => {
    const { data } = await api.post<ApiResponse<{ user: User; accessToken: string }>>(
      '/api/auth/register',
      payload
    );
    return data.data;
  },

  login: async (payload: { email: string; password: string }) => {
    const { data } = await api.post<ApiResponse<{ user: User; accessToken: string }>>(
      '/api/auth/login',
      payload
    );
    return data.data;
  },

  logout: async () => {
    await api.post('/api/auth/logout');
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get<ApiResponse<User>>('/api/auth/me');
    return data.data;
  },

  updateProfile: async (payload: { name?: string; password?: string; currentPassword?: string }) => {
    const { data } = await api.put<ApiResponse<User>>('/api/auth/me', payload);
    return data.data;
  },
};
