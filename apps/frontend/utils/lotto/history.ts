import type { LottoSetRecord, GameSet } from '../../api/types/lotto';
import { appendToItemArray, StorageKeys } from '../storage';

/**
 * @description 묶음 레코드를 로컬 history에 저장. 1게임 / 5게임 / 10게임 모두 동일.
 */
export const saveLottoSet = (input: {
  method: string;
  param?: string;
  games: GameSet[];
}): LottoSetRecord => {
  const record: LottoSetRecord = {
    id: Date.now(),
    method: input.method,
    param: input.param,
    createdAt: new Date().toISOString(),
    games: input.games,
  };
  appendToItemArray(StorageKeys.SAVED_NUMBERS, record);
  return record;
};
