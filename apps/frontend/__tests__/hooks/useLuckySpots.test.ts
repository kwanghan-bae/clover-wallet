/* eslint-disable import/first, react/display-name */
jest.mock('../../api/spots', () => ({
  spotsApi: {
    getSpots: jest.fn().mockResolvedValue([
      { id: 1, name: '행운 복권방', address: '서울시 강남구', latitude: 37.5, longitude: 127.0, firstPlaceWins: 3, secondPlaceWins: 5 },
    ]),
  },
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: { latitude: 37.5665, longitude: 126.978 },
  }),
}));

import { renderHook, act } from '@testing-library/react-native';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useLuckySpots', () => {
  it('should initialize with list view mode (isMapView = false)', async () => {
    const { useLuckySpots } = require('../../hooks/useLuckySpots');
    const { result } = renderHook(() => useLuckySpots(), { wrapper: createWrapper() });
    expect(result.current.isMapView).toBe(false);
  });

  it('should toggle to map view when toggleViewMode is called', async () => {
    const { useLuckySpots } = require('../../hooks/useLuckySpots');
    const { result } = renderHook(() => useLuckySpots(), { wrapper: createWrapper() });
    act(() => {
      result.current.toggleViewMode();
    });
    expect(result.current.isMapView).toBe(true);
  });

  it('should initialize with 전체 region selected', async () => {
    const { useLuckySpots } = require('../../hooks/useLuckySpots');
    const { result } = renderHook(() => useLuckySpots(), { wrapper: createWrapper() });
    expect(result.current.selectedRegion).toBe('전체');
  });

  it('should update selectedRegion when setSelectedRegion is called', async () => {
    const { useLuckySpots } = require('../../hooks/useLuckySpots');
    const { result } = renderHook(() => useLuckySpots(), { wrapper: createWrapper() });
    act(() => {
      result.current.setSelectedRegion('서울');
    });
    expect(result.current.selectedRegion).toBe('서울');
  });

  it('should call handleSpotPress without error', async () => {
    const { useLuckySpots } = require('../../hooks/useLuckySpots');
    const { result } = renderHook(() => useLuckySpots(), { wrapper: createWrapper() });
    // Should not throw
    expect(() => {
      act(() => {
        result.current.handleSpotPress(42);
      });
    }).not.toThrow();
  });

  it('should update region when moveToCurrentLocation is called with permission', async () => {
    const Location = require('expo-location');
    const { useLuckySpots } = require('../../hooks/useLuckySpots');
    const { result } = renderHook(() => useLuckySpots(), { wrapper: createWrapper() });
    await act(async () => {
      await result.current.moveToCurrentLocation();
    });
    expect(Location.getCurrentPositionAsync).toHaveBeenCalled();
  });

  it('should not update region when location permission denied', async () => {
    const Location = require('expo-location');
    Location.requestForegroundPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });
    const { useLuckySpots } = require('../../hooks/useLuckySpots');
    const { result } = renderHook(() => useLuckySpots(), { wrapper: createWrapper() });
    const initialRegion = result.current.region;
    await act(async () => {
      await result.current.moveToCurrentLocation();
    });
    expect(result.current.region).toEqual(initialRegion);
  });
});
