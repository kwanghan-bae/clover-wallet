/**
 * 1부터 45 사이의 중복 없는 랜덤 숫자 6개를 생성합니다.
 */
export const generateLottoNumbers = (): number[] => {
  const numbers = new Set<number>();
  
  while (numbers.size < 6) {
    const randomNum = Math.floor(Math.random() * 45) + 1;
    numbers.add(randomNum);
  }
  
  return Array.from(numbers).sort((a, b) => a - b);
};

/**
 * 특정 회차의 당첨 번호와 비교하여 일치하는 개수를 반환합니다.
 */
export const compareNumbers = (myNumbers: number[], winNumbers: number[]): number => {
  return myNumbers.filter(num => winNumbers.includes(num)).length;
};
