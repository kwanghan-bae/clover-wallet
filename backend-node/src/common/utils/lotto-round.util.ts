/**
 * 현재 날짜를 기준으로 로또 회차를 계산합니다.
 * 기준일: 2002-12-07 (1회차 추첨일)
 */
export function calculateCurrentRound(): number {
  const baseDate = new Date('2002-12-07');
  const now = new Date();
  const diffMs = now.getTime() - baseDate.getTime();
  const weeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  return weeks + 1;
}
