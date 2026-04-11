jest.mock('../../api/client', () => ({
  apiClient: {
    get: jest.fn(),
    put: jest.fn(),
    post: jest.fn(),
  },
}));

import { notificationsApi } from '../../api/notifications';
import { apiClient } from '../../api/client';

describe('notificationsApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMyNotifications', () => {
    it('fetches with default page and size', async () => {
      const mockData = { content: [], totalElements: 0 };
      const mockJson = jest.fn().mockResolvedValue(mockData);
      (apiClient.get as jest.Mock).mockReturnValue({ json: mockJson });

      const result = await notificationsApi.getMyNotifications();

      expect(apiClient.get).toHaveBeenCalledWith('notifications?page=0&size=20');
      expect(result).toEqual(mockData);
    });

    it('fetches with custom page and size', async () => {
      const mockJson = jest.fn().mockResolvedValue({ content: [], totalElements: 0 });
      (apiClient.get as jest.Mock).mockReturnValue({ json: mockJson });

      await notificationsApi.getMyNotifications(2, 10);

      expect(apiClient.get).toHaveBeenCalledWith('notifications?page=2&size=10');
    });
  });

  describe('markAsRead', () => {
    it('puts to notifications/:id/read', async () => {
      const mockJson = jest.fn().mockResolvedValue({});
      (apiClient.put as jest.Mock).mockReturnValue({ json: mockJson });

      await notificationsApi.markAsRead(42);

      expect(apiClient.put).toHaveBeenCalledWith('notifications/42/read');
    });
  });

  describe('getUnreadCount', () => {
    it('returns unread count', async () => {
      const mockJson = jest.fn().mockResolvedValue({ count: 5 });
      (apiClient.get as jest.Mock).mockReturnValue({ json: mockJson });

      const result = await notificationsApi.getUnreadCount();

      expect(apiClient.get).toHaveBeenCalledWith('notifications/unread-count');
      expect(result.count).toBe(5);
    });
  });

  describe('registerFcmToken', () => {
    it('posts FCM token to notifications/fcm-token', async () => {
      const mockJson = jest.fn().mockResolvedValue({});
      (apiClient.post as jest.Mock).mockReturnValue({ json: mockJson });

      await notificationsApi.registerFcmToken('fcm-token-xyz');

      expect(apiClient.post).toHaveBeenCalledWith('notifications/fcm-token', {
        json: { token: 'fcm-token-xyz' },
      });
    });
  });
});
