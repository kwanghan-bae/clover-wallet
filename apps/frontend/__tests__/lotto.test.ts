import { generateLottoNumbers, compareNumbers, calculateLottoRank } from '../utils/lotto';

/**
 * 프론트엔드 로또 로직에 대한 단위 테스트입니다.
 * 번호 생성 규칙 및 당첨 번호 대조 기능을 검증합니다.
 */
describe('Lotto Logic', () => {
  test('should generate 6 unique numbers', () => {
    const numbers = generateLottoNumbers();
    const uniqueNumbers = new Set(numbers);
    
    expect(numbers).toHaveLength(6);
    expect(uniqueNumbers.size).toBe(6);
  });

  test('numbers should be within 1-45 range', () => {
    const numbers = generateLottoNumbers();
    numbers.forEach((num: number) => {
      expect(num).toBeGreaterThanOrEqual(1);
      expect(num).toBeLessThanOrEqual(45);
    });
  });

  test('numbers should be sorted ascending', () => {
    const numbers = generateLottoNumbers();
    const sorted = [...numbers].sort((a, b) => a - b);
    expect(numbers).toEqual(sorted);
  });

  test('compareNumbers should return correct matching count', () => {
    const my = [1, 2, 3, 4, 5, 6];
    const win = [1, 2, 3, 10, 11, 12];
    expect(compareNumbers(my, win)).toBe(3);
  });

  describe('calculateLottoRank', () => {
    const win = [1, 2, 3, 4, 5, 6];
    const bonus = 7;

    test('should return 1 for 6 matches', () => {
      expect(calculateLottoRank([1, 2, 3, 4, 5, 6], win, bonus)).toBe(1);
    });

    test('should return 2 for 5 matches + bonus', () => {
      expect(calculateLottoRank([1, 2, 3, 4, 5, 7], win, bonus)).toBe(2);
    });

    test('should return 3 for 5 matches without bonus', () => {
      expect(calculateLottoRank([1, 2, 3, 4, 5, 8], win, bonus)).toBe(3);
    });

    test('should return 4 for 4 matches', () => {
      expect(calculateLottoRank([1, 2, 3, 4, 10, 11], win, bonus)).toBe(4);
    });

    test('should return 5 for 3 matches', () => {
      expect(calculateLottoRank([1, 2, 3, 10, 11, 12], win, bonus)).toBe(5);
    });

    test('should return 0 for less than 3 matches', () => {
      expect(calculateLottoRank([1, 2, 10, 11, 12, 13], win, bonus)).toBe(0);
    });
  });
});
