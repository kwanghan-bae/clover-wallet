/**
 * @description 로또 당첨 등수와 상태를 정의하는 타입입니다.
 */
export type LottoRankStatus =
  | 'WINNING_1'
  | 'WINNING_2'
  | 'WINNING_3'
  | 'WINNING_4'
  | 'WINNING_5'
  | 'LOSING';

/**
 * @description 로또 당첨 등수와 당첨금을 계산하는 유틸리티 클래스입니다.
 */
export class LottoRankCalculator {
  static calculateRank(
    gameNumbers: number[],
    winningNumbers: number[],
    bonusNumber: number,
    prizeAmounts: { [key in LottoRankStatus]?: bigint },
  ): { status: LottoRankStatus; prize: bigint } {
    const mySet = new Set(gameNumbers);
    const winSet = new Set(winningNumbers);

    const matchCount = [...mySet].filter((n) => winSet.has(n)).length;
    const bonusMatch = mySet.has(bonusNumber);

    let status: LottoRankStatus = 'LOSING';

    switch (matchCount) {
      case 6:
        status = 'WINNING_1';
        break;
      case 5:
        status = bonusMatch ? 'WINNING_2' : 'WINNING_3';
        break;
      case 4:
        status = 'WINNING_4';
        break;
      case 3:
        status = 'WINNING_5';
        break;
      default:
        status = 'LOSING';
    }

    return {
      status,
      prize: prizeAmounts[status] || BigInt(0),
    };
  }

  static getRankName(status: string): string {
    const names: { [key: string]: string } = {
      WINNING_1: '1등',
      WINNING_2: '2등',
      WINNING_3: '3등',
      WINNING_4: '4등',
      WINNING_5: '5등',
      LOSING: '낙첨',
    };
    return names[status] || '당첨';
  }
}
