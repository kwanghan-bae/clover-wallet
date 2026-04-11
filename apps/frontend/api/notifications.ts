import { apiClient } from './client';
import type { Notification, PageResponse } from '@clover/shared';

export type { Notification };

export const notificationsApi = {
  getMyNotifications: (page = 0, size = 20) =>
    apiClient.get(`notifications?page=${page}&size=${size}`).json<PageResponse<Notification>>(),

  markAsRead: (id: number) =>
    apiClient.put(`notifications/${id}/read`).json(),

  getUnreadCount: () =>
    apiClient.get('notifications/unread-count').json<{ count: number }>(),

  registerFcmToken: (token: string) =>
    apiClient.post('notifications/fcm-token', { json: { token } }).json(),
};
