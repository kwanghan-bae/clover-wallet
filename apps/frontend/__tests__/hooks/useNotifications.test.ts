jest.unmock('../../hooks/useNotifications');

jest.mock('../../api/notifications', () => ({
  notificationsApi: {
    getMyNotifications: jest.fn().mockResolvedValue({ content: [], totalElements: 0 }),
    getUnreadCount: jest.fn().mockResolvedValue({ count: 3 }),
    registerFcmToken: jest.fn().mockResolvedValue({}),
    markAsRead: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock('expo-notifications', () => ({
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: 'ExponentPushToken[xxx]' }),
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
}));

jest.mock('expo-device', () => ({ isDevice: true }));
jest.mock('expo-constants', () => ({ default: { expoConfig: { extra: { eas: { projectId: 'test' } } } } }));

import { renderHook } from '@testing-library/react-native';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useNotifications', () => {
  it('should be defined and have correct shape', () => {
    const { useNotifications } = require('../../hooks/useNotifications');
    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });
    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('unreadCount');
    expect(result.current).toHaveProperty('registerToken');
    expect(result.current).toHaveProperty('markAsRead');
  });
});
