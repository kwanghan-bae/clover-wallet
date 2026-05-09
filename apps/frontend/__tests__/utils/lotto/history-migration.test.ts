import { toSetRecord } from '../../../utils/lotto/history-migration';

/**
 * @description 레거시 단일 레코드 → LottoSetRecord 변환 테스트.
 */
describe('toSetRecord', () => {
  test('레거시 단일 numbers → games:[{numbers}] 변환', () => {
    const legacy = {
      id: 123,
      method: 'SAJU',
      numbers: [3, 7, 12, 19, 28, 41],
      createdAt: '2026-05-09T00:00:00.000Z',
    };
    const result = toSetRecord(legacy);
    expect(result).toEqual({
      id: 123,
      method: 'SAJU',
      createdAt: '2026-05-09T00:00:00.000Z',
      games: [{ numbers: [3, 7, 12, 19, 28, 41] }],
    });
  });

  test('이미 games[]이 있으면 그대로 반환', () => {
    const newer = {
      id: 456,
      method: 'DREAM',
      param: '용꿈',
      createdAt: '2026-05-09T01:00:00.000Z',
      games: [
        { numbers: [1, 2, 3, 4, 5, 6] },
        { numbers: [7, 8, 9, 10, 11, 12] },
      ],
    };
    const result = toSetRecord(newer);
    expect(result).toEqual(newer);
  });

  test('legacy + param 필드 → 보존', () => {
    const legacy = {
      id: 789,
      method: 'DREAM',
      param: '돼지꿈',
      numbers: [5, 10, 15, 20, 25, 30],
      createdAt: '2026-05-09T02:00:00.000Z',
    };
    const result = toSetRecord(legacy);
    expect(result.param).toBe('돼지꿈');
    expect(result.games).toEqual([{ numbers: [5, 10, 15, 20, 25, 30] }]);
  });
});
