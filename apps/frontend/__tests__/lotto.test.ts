import {
  generateLottoNumbers,
  generateLottoNumbersWithSeed,
  generateLottoGames,
  compareNumbers,
  calculateLottoRank,
} from '../utils/lotto';

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

  describe('generateLottoGames', () => {
    test('count=1, no param → 단일 set 반환', () => {
      const result = generateLottoGames('STATISTICS_HOT', 1);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(6);
      expect(new Set(result[0]).size).toBe(6);
    });

    test('count=5, no param → 5개 set, 모두 다름', () => {
      const result = generateLottoGames('STATISTICS_HOT', 5);
      expect(result).toHaveLength(5);
      const keys = result.map((set) => set.join(','));
      expect(new Set(keys).size).toBe(5);
    });

    test('count=5, param 있음 → 5개 set 모두 다름 (인덱스 다양화)', () => {
      const result = generateLottoGames('SAJU', 5, '1990-01-01');
      expect(result).toHaveLength(5);
      const keys = result.map((set) => set.join(','));
      expect(new Set(keys).size).toBe(5);
    });

    test('같은 method+param 두 번 호출 → 결정론 보존 (5세트 동일)', () => {
      const a = generateLottoGames('SAJU', 5, '1990-01-01');
      const b = generateLottoGames('SAJU', 5, '1990-01-01');
      expect(a).toEqual(b);
    });

    test('count=1, param 있음 → 기존 단일 시드 함수와 동일 결과 (1게임 호환)', () => {
      const single = generateLottoNumbersWithSeed('SAJU', '1990-01-01');
      const multi = generateLottoGames('SAJU', 1, '1990-01-01');
      expect(multi[0]).toEqual(single);
    });

    test('각 set은 6개 unique 1~45, 정렬됨', () => {
      const result = generateLottoGames('SAJU', 5, '1990-01-01');
      result.forEach((set) => {
        expect(set).toHaveLength(6);
        expect(new Set(set).size).toBe(6);
        set.forEach((n) => {
          expect(n).toBeGreaterThanOrEqual(1);
          expect(n).toBeLessThanOrEqual(45);
        });
        const sorted = [...set].sort((a, b) => a - b);
        expect(set).toEqual(sorted);
      });
    });
  });
});
