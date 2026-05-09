/* eslint-disable import/first, react/display-name */
jest.mock('../../utils/storage');
jest.mock('../../api/users', () => ({
  usersApi: {
    getMyStats: jest.fn().mockResolvedValue({
      totalGames: 50, totalWinnings: 125000, totalSpent: 50000, roi: 150,
    }),
  },
}));

import { renderHook } from '@testing-library/react-native';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as storageUtils from '../../utils/storage';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useStatistics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should provide stats and local number frequency', () => {
    const { useStatistics } = require('../../hooks/useStatistics');
    const { result } = renderHook(() => useStatistics(), { wrapper: createWrapper() });
    expect(result.current).toHaveProperty('stats');
    expect(result.current).toHaveProperty('numberFrequency');
    expect(result.current).toHaveProperty('isLoading');
  });

  it('legacy 단일 numbers 레코드 + 신규 LottoSetRecord 묶음 → 모두 통계 반영', () => {
    (storageUtils.loadItem as jest.Mock).mockReturnValue([
      // legacy single-numbers record
      {
        id: 1,
        numbers: [1, 2, 3, 4, 5, 6],
        method: 'OLD',
        createdAt: '2026-05-01T00:00:00.000Z',
      },
      // new multi-game record (3 sets)
      {
        id: 2,
        method: 'SAJU',
        createdAt: '2026-05-09T00:00:00.000Z',
        games: [
          { numbers: [7, 8, 9, 10, 11, 12] },
          { numbers: [13, 14, 15, 16, 17, 18] },
          { numbers: [19, 20, 21, 22, 23, 24] },
        ],
      },
    ]);

    const { useStatistics } = require('../../hooks/useStatistics');
    const { result } = renderHook(() => useStatistics(), { wrapper: createWrapper() });

    // Total games processed = 1 (legacy) + 3 (new bundle) = 4
    // Numbers 1–24 each appear exactly once
    expect(result.current.numberFrequency).toBeDefined();
    expect(result.current.numberFrequency[1]).toBe(1); // legacy path
    expect(result.current.numberFrequency[6]).toBe(1); // legacy path tail
    expect(result.current.numberFrequency[7]).toBe(1); // first new-bundle game
    expect(result.current.numberFrequency[15]).toBe(1); // middle new-bundle game
    expect(result.current.numberFrequency[19]).toBe(1); // last new-bundle game
    expect(result.current.numberFrequency[24]).toBe(1); // last new-bundle tail
    // No double-counting
    expect(result.current.numberFrequency[25]).toBeUndefined();
  });
});
