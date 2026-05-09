/**
 * @description 게임 인덱스를 알파벳 라벨로 변환 (0 → 'A', 1 → 'B', ...).
 * 10게임 max 사용 환경이라 'A'~'J'까지가 실제 사용 범위.
 */
export const labelOf = (index: number): string => {
  return String.fromCharCode(65 + index);
};
