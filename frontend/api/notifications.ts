import { apiClient } from './client';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'INFO' | 'WINNING' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

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
