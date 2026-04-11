jest.mock('@react-native-community/netinfo', () => ({
  useNetInfo: jest.fn().mockReturnValue({ isConnected: true, isInternetReachable: true }),
}));

import { renderHook } from '@testing-library/react-native';
import { useOffline } from '../../hooks/useOffline';

describe('useOffline', () => {
  it('should report online when connected', () => {
    const { result } = renderHook(() => useOffline());
    expect(result.current.isOffline).toBe(false);
  });

  it('should report offline when disconnected', () => {
    const { useNetInfo } = require('@react-native-community/netinfo');
    (useNetInfo as jest.Mock).mockReturnValue({ isConnected: false, isInternetReachable: false });
    const { result } = renderHook(() => useOffline());
    expect(result.current.isOffline).toBe(true);
  });
});
