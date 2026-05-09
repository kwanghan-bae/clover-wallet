/* eslint-disable import/first */
jest.mock('../../api/client', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

import { authApi } from '../../api/auth';
import { apiClient } from '../../api/client';

describe('authApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('posts to auth/login with supabase token', async () => {
      const mockResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: { id: 1, email: 'test@example.com', nickname: 'TestUser' },
      };
      const mockJson = jest.fn().mockResolvedValue(mockResponse);
      (apiClient.post as jest.Mock).mockReturnValue({ json: mockJson });

      const result = await authApi.login('supabase-token-123');

      expect(apiClient.post).toHaveBeenCalledWith('auth/login', {
        json: { token: 'supabase-token-123' },
      });
      expect(result).toEqual(mockResponse);
    });

    it('returns user without refreshToken', async () => {
      const mockResponse = {
        accessToken: 'access-token',
        user: { id: 2, email: 'user@example.com', nickname: null },
      };
      const mockJson = jest.fn().mockResolvedValue(mockResponse);
      (apiClient.post as jest.Mock).mockReturnValue({ json: mockJson });

      const result = await authApi.login('another-token');
      expect(result.user.nickname).toBeNull();
    });
  });

  describe('refresh', () => {
    it('posts to auth/refresh with refreshToken', async () => {
      const mockJson = jest.fn().mockResolvedValue({ accessToken: 'new-access-token' });
      (apiClient.post as jest.Mock).mockReturnValue({ json: mockJson });

      const result = await authApi.refresh('my-refresh-token');

      expect(apiClient.post).toHaveBeenCalledWith('auth/refresh', {
        json: { refreshToken: 'my-refresh-token' },
      });
      expect(result.accessToken).toBe('new-access-token');
    });
  });

  describe('logout', () => {
    it('posts to auth/logout with Authorization header', async () => {
      const mockPost = jest.fn().mockReturnValue({});
      (apiClient.post as jest.Mock).mockImplementation(mockPost);

      await authApi.logout('my-access-token');

      expect(apiClient.post).toHaveBeenCalledWith('auth/logout', {
        headers: { Authorization: 'Bearer my-access-token' },
      });
    });
  });

  describe('devLogin', () => {
    it('posts to auth/dev-login with email', async () => {
      const mockResponse = {
        accessToken: 'dev-at',
        refreshToken: 'dev-rt',
        user: { id: 1, email: 'dev1@local.test', nickname: null },
      };
      const mockJson = jest.fn().mockResolvedValue(mockResponse);
      (apiClient.post as jest.Mock).mockReturnValue({ json: mockJson });

      const result = await authApi.devLogin('dev1@local.test');

      expect(apiClient.post).toHaveBeenCalledWith('auth/dev-login', {
        json: { email: 'dev1@local.test' },
      });
      expect(result).toEqual(mockResponse);
    });
  });
});
