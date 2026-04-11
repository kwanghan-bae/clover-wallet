import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { Logger } from './logger';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * @description 푸시 알림 수신을 위한 기기 토큰을 등록하고 권한을 요청합니다.
 * @returns {Promise<string | undefined>} 생성된 푸시 토큰 (실패 시 undefined)
 */
export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  if (Platform.OS === 'android') {
    await configureAndroidChannel();
  }

  if (!Device.isDevice) {
    Logger.warn('notifications', '푸시 알림을 위해 실제 기기를 사용해야 합니다.');
    return undefined;
  }

  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    Logger.warn('notifications', '푸시 알림 권한 획득 실패!');
    return undefined;
  }

  return await fetchExpoPushToken();
}

/**
 * @description 안드로이드 알림 채널을 설정합니다.
 */
async function configureAndroidChannel() {
  await Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#4CAF50',
  });
}

/**
 * @description 알림 권한을 요청하고 승인 여부를 반환합니다.
 * @returns {Promise<boolean>} 권한 승인 여부
 */
async function requestNotificationPermission(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
}

/**
 * @description Expo 프로젝트 ID를 설정값에서 가져옵니다.
 */
function getExpoProjectId(): string | undefined {
  return Constants.expoConfig?.extra?.eas?.projectId ?? Constants.expoConfig?.owner;
}

/**
 * @description Expo 푸시 토큰을 서버에서 가져옵니다.
 * @returns {Promise<string | undefined>} 푸시 토큰
 */
async function fetchExpoPushToken(): Promise<string | undefined> {
  try {
    const projectId = getExpoProjectId();
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    Logger.info('notifications', `획득한 푸시 토큰: ${token}`);
    return token;
  } catch (e) {
    Logger.error('notifications', '푸시 토큰 획득 중 오류 발생:', e);
    return undefined;
  }
}
