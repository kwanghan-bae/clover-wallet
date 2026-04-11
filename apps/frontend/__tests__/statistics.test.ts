import { calculateTotalWinnings, calculateROI, calculateNumberFrequency, GameRecord } from '../utils/statistics';

describe('Statistics Logic', () => {
  const mockGames: GameRecord[] = [
    { numbers: [1, 2, 3, 4, 5, 6], prize: 5000, cost: 1000 },
    { numbers: [1, 10, 20, 30, 40, 45], prize: 0, cost: 1000 },
    { numbers: [2, 3, 4, 11, 12, 13], prize: 50000, cost: 1000 },
  ];

  test('should calculate total winnings correctly', () => {
    expect(calculateTotalWinnings(mockGames)).toBe(55000);
  });

  test('should calculate ROI correctly', () => {
    // Total cost = 3000, Total winnings = 55000
    // Profit = 52000
    // ROI = (52000 / 3000) * 100 = 1733.333...
    expect(calculateROI(mockGames)).toBe(1733.3);
  });

  test('should return 0 ROI if total cost is 0', () => {
    expect(calculateROI([])).toBe(0);
  });

  test('should calculate number frequency correctly', () => {
    const freq = calculateNumberFrequency(mockGames);
    expect(freq[1]).toBe(2); // In first and second game
    expect(freq[2]).toBe(2); // In first and third game
    expect(freq[45]).toBe(1);
    expect(freq[99]).toBeUndefined();
  });
});
