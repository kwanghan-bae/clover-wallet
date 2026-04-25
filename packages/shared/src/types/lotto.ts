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
  id: number;
  status: LottoGameStatus;
  number1: number;
  number2: number;
  number3: number;
  number4: number;
  number5: number;
  number6: number;
  extractionMethod?: string;
  prizeAmount?: number;
  createdAt?: string;
}

export interface LottoTicket {
  id: number;
  userId: number;
  ordinal: number;
  status: 'STASHED' | 'WINNING' | 'LOSING';
  url?: string;
  games?: LottoGame[];
  createdAt: string;
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
  firstPrizeAmount: number;
  secondPrizeAmount: number;
  thirdPrizeAmount: number;
  fourthPrizeAmount: number;
  fifthPrizeAmount: number;
}

export interface PrizeAmountMap {
  WINNING_1: number;
  WINNING_2: number;
  WINNING_3: number;
  WINNING_4: number;
  WINNING_5: number;
}
