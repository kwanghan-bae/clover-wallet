/**
 * 당첨 등수를 계산합니다.
 * @param numbers 선택한 번호 6개
 * @param winningNumbers 당첨 번호 6개
 * @param bonusNumber 보너스 번호
 * @returns 등수 (1~5, 0은 꽝)
 */
export const calculateLottoRank = (
  numbers: number[],
  winningNumbers: number[],
  bonusNumber: number,
): number => {
  const matchCount = numbers.filter((n) => winningNumbers.includes(n)).length;

  if (matchCount === 6) return 1;
  if (matchCount === 5 && numbers.includes(bonusNumber)) return 2;
  if (matchCount === 5) return 3;
  if (matchCount === 4) return 4;
  if (matchCount === 3) return 5;
  return 0;
};

/**
 * 두 번호 배열 간 일치하는 숫자의 개수를 반환합니다.
 * @param numbers 나의 번호
 * @param winningNumbers 당첨 번호
 */
export const compareNumbers = (
  numbers: number[],
  winningNumbers: number[],
): number => {
  return numbers.filter((n) => winningNumbers.includes(n)).length;
};
