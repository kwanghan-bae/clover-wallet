import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../api/users';
import { loadItem } from '../utils/storage';
import { calculateNumberFrequency } from '../utils/statistics';

interface LottoRecord { numbers: number[] }

export function useStatistics() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['myStats'],
    queryFn: () => usersApi.getMyStats(),
  });

  const numberFrequency = useMemo(() => {
    const records = loadItem<LottoRecord[]>('lotto.saved_numbers') ?? [];
    return calculateNumberFrequency(records.map((r) => ({ numbers: r.numbers, prize: 0, cost: 1000 })));
  }, []);

  return { stats: stats ?? null, numberFrequency, isLoading };
}
