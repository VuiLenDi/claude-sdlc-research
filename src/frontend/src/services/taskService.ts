import { api } from './authService';
import type { Task, ApiResponse } from '../types';

export interface MemberOption {
  id: string;
  name: string;
  email: string;
}

export interface TaskPayload {
  title: string;
  description?: string;
  priority?: Task['priority'];
  assigneeId?: string | null;
  storyPoints?: number | null;
  dueDate?: string | null;
  status?: Task['status'];
}

export const taskService = {
  getMembers: async (projectId: string): Promise<MemberOption[]> => {
    const { data } = await api.get<ApiResponse<MemberOption[]>>(`/api/projects/${projectId}/members`);
    return data.data;
  },

  getTasks: async (projectId: string): Promise<Task[]> => {
    const { data } = await api.get<ApiResponse<Task[]>>(`/api/projects/${projectId}/tasks`);
    return data.data;
  },

  createTask: async (projectId: string, payload: TaskPayload): Promise<Task> => {
    const { data } = await api.post<ApiResponse<Task>>(`/api/projects/${projectId}/tasks`, payload);
    return data.data;
  },

  updateTask: async (projectId: string, taskId: string, payload: Partial<TaskPayload>): Promise<Task> => {
    const { data } = await api.put<ApiResponse<Task>>(
      `/api/projects/${projectId}/tasks/${taskId}`,
      payload
    );
    return data.data;
  },

  deleteTask: async (projectId: string, taskId: string): Promise<void> => {
    await api.delete(`/api/projects/${projectId}/tasks/${taskId}`);
  },
};
