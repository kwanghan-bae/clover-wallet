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
