/**
 * 로또 번호를 오름차순으로 정렬하여 반환합니다.
 * @param numbers 정렬할 번호 배열
 */
export const sortLottoNumbers = (numbers: number[]): number[] => {
  return [...numbers].sort((a, b) => a - b);
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
