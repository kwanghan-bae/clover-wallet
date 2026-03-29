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

/**
 * 특정 시드와 방법론을 사용하여 로또 번호를 생성합니다.
 * @param methodId 생성 방법론 ID
 * @param param 시드 생성을 위한 추가 파라미터
 * @returns 1~45 사이의 고유한 숫자 6개 (정렬됨)
 */
export const generateLottoNumbersWithSeed = (methodId: string, param?: string): number[] => {
  const numbers: Set<number> = new Set();
  const seed = param ? param.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : Math.random();
  
  // 프리미엄 느낌을 위한 결정론적 난수 생성 (Simple LCG)
  let currentSeed = seed;
  while (numbers.size < 6) {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    const num = Math.floor((currentSeed / 233280) * 45) + 1;
    if (num > 0) numbers.add(num);
  }
  
  return sortLottoNumbers(Array.from(numbers));
};

/**
 * 로또 번호의 범위에 따른 UI 표시 색상 클래스를 반환합니다.
 * @param n 로또 번호 (1~45)
 */
export const getNumberColor = (n: number): string => {
  if (n <= 10) return 'bg-[#FFA726]'; // 노란색 (1~10)
  if (n <= 20) return 'bg-[#42A5F5]'; // 파란색 (11~20)
  if (n <= 30) return 'bg-[#EF5350]'; // 빨간색 (21~30)
  if (n <= 40) return 'bg-[#9E9E9E]'; // 회색 (31~40)
  return 'bg-[#66BB6A]'; // 초록색 (41~45)
};
