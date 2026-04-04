// frontend/api/auth.ts
import { apiClient } from './client';

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: number;
    email: string;
    nickname: string | null;
  };
}

export const authApi = {
  login: (supabaseToken: string) =>
    apiClient
      .post('auth/login', { json: { token: supabaseToken } })
      .json<LoginResponse>(),

  refresh: (refreshToken: string) =>
    apiClient
      .post('auth/refresh', { json: { refreshToken } })
      .json<{ accessToken: string }>(),

  logout: (accessToken: string) =>
    apiClient.post('auth/logout', {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
};
