import { labelOf } from '../../../utils/lotto/labels';

/**
 * @description 다중 게임 카드 라벨 헬퍼 테스트.
 */
describe('labelOf', () => {
  test('0 → A', () => {
    expect(labelOf(0)).toBe('A');
  });

  test('1 → B', () => {
    expect(labelOf(1)).toBe('B');
  });

  test('9 → J (10게임 max)', () => {
    expect(labelOf(9)).toBe('J');
  });

  test('25 → Z', () => {
    expect(labelOf(25)).toBe('Z');
  });
});
