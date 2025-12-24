export enum LottoGameStatus {
  NOT_CHECKED = 'NOT_CHECKED',
  WINNING_1 = 'WINNING_1',
  WINNING_2 = 'WINNING_2',
  WINNING_3 = 'WINNING_3',
  WINNING_4 = 'WINNING_4',
  WINNING_5 = 'WINNING_5',
  LOSING = 'LOSING'
}

export interface LottoRecord {
  id: number;
  status: LottoGameStatus;
  numbers: number[]; // 백엔드 number1~6 필드를 변환하여 사용
  createdAt: string;
  round?: number;    // 티켓 정보에서 가져올 값
  prizeAmount?: number;
}

/**
 * 백엔드 DTO 규격
 */
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