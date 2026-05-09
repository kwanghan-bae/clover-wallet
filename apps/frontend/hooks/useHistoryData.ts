import { useState, useCallback, useMemo } from 'react';
import { useFocusEffect } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ticketsApi } from '../api/tickets';
import type { LottoTicket } from '../api/tickets';
import type { LottoSetRecord } from '../api/types/lotto';
import { loadItem, StorageKeys, removeFromItemArray } from '../utils/storage';
import { toSetRecord } from '../utils/lotto';

export interface HistoryRecord extends LottoSetRecord {
  _ticketStatus?: string;
}

export function useHistoryData() {
  const [localHistory, setLocalHistory] = useState<LottoSetRecord[]>([]);

  const { data: ticketData } = useQuery({
    queryKey: ['myTickets'],
    /* istanbul ignore next */
    queryFn: () => ticketsApi.getMyTickets(0, 100),
  });

  const loadLocalHistory = useCallback(() => {
    const raw = loadItem<unknown[]>(StorageKeys.SAVED_NUMBERS) || [];
    setLocalHistory(raw.map(toSetRecord));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLocalHistory();
    }, [loadLocalHistory]),
  );

  const handleDelete = useCallback(
    (id: number) => {
      removeFromItemArray<LottoSetRecord>(
        StorageKeys.SAVED_NUMBERS,
        (item) => item.id === id,
      );
      loadLocalHistory();
    },
    [loadLocalHistory],
  );

  const backendRecords = useMemo<HistoryRecord[]>(() => {
    /* istanbul ignore next */
    return (ticketData?.content ?? []).map((ticket: LottoTicket) => ({
      id: ticket.id,
      method: 'TICKET',
      createdAt: ticket.createdAt,
      round: ticket.ordinal,
      games: (ticket.games ?? []).map((game) => ({
        numbers: [
          game.number1, game.number2, game.number3,
          game.number4, game.number5, game.number6,
        ],
      })),
      // 첫 게임의 status를 묶음 대표 status로 사용 (YAGNI — 종합 status는 별도 task)
      _ticketStatus: ticket.games?.[0]?.status,
    }));
  }, [ticketData]);

  const records = useMemo<HistoryRecord[]>(
    () => [...backendRecords, ...localHistory],
    [backendRecords, localHistory],
  );

  return { records, handleDelete };
}
