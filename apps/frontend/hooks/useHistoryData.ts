import { useState, useCallback, useMemo } from 'react';
import { useFocusEffect } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ticketsApi } from '../api/tickets';
import type { LottoTicket } from '../api/tickets';
import type { LottoRecord } from '../api/types/lotto';
import { loadItem, StorageKeys, removeFromItemArray } from '../utils/storage';

export interface HistoryRecord extends LottoRecord {
  _ticketStatus?: string;
}

export function useHistoryData() {
  const [localHistory, setLocalHistory] = useState<LottoRecord[]>([]);

  const { data: ticketData } = useQuery({
    queryKey: ['myTickets'],
    queryFn: () => ticketsApi.getMyTickets(0, 100),
  });

  const loadLocalHistory = useCallback(() => {
    const data = loadItem<LottoRecord[]>(StorageKeys.SAVED_NUMBERS) || [];
    setLocalHistory(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLocalHistory();
    }, [loadLocalHistory]),
  );

  const handleDelete = useCallback(
    (id: number) => {
      removeFromItemArray<LottoRecord>(
        StorageKeys.SAVED_NUMBERS,
        (item) => item.id === id,
      );
      loadLocalHistory();
    },
    [loadLocalHistory],
  );

  const backendRecords = useMemo<HistoryRecord[]>(() => {
    return (ticketData?.content ?? []).flatMap((ticket: LottoTicket) =>
      (ticket.games ?? []).map((game) => ({
        id: game.id,
        status: game.status as LottoRecord['status'],
        numbers: [
          game.number1,
          game.number2,
          game.number3,
          game.number4,
          game.number5,
          game.number6,
        ],
        createdAt: ticket.createdAt,
        round: ticket.ordinal,
        prizeAmount: game.prizeAmount,
        _ticketStatus: game.status,
      })),
    );
  }, [ticketData]);

  const records = useMemo<HistoryRecord[]>(() => {
    const backendSet = new Set(
      backendRecords.map(
        (r) =>
          `${r.round}-${[...r.numbers].sort((a, b) => a - b).join(',')}`,
      ),
    );
    const uniqueLocal = localHistory.filter(
      (r) =>
        !backendSet.has(
          `${r.round}-${[...r.numbers].sort((a, b) => a - b).join(',')}`,
        ),
    );
    return [...backendRecords, ...uniqueLocal];
  }, [backendRecords, localHistory]);

  return { records, handleDelete };
}
