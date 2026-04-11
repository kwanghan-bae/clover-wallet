import { useNetInfo } from '@react-native-community/netinfo';

export function useOffline() {
  const netInfo = useNetInfo();
  const isOffline = netInfo.isConnected === false;
  return { isOffline, netInfo };
}
