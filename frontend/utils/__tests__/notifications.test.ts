import { registerForPushNotificationsAsync } from '../notifications';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

jest.mock('expo-notifications');
jest.mock('expo-device');
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      eas: {
        projectId: 'test-project-id',
      },
    },
  },
}));

describe('notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return undefined if not a device', async () => {
    // @ts-ignore
    Device.isDevice = false;
    const token = await registerForPushNotificationsAsync();
    expect(token).toBeUndefined();
  });

  test('should return token if permissions granted', async () => {
    // @ts-ignore
    Device.isDevice = true;
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({ data: 'test-token' });

    const token = await registerForPushNotificationsAsync();
    expect(token).toBe('test-token');
  });

  test('should request permissions if not granted', async () => {
    // @ts-ignore
    Device.isDevice = true;
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'undetermined' });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({ data: 'test-token' });

    const token = await registerForPushNotificationsAsync();
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
    expect(token).toBe('test-token');
  });

  test('should return undefined if permissions denied', async () => {
    // @ts-ignore
    Device.isDevice = true;
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

    const token = await registerForPushNotificationsAsync();
    expect(token).toBeUndefined();
  });
});
