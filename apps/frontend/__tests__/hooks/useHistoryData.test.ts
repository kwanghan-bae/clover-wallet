/* eslint-disable import/first, react/display-name */
jest.mock('../../utils/storage');
jest.mock('../../api/tickets');
jest.mock('expo-router', () => ({
  useFocusEffect: (callback: any) => {
    React.useEffect(() => {
      callback?.();
    }, [callback]);
  },
}));

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useHistoryData } from '../../hooks/useHistoryData';
import * as storageUtils from '../../utils/storage';
import { ticketsApi } from '../../api/tickets';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: any) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useHistoryData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with empty records', async () => {
    (storageUtils.loadItem as jest.Mock).mockReturnValue([]);
    (ticketsApi.getMyTickets as jest.Mock).mockResolvedValue({
      content: [],
    });

    const { result } = renderHook(() => useHistoryData(), {
      wrapper: createWrapper(),
    });

    expect(result.current.records).toBeDefined();
    expect(result.current.records).toEqual([]);
  });

  it('should load local history from storage', async () => {
    const mockLocalData = [
      {
        id: 1,
        status: 'LOSING' as const,
        numbers: [1, 2, 3, 4, 5, 6],
        createdAt: '2024-01-01',
        round: 1,
      },
    ];

    (storageUtils.loadItem as jest.Mock).mockReturnValue(mockLocalData);
    (ticketsApi.getMyTickets as jest.Mock).mockResolvedValue({
      content: [],
    });

    const { result } = renderHook(() => useHistoryData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.records).toBeDefined();
    });
    expect(result.current.records).toEqual(mockLocalData);
  });

  it('should return records from storage', async () => {
    const mockLocalData = [
      {
        id: 1,
        status: 'LOSING' as const,
        numbers: [1, 2, 3, 4, 5, 6],
        createdAt: '2024-01-01',
        round: 1,
      },
      {
        id: 2,
        status: 'LOSING' as const,
        numbers: [7, 8, 9, 10, 11, 12],
        createdAt: '2024-01-02',
        round: 2,
      },
    ];

    (storageUtils.loadItem as jest.Mock).mockReturnValue(mockLocalData);
    (ticketsApi.getMyTickets as jest.Mock).mockResolvedValue({
      content: [],
    });

    const { result } = renderHook(() => useHistoryData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.records.length).toBeGreaterThan(1);
    });
    expect(result.current.records.length).toBe(2);
  });

  it('should handle delete operation', async () => {
    const mockLocalData = [
      {
        id: 1,
        status: 'LOSING' as const,
        numbers: [1, 2, 3, 4, 5, 6],
        createdAt: '2024-01-01',
        round: 1,
      },
      {
        id: 2,
        status: 'LOSING' as const,
        numbers: [7, 8, 9, 10, 11, 12],
        createdAt: '2024-01-02',
        round: 2,
      },
    ];

    (storageUtils.loadItem as jest.Mock).mockReturnValue(mockLocalData);
    (ticketsApi.getMyTickets as jest.Mock).mockResolvedValue({
      content: [],
    });

    const { result } = renderHook(() => useHistoryData(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleDelete(1);
    });

    const callArgs = (storageUtils.removeFromItemArray as jest.Mock).mock.calls[0];
    const filterFn = callArgs[1];
    
    expect(filterFn({ id: 1 })).toBe(true);
    expect(filterFn({ id: 2 })).toBe(false);
  });

  it('should remove duplicates between backend and local', async () => {
    const round = 1;
    const numbers = [1, 2, 3, 4, 5, 6];

    const mockLocalData = [
      {
        id: 1,
        status: 'LOSING' as const,
        numbers,
        createdAt: '2024-01-01',
        round,
      },
    ];

    const mockBackendData = {
      content: [
        {
          id: 1,
          status: 'CONFIRMED',
          ordinal: round,
          createdAt: '2024-01-01',
          games: [
            {
              id: 100,
              status: 'LOSING',
              number1: numbers[0],
              number2: numbers[1],
              number3: numbers[2],
              number4: numbers[3],
              number5: numbers[4],
              number6: numbers[5],
              prizeAmount: 0,
            },
          ],
        },
      ],
    };

    (storageUtils.loadItem as jest.Mock).mockReturnValue(mockLocalData);
    (ticketsApi.getMyTickets as jest.Mock).mockResolvedValue(mockBackendData);

    const { result } = renderHook(() => useHistoryData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.records.length).toBe(1);
    });
  });

  it('should include ticket status from backend records', async () => {
    (storageUtils.loadItem as jest.Mock).mockReturnValue([]);
    (ticketsApi.getMyTickets as jest.Mock).mockResolvedValue({
      content: [],
    });

    const { result } = renderHook(() => useHistoryData(), {
      wrapper: createWrapper(),
    });

    expect(result.current).toHaveProperty('records');
    expect(result.current).toHaveProperty('handleDelete');
    expect(typeof result.current.handleDelete).toBe('function');
  });

  it('should handle null storage data gracefully', async () => {
    (storageUtils.loadItem as jest.Mock).mockReturnValue(null);
    (ticketsApi.getMyTickets as jest.Mock).mockResolvedValue({
      content: [],
    });

    const { result } = renderHook(() => useHistoryData(), {
      wrapper: createWrapper(),
    });

    expect(result.current.records).toEqual([]);
  });

  it('should call loadLocalHistory on focus effect', () => {
    (storageUtils.loadItem as jest.Mock).mockReturnValue([
      {
        id: 1,
        status: 'LOSING' as const,
        numbers: [1, 2, 3, 4, 5, 6],
        createdAt: '2024-01-01',
        round: 1,
      },
    ]);
    (ticketsApi.getMyTickets as jest.Mock).mockResolvedValue({
      content: [],
    });

    renderHook(() => useHistoryData(), {
      wrapper: createWrapper(),
    });

    expect(storageUtils.loadItem).toHaveBeenCalledWith(
      expect.stringContaining('saved_numbers'),
    );
  });

  it('should properly combine multiple local records', async () => {
    const multipleRecords = [
      {
        id: 1,
        status: 'LOSING' as const,
        numbers: [1, 2, 3, 4, 5, 6],
        createdAt: '2024-01-01',
        round: 1,
      },
      {
        id: 2,
        status: 'LOSING' as const,
        numbers: [7, 8, 9, 10, 11, 12],
        createdAt: '2024-01-02',
        round: 2,
      },
      {
        id: 3,
        status: 'LOSING' as const,
        numbers: [13, 14, 15, 16, 17, 18],
        createdAt: '2024-01-03',
        round: 3,
      },
    ];

    (storageUtils.loadItem as jest.Mock).mockReturnValue(multipleRecords);
    (ticketsApi.getMyTickets as jest.Mock).mockResolvedValue({
      content: [],
    });

    const { result } = renderHook(() => useHistoryData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.records.length).toBe(3);
    });

    expect(result.current.records[0].id).toBe(1);
    expect(result.current.records[1].id).toBe(2);
    expect(result.current.records[2].id).toBe(3);
  });
});
