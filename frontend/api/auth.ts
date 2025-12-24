import { apiClient } from './client';

export interface LoginResponse {
  accessToken: string;
  user: {
    id: number;
    email: string;
    nickname: string;
  };
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return await apiClient.post('auth/login', {
      json: { email, password }
    }).json();
  },
  
  signup: async (data: any): Promise<void> => {
    await apiClient.post('auth/signup', {
      json: data
    });
  }
};
