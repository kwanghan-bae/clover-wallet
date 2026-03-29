import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { registerForPushNotificationsAsync } from '../utils/notifications';

/**
 * notifications 유틸리티 테스트 스위트
 * 
 * 목적: Expo Notifications API를 사용한 푸시 알림 등록 프로세스를 검증합니다.
 * 디바이스 환경(실기기 여부, OS 타입) 및 권한 상태에 따른 토큰 발급 로직을 테스트합니다.
 */
describe('notifications utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should register for push notifications on a real device', async () => {
    // Mock Device as real device
    require('./mocks/expo-device').__setDevice(true);
    
    // Mock permissions granted
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    
    // Mock push token response
    const mockToken = { data: 'expo-push-token' };
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue(mockToken);

    const token = await registerForPushNotificationsAsync();

    expect(token).toBe('expo-push-token');
    expect(Notifications.getPermissionsAsync).toHaveBeenCalled();
    expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalled();
  });

  test('should request permissions if not granted', async () => {
    require('./mocks/expo-device').__setDevice(true);
    
    // Initial status undetermined, then granted after request
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'undetermined' });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    
    const mockToken = { data: 'expo-push-token' };
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue(mockToken);

    await registerForPushNotificationsAsync();

    expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
  });

  test('should not register if permissions denied', async () => {
    require('./mocks/expo-device').__setDevice(true);
    
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
    
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    const token = await registerForPushNotificationsAsync();

    expect(token).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith('푸시 알림 권한 획득 실패!');
    expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test('should set notification channel on Android', async () => {
    Platform.OS = 'android';
    require('./mocks/expo-device').__setDevice(true);
    
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({ data: 'token' });
    
    await registerForPushNotificationsAsync();

    expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith('default', expect.any(Object));
  });

  test('should warn and not register on simulator', async () => {
    require('./mocks/expo-device').__setDevice(false);
    
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    const token = await registerForPushNotificationsAsync();

    expect(token).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith('푸시 알림을 위해 실제 기기를 사용해야 합니다.');
    
    consoleSpy.mockRestore();
  });
});
