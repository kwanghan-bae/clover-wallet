jest.mock('../../../utils/storage', () => ({
  appendToItemArray: jest.fn(),
  StorageKeys: { SAVED_NUMBERS: 'lotto.saved_numbers' },
}));

import { saveLottoSet } from '../../../utils/lotto/history';
import { appendToItemArray, StorageKeys } from '../../../utils/storage';

describe('saveLottoSet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(1700000000000);
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2026-05-09T00:00:00.000Z');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('saved-numbers 키에 묶음 레코드 push', () => {
    const games = [
      { numbers: [1, 2, 3, 4, 5, 6] },
      { numbers: [7, 8, 9, 10, 11, 12] },
    ];
    const result = saveLottoSet({ method: 'SAJU', param: '1990-01-01', games });

    expect(appendToItemArray).toHaveBeenCalledWith(StorageKeys.SAVED_NUMBERS, {
      id: 1700000000000,
      method: 'SAJU',
      param: '1990-01-01',
      createdAt: '2026-05-09T00:00:00.000Z',
      games,
    });
    expect(result.id).toBe(1700000000000);
    expect(result.games).toEqual(games);
  });

  test('param 없이도 저장 가능', () => {
    const games = [{ numbers: [1, 2, 3, 4, 5, 6] }];
    saveLottoSet({ method: 'STATISTICS_HOT', games });

    expect(appendToItemArray).toHaveBeenCalledWith(
      StorageKeys.SAVED_NUMBERS,
      expect.objectContaining({ method: 'STATISTICS_HOT', games }),
    );
  });
});
