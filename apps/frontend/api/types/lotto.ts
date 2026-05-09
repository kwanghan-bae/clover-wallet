import type { LottoGameStatus } from '@clover/shared';

export type { LottoGameStatus };

/** Frontend-normalized format: backend number1~6 → numbers array */
export interface LottoRecord {
  id: number;
  status: LottoGameStatus;
  numbers: number[];
  createdAt: string;
  round?: number;
  prizeAmount?: number;
}

/** Raw backend DTO before normalization */
export interface LottoGameResponse {
  id: number;
  status: LottoGameStatus;
  number1: number;
  number2: number;
  number3: number;
  number4: number;
  number5: number;
  number6: number;
  createdAt: string;
}

/**
 * @description 한 번에 생성한 N세트 묶음 (1게임은 games.length===1).
 * 로컬 저장(saved-numbers) 및 향후 백엔드 ticket 매핑에 사용.
 */
export interface LottoSetRecord {
  id: number;
  method: string;
  param?: string;
  createdAt: string;
  games: GameSet[];
  /** 백엔드 ticket 매핑 시 사용. 로컬 저장 시 undefined. */
  round?: number;
}

export interface GameSet {
  numbers: number[];
}
