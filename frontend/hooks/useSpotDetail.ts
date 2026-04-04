import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { spotsApi } from '../api/spots';
import { WinningHistory } from '../api/types/spots';
import { travelApi, TravelPlan } from '../api/travel';

/**
 * @description 판매점 상세 화면에서 필요한 데이터와 로직을 관리하는 커스텀 훅입니다.
 */
export function useSpotDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: history, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['spotHistory', id],
    queryFn: () => spotsApi.getSpotHistory(Number(id)),
    enabled: !!id,
  });

  const { data: travelPlans, isLoading: isTravelLoading } = useQuery({
    queryKey: ['travelPlans', id],
    queryFn: () => travelApi.getBySpot(Number(id)),
    enabled: !!id,
  });

  /**
   * 당첨 내역 데이터에서 특정 등수의 당첨 횟수를 계산합니다.
   */
  const getWinCount = (rank: number) => {
    return history?.filter((h: WinningHistory) => h.rank === rank).length || 0;
  };

  const spotInfo = history && history.length > 0 ? {
    name: history[0].storeName,
    address: history[0].address,
  } : null;

  return {
    id,
    history,
    isLoading: isHistoryLoading || isTravelLoading,
    spotInfo,
    getWinCount,
    travelPlans: travelPlans as TravelPlan[] | undefined,
  };
}
