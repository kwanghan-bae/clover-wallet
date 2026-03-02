/**
 * 로또 관련 유틸리티 함수 모음입니다.
 * 당첨 여부 확인, 번호 정렬, 포맷팅 등을 처리합니다.
 */

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
 * 로또 번호를 무작위로 생성하여 오름차순으로 정렬하여 반환합니다.
 * @returns 1~45 사이의 고유한 숫자 6개
 */
export const generateLottoNumbers = (): number[] => {
  const numbers: number[] = [];
  while (numbers.length < 6) {
    const num = Math.floor(Math.random() * 45) + 1;
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  return sortLottoNumbers(numbers);
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

/**
 * 로또 번호를 오름차순으로 정렬하여 반환합니다.
 * @param numbers 정렬할 번호 배열
 */
export const sortLottoNumbers = (numbers: number[]): number[] => {
  return [...numbers].sort((a, b) => a - b);
};
