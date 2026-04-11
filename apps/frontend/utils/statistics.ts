/**
 * 당첨 통계 계산 유틸리티
 */

export interface GameRecord {
  numbers: number[];
  prize: number;
  cost: number;
}

/**
 * 총 당첨금 계산
 */
export const calculateTotalWinnings = (games: GameRecord[]): number => {
  return games.reduce((acc, game) => acc + game.prize, 0);
};

/**
 * 수익률(ROI) 계산
 */
export const calculateROI = (games: GameRecord[]): number => {
  const totalCost = games.reduce((acc, game) => acc + game.cost, 0);
  if (totalCost === 0) return 0;
  
  const totalWinnings = calculateTotalWinnings(games);
  const profit = totalWinnings - totalCost;
  
  return parseFloat(((profit / totalCost) * 100).toFixed(1));
};

/**
 * 번호별 출현 빈도 통계
 */
export const calculateNumberFrequency = (games: GameRecord[]): Record<number, number> => {
  const frequency: Record<number, number> = {};
  
  games.forEach(game => {
    game.numbers.forEach(num => {
      frequency[num] = (frequency[num] || 0) + 1;
    });
  });
  
  return frequency;
};
