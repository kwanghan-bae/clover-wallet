/* eslint-disable import/first */
jest.mock('../../api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

import { usersApi } from '../../api/users';
import { apiClient } from '../../api/client';

describe('usersApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMe', () => {
    it('fetches current user profile', async () => {
      const mockProfile = { id: 1, email: 'me@example.com', nickname: 'MyNick', badges: '[]' };
      const mockJson = jest.fn().mockResolvedValue(mockProfile);
      (apiClient.get as jest.Mock).mockReturnValue({ json: mockJson });

      const result = await usersApi.getMe();

      expect(apiClient.get).toHaveBeenCalledWith('users/me');
      expect(result.email).toBe('me@example.com');
    });
  });

  describe('getMyStats', () => {
    it('fetches current user stats', async () => {
      const mockStats = { totalGames: 10, totalWinnings: 5000, totalSpent: 10000, roi: -0.5 };
      const mockJson = jest.fn().mockResolvedValue(mockStats);
      (apiClient.get as jest.Mock).mockReturnValue({ json: mockJson });

      const result = await usersApi.getMyStats();

      expect(apiClient.get).toHaveBeenCalledWith('users/me/stats');
      expect(result.totalGames).toBe(10);
    });
  });

  describe('getUserById', () => {
    it('fetches user profile by ID', async () => {
      const mockProfile = { id: 42, email: 'other@example.com', nickname: '다른유저', badges: '[]' };
      const mockJson = jest.fn().mockResolvedValue(mockProfile);
      (apiClient.get as jest.Mock).mockReturnValue({ json: mockJson });

      const result = await usersApi.getUserById(42);

      expect(apiClient.get).toHaveBeenCalledWith('users/42');
      expect(result.id).toBe(42);
    });
  });

  describe('getUserStats', () => {
    it('fetches stats for a user by ID', async () => {
      const mockStats = { totalGames: 5, totalWinnings: 0, totalSpent: 5000, roi: -1 };
      const mockJson = jest.fn().mockResolvedValue(mockStats);
      (apiClient.get as jest.Mock).mockReturnValue({ json: mockJson });

      const result = await usersApi.getUserStats(42);

      expect(apiClient.get).toHaveBeenCalledWith('users/42/stats');
      expect(result.totalSpent).toBe(5000);
    });
  });

  describe('toggleFollow', () => {
    it('posts to users/:id/follow', async () => {
      const mockJson = jest.fn().mockResolvedValue({ following: true });
      (apiClient.post as jest.Mock).mockReturnValue({ json: mockJson });

      const result = await usersApi.toggleFollow(99);

      expect(apiClient.post).toHaveBeenCalledWith('users/99/follow');
      expect(result.following).toBe(true);
    });
  });

  describe('getFollowCounts', () => {
    it('fetches follower and following counts', async () => {
      const mockJson = jest.fn().mockResolvedValue({ followers: 10, following: 5 });
      (apiClient.get as jest.Mock).mockReturnValue({ json: mockJson });

      const result = await usersApi.getFollowCounts(99);

      expect(apiClient.get).toHaveBeenCalledWith('users/99/follow-counts');
      expect(result.followers).toBe(10);
    });
  });

  describe('getUserPosts', () => {
    it('fetches posts for a user with default pagination', async () => {
      const mockJson = jest.fn().mockResolvedValue({ content: [], totalElements: 0 });
      (apiClient.get as jest.Mock).mockReturnValue({ json: mockJson });

      await usersApi.getUserPosts(99);

      expect(apiClient.get).toHaveBeenCalledWith(
        'community/users/99/posts?page=0&size=10'
      );
    });

    it('fetches posts for a user with custom pagination', async () => {
      const mockJson = jest.fn().mockResolvedValue({ content: [], totalElements: 0 });
      (apiClient.get as jest.Mock).mockReturnValue({ json: mockJson });

      await usersApi.getUserPosts(99, 2, 5);

      expect(apiClient.get).toHaveBeenCalledWith(
        'community/users/99/posts?page=2&size=5'
      );
    });
  });
});
