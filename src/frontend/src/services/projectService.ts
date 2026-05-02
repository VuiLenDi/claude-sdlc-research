import { api } from './authService';
import type { Project, ApiResponse } from '../types';

export const projectService = {
  getProjects: async (): Promise<Project[]> => {
    const { data } = await api.get<ApiResponse<Project[]>>('/api/projects');
    return data.data;
  },

  getProject: async (id: string): Promise<Project> => {
    const { data } = await api.get<ApiResponse<Project>>(`/api/projects/${id}`);
    return data.data;
  },

  createProject: async (payload: { name: string; description?: string }): Promise<Project> => {
    const { data } = await api.post<ApiResponse<Project>>('/api/projects', payload);
    return data.data;
  },

  updateProject: async (
    id: string,
    payload: { name?: string; description?: string | null }
  ): Promise<Project> => {
    const { data } = await api.put<ApiResponse<Project>>(`/api/projects/${id}`, payload);
    return data.data;
  },

  deleteProject: async (id: string): Promise<void> => {
    await api.delete(`/api/projects/${id}`);
  },
};
