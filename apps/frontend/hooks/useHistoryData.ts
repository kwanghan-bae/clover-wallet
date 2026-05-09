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
    return (ticketData?.content ?? []).flatMap((ticket: LottoTicket) =>
      (ticket.games ?? []).map((game) => ({
        id: game.id,
        method: 'TICKET',
        createdAt: ticket.createdAt,
        round: ticket.ordinal,
        games: [{
          numbers: [
            game.number1, game.number2, game.number3,
            game.number4, game.number5, game.number6,
          ],
        }],
        _ticketStatus: game.status,
      })),
    );
  }, [ticketData]);

  const records = useMemo<HistoryRecord[]>(
    () => [...backendRecords, ...localHistory],
    [backendRecords, localHistory],
  );

  return { records, handleDelete };
}
