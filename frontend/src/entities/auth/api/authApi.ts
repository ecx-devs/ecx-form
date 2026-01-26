import { apiClient } from '@/shared/api';
import { LoginInput, LoginResponse, Admin } from '../model/types';

export const authApi = {
  async login(input: LoginInput): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>('/auth/login', input);
  },

  async logout(): Promise<void> {
    return apiClient.post<void>('/auth/logout');
  },

  async verifySession(): Promise<{ admin: Admin }> {
    return apiClient.get<{ admin: Admin }>('/auth/me');
  },
};

