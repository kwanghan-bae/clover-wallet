import {
  sortLottoNumbers,
  generateLottoNumbers,
  generateLottoNumbersWithSeed,
} from '../../utils/lotto/generator';

describe('sortLottoNumbers', () => {
  it('sorts numbers in ascending order', () => {
    expect(sortLottoNumbers([6, 2, 4, 1, 5, 3])).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('returns a new array without mutating the original', () => {
    const original = [5, 3, 1];
    const sorted = sortLottoNumbers(original);
    expect(sorted).toEqual([1, 3, 5]);
    expect(original).toEqual([5, 3, 1]);
  });

  it('handles already sorted array', () => {
    expect(sortLottoNumbers([1, 2, 3, 4, 5, 6])).toEqual([1, 2, 3, 4, 5, 6]);
  });
});

describe('generateLottoNumbers', () => {
  it('generates exactly 6 numbers', () => {
    expect(generateLottoNumbers()).toHaveLength(6);
  });

  it('generates unique numbers', () => {
    const numbers = generateLottoNumbers();
    expect(new Set(numbers).size).toBe(6);
  });

  it('generates numbers in range 1-45', () => {
    const numbers = generateLottoNumbers();
    numbers.forEach((n) => {
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(45);
    });
  });

  it('generates numbers in ascending order', () => {
    const numbers = generateLottoNumbers();
    const sorted = [...numbers].sort((a, b) => a - b);
    expect(numbers).toEqual(sorted);
  });
});

describe('generateLottoNumbersWithSeed', () => {
  it('generates exactly 6 numbers', () => {
    const numbers = generateLottoNumbersWithSeed('birthday', '19900101');
    expect(numbers).toHaveLength(6);
  });

  it('generates unique numbers', () => {
    const numbers = generateLottoNumbersWithSeed('birthday', '19900101');
    expect(new Set(numbers).size).toBe(6);
  });

  it('generates numbers in range 1-45', () => {
    const numbers = generateLottoNumbersWithSeed('birthday', '19900101');
    numbers.forEach((n) => {
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(45);
    });
  });

  it('generates sorted numbers', () => {
    const numbers = generateLottoNumbersWithSeed('fortune', 'abc');
    const sorted = [...numbers].sort((a, b) => a - b);
    expect(numbers).toEqual(sorted);
  });

  it('works without param (uses Math.random as seed)', () => {
    const numbers = generateLottoNumbersWithSeed('random');
    expect(numbers).toHaveLength(6);
    expect(new Set(numbers).size).toBe(6);
  });

  it('produces deterministic results for same seed param', () => {
    const numbers1 = generateLottoNumbersWithSeed('test', 'same-seed');
    const numbers2 = generateLottoNumbersWithSeed('test', 'same-seed');
    expect(numbers1).toEqual(numbers2);
  });
});
