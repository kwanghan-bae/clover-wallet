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

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useStatistics', () => {
  it('should provide stats and local number frequency', () => {
    const { useStatistics } = require('../../hooks/useStatistics');
    const { result } = renderHook(() => useStatistics(), { wrapper: createWrapper() });
    expect(result.current).toHaveProperty('stats');
    expect(result.current).toHaveProperty('numberFrequency');
    expect(result.current).toHaveProperty('isLoading');
  });
});
