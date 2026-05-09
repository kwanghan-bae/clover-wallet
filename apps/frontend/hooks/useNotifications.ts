import { useCallback } from 'react';
import { Platform } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { notificationsApi } from '../api/notifications';
import { useAuth } from './useAuth';

export function useNotifications() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const { data: unreadData } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 60000,
    enabled: isAuthenticated,
  });

  const unreadCount = unreadData?.count ?? 0;

  const registerToken = useCallback(async () => {
    // 웹은 vapidPublicKey 설정 필요해서 별도 셋업 전엔 스킵
    if (Platform.OS === 'web') return;
    if (!Device.isDevice) return;
    const { status } = await Notifications.getPermissionsAsync();
    let finalStatus = status;
    if (status !== 'granted') {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      finalStatus = newStatus;
    }
    if (finalStatus !== 'granted') return;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    await notificationsApi.registerFcmToken(tokenData.data);
  }, []);

  const markAsRead = useCallback(async (id: number) => {
    await notificationsApi.markAsRead(id);
    queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  }, [queryClient]);

  return { unreadCount, registerToken, markAsRead };
}
