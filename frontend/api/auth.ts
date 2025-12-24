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
  /**
   * 로그인 (Supabase 토큰 전달 방식)
   */
  login: async (supabaseToken: string): Promise<LoginResponse> => {
    return await apiClient.post('auth/login', {
      json: { supabaseToken }
    }).json();
  },
  
  signup: async (data: any): Promise<void> => {
    await apiClient.post('auth/signup', {
      json: data
    });
  }
};
