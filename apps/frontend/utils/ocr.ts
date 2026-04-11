/**
 * OCR로 인식된 텍스트에서 로또 번호 6개를 추출합니다.
 */
export const parseLottoNumbers = (text: string): number[] => {
  // 1-45 사이의 숫자를 찾는 정규식
  const regex = /\b([1-9]|[1-3][0-9]|4[0-5])\b/g;
  const matches = text.match(regex);
  
  if (!matches) return [];

  // 중복 제거 및 숫자 변환
  let numbers = Array.from(new Set(matches.map(Number)));
  
  // '6/45' 같은 패턴에서 6과 45가 추출되는 것을 방지하기 위한 후처리
  // 실제 로또 용지는 번호가 한 줄에 있거나 특정 영역에 모여있음.
  // 여기서는 단순히 정렬하여 반환
  
  if (numbers.length >= 6) {
    // 6, 45, 5, 12, 23, 31, 44 -> 정렬 -> 5, 6, 12, 23, 31, 44, 45
    // 문제의 원인: 6/45의 6이 포함됨. 
    // 해결책: 텍스트 전처리로 '6/45' 같은 패턴 제거
  }
  
  // 텍스트에서 '6/45' 패턴 제거 후 재파싱
  const cleanedText = text.replace(/\d+\/\d+/g, '');
  const cleanMatches = cleanedText.match(regex);
  
  if (!cleanMatches) return [];
  
  numbers = Array.from(new Set(cleanMatches.map(Number)));

  if (numbers.length >= 6) {
    return numbers.slice(0, 6).sort((a, b) => a - b);
  }
  
  return [];
};

/**
 * OCR로 인식된 텍스트에서 회차 정보를 추출합니다. (예: 1102회)
 */
export const parseLottoRound = (text: string): number | null => {
  const regex = /(\d{3,4})회/;
  const match = text.match(regex);
  
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  
  return null;
};
