import { apiClient } from './client';

export interface UserStats {
  totalGames: number;
  totalWinnings: number;
  totalSpent: number;
  roi: number;
}

export interface UserProfile {
  id: number;
  email: string;
  nickname: string | null;
  badges: string;
}

export const usersApi = {
  getMe: () => apiClient.get('users/me').json<UserProfile>(),
  getMyStats: () => apiClient.get('users/me/stats').json<UserStats>(),
  getUserById: (id: number) => apiClient.get(`users/${id}`).json<UserProfile>(),
  getUserStats: (id: number) => apiClient.get(`users/${id}/stats`).json<UserStats>(),

  toggleFollow: (userId: number) =>
    apiClient.post(`users/${userId}/follow`).json<{ following: boolean }>(),

  getFollowCounts: (userId: number) =>
    apiClient.get(`users/${userId}/follow-counts`).json<{ followers: number; following: number }>(),

  getUserPosts: (userId: number, page = 0, size = 10) =>
    apiClient.get(`community/users/${userId}/posts?page=${page}&size=${size}`).json(),
};
