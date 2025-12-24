import { generateLottoNumbers, compareNumbers } from '../utils/lotto';

describe('Lotto Logic', () => {
  test('should generate 6 unique numbers', () => {
    const numbers = generateLottoNumbers();
    const uniqueNumbers = new Set(numbers);
    
    expect(numbers).toHaveLength(6);
    expect(uniqueNumbers.size).toBe(6);
  });

  test('numbers should be within 1-45 range', () => {
    const numbers = generateLottoNumbers();
    numbers.forEach(num => {
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
});
