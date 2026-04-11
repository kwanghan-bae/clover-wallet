/* eslint-disable import/first, react/display-name */
jest.unmock('@tanstack/react-query');
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn().mockReturnValue({ id: '1' }),
  useRouter: jest.fn().mockReturnValue({ push: jest.fn() }),
}));

jest.mock('../../api/spots', () => ({
  spotsApi: {
    getSpotHistory: jest.fn().mockResolvedValue([
      { round: 1100, rank: 1, storeName: '행운 복권방', address: '서울시' },
    ]),
  },
}));

jest.mock('../../api/travel', () => ({
  travelApi: {
    getBySpot: jest.fn().mockResolvedValue([]),
  },
}));

import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useSpotDetail', () => {
  it('should extract spot id from route params', () => {
    const { useSpotDetail } = require('../../hooks/useSpotDetail');
    const { result } = renderHook(() => useSpotDetail(), { wrapper: createWrapper() });
    expect(result.current.id).toBe('1');
  });

  it('should expose history, isLoading, spotInfo, and getWinCount', () => {
    const { useSpotDetail } = require('../../hooks/useSpotDetail');
    const { result } = renderHook(() => useSpotDetail(), { wrapper: createWrapper() });
    expect(result.current).toHaveProperty('history');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('spotInfo');
    expect(result.current).toHaveProperty('getWinCount');
    expect(typeof result.current.getWinCount).toBe('function');
  });

  it('should return 0 for getWinCount when history is not yet loaded', () => {
    const { useSpotDetail } = require('../../hooks/useSpotDetail');
    const { result } = renderHook(() => useSpotDetail(), { wrapper: createWrapper() });
    expect(result.current.getWinCount(1)).toBe(0);
  });

  it('should load history and populate spotInfo', async () => {
    const { useSpotDetail } = require('../../hooks/useSpotDetail');
    const { result } = renderHook(() => useSpotDetail(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.spotInfo).toEqual({ name: '행운 복권방', address: '서울시' });
  });

  it('should correctly count wins for a given rank', async () => {
    const { useSpotDetail } = require('../../hooks/useSpotDetail');
    const { result } = renderHook(() => useSpotDetail(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.getWinCount(1)).toBe(1);
    expect(result.current.getWinCount(2)).toBe(0);
  });
});
