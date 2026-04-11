export type LottoGameStatus =
  | 'NOT_CHECKED'
  | 'WINNING_1'
  | 'WINNING_2'
  | 'WINNING_3'
  | 'WINNING_4'
  | 'WINNING_5'
  | 'LOSING'
  | 'STASHED'
  | 'WINNING';

export interface LottoGame {
  id: bigint;
  status: LottoGameStatus;
  number1: number;
  number2: number;
  number3: number;
  number4: number;
  number5: number;
  number6: number;
  extractionMethod?: string;
  prizeAmount?: bigint;
}

export interface LottoTicket {
  id: bigint;
  userId: bigint;
  ordinal: number;
  status: string;
  games: LottoGame[];
  createdAt?: string;
}

export interface WinningInfo {
  round: number;
  drawDate: string;
  number1: number;
  number2: number;
  number3: number;
  number4: number;
  number5: number;
  number6: number;
  bonusNumber: number;
  firstPrizeAmount: bigint;
  secondPrizeAmount: bigint;
  thirdPrizeAmount: bigint;
  fourthPrizeAmount: bigint;
  fifthPrizeAmount: bigint;
}

export interface PrizeAmountMap {
  WINNING_1: bigint;
  WINNING_2: bigint;
  WINNING_3: bigint;
  WINNING_4: bigint;
  WINNING_5: bigint;
}
