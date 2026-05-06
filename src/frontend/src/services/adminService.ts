import axios from 'axios';
import type { User, ApiResponse } from '../types';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface AdminSetting {
  id: string;
  key: string;
  value: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  isAdmin?: boolean;
}

export const adminService = {
  async getUsers(): Promise<User[]> {
    const res = await api.get<ApiResponse<User[]>>('/api/admin/users');
    return res.data.data;
  },

  async createUser(payload: CreateUserPayload): Promise<User> {
    const res = await api.post<ApiResponse<User>>('/api/admin/users', payload);
    return res.data.data;
  },

  async deactivateUser(id: string): Promise<User> {
    const res = await api.patch<ApiResponse<User>>(`/api/admin/users/${id}/deactivate`);
    return res.data.data;
  },

  async getSettings(): Promise<AdminSetting[]> {
    const res = await api.get<ApiResponse<AdminSetting[]>>('/api/admin/settings');
    return res.data.data;
  },

  async updateSetting(key: string, value: string): Promise<AdminSetting> {
    const res = await api.put<ApiResponse<AdminSetting>>('/api/admin/settings', { key, value });
    return res.data.data;
  },
};
