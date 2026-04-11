/**
 * 로또 번호의 범위에 따른 UI 표시 색상 클래스를 반환합니다.
 * @param n 로또 번호 (1~45)
 */
export const getNumberColor = (n: number): string => {
  if (n <= 10) return 'bg-[#FFA726]'; // 노란색 (1~10)
  if (n <= 20) return 'bg-[#42A5F5]'; // 파란색 (11~20)
  if (n <= 30) return 'bg-[#EF5350]'; // 빨간색 (21~30)
  if (n <= 40) return 'bg-[#9E9E9E]'; // 회색 (31~40)
  return 'bg-[#66BB6A]'; // 초록색 (41~45)
};
