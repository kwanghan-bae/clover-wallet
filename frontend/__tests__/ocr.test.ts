import { parseLottoNumbers, parseLottoRound } from '../utils/ocr';

describe('OCR Parser', () => {
  test('should extract 6 numbers from noisy text', () => {
    const text = "제 1102회 로또 당첨번호 안내 [7] [13] [20] [24] 27 35 + 보너스 40";
    const result = parseLottoNumbers(text);
    
    expect(result).toEqual([7, 13, 20, 24, 27, 35]);
  });

  test('should handle multiple lines and symbols', () => {
    const text = "LOTTO 6/45\n1st: 5, 12, 23\n2nd: 31, 44, 45\nResult: Pass";
    const result = parseLottoNumbers(text);
    
    expect(result).toEqual([5, 12, 23, 31, 44, 45]);
  });

  test('should return empty array if less than 6 numbers found', () => {
    const text = "Only 1, 2, 3 here";
    expect(parseLottoNumbers(text)).toEqual([]);
  });

  test('should extract round number correctly', () => {
    const text = "제 1102회 동행복권 당첨";
    expect(parseLottoRound(text)).toBe(1102);
  });

  test('should return null if no round info found', () => {
    const text = "No round info here";
    expect(parseLottoRound(text)).toBeNull();
  });
});
