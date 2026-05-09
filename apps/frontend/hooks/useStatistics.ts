import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../api/users';
import type { LottoSetRecord } from '../api/types/lotto';
import { loadItem, StorageKeys } from '../utils/storage';
import { toSetRecord } from '../utils/lotto';
import { calculateNumberFrequency } from '../utils/statistics';

export function useStatistics() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['myStats'],
    queryFn: () => usersApi.getMyStats(),
  });

  const numberFrequency = useMemo(() => {
    const raw = loadItem<unknown[]>(StorageKeys.SAVED_NUMBERS) ?? [];
    const records: LottoSetRecord[] = raw.map(toSetRecord);
    // 1 LottoSetRecord(N games) → N flattened game records for frequency calc
    const games = records.flatMap((r) =>
      r.games.map((g) => ({ numbers: g.numbers, prize: 0, cost: 1000 })),
    );
    return calculateNumberFrequency(games);
  }, []);

  return { stats: stats ?? null, numberFrequency, isLoading };
}
