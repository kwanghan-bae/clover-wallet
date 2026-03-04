import { LottoNumberExtractor } from '../lotto-number.extractor';
import {
  ExtractionMethod,
  ZodiacSign,
} from '../constants/lotto-extraction-data';

/**
 * LottoNumberExtractor에 대한 단위 테스트입니다.
 * 꿈, 사주, 별자리, 자연 패턴 등 다양한 알고리즘을 통한 번호 추출 로직과
 * 별자리 판별 분기를 전수 검증합니다.
 */
describe('LottoNumberExtractor', () => {
  let extractor: LottoNumberExtractor;

  beforeEach(() => {
    extractor = new LottoNumberExtractor();
  });

  describe('추출 메서드별 검증', () => {
    it('RANDOM 방식은 중복 없는 6개 번호를 생성해야 한다', async () => {
      const numbers = await extractor.extract(ExtractionMethod.RANDOM);
      expect(numbers).toHaveLength(6);
      expect(new Set(numbers).size).toBe(6);
    });

    it('DREAM 방식은 키워드에 맞는 시드 번호를 포함해야 한다', async () => {
      const numbers = await extractor.extract(ExtractionMethod.DREAM, {
        dreamKeyword: '돼지',
      });
      expect(numbers).toContain(8);
      expect(numbers).toContain(18);
      expect(numbers).toContain(28);
    });

    it('SAJU 방식은 생년월일 숫자의 합을 기반으로 번호를 생성해야 한다', async () => {
      const numbers = await extractor.extract(ExtractionMethod.SAJU, {
        birthDate: '1990-01-01',
      });
      expect(numbers).toHaveLength(6);
    });

    it('SAJU 방식에서 잘못된 날짜 형식인 경우 기본 랜덤 번호를 생성해야 한다', async () => {
      const numbers = await extractor.extract(ExtractionMethod.SAJU, {
        birthDate: 'invalid-date',
      });
      expect(numbers).toHaveLength(6);
    });

    it('PERSONAL_SIGNIFICANCE 방식은 키워드 내 숫자를 추출하여 포함해야 한다', async () => {
      const numbers = await extractor.extract(
        ExtractionMethod.PERSONAL_SIGNIFICANCE,
        {
          personalKeywords: ['lucky07', 'my1234phone'],
        },
      );
      expect(numbers).toContain(7);
      expect(numbers).toContain(12);
      expect(numbers).toContain(34);
    });

    it('NATURE_PATTERNS 방식 중 피보나치는 관련 수열 중 일부를 포함해야 한다', async () => {
      const numbers = await extractor.extract(
        ExtractionMethod.NATURE_PATTERNS,
        { natureKeyword: '피보나치' },
      );
      expect(numbers).toHaveLength(6);
      // 피보나치 수열 [1, 2, 3, 5, 8, 13, 21, 34] 중 앞의 6개가 선택됨
      expect(numbers).toContain(1);
      expect(numbers).toContain(13);
    });
  });

  describe('별자리(Zodiac Sign) 판별 로직 전수 검증', () => {
    const testCases = [
      { month: 1, day: 10, expected: ZodiacSign.CAPRICORN },
      { month: 1, day: 25, expected: ZodiacSign.AQUARIUS },
      { month: 2, day: 10, expected: ZodiacSign.AQUARIUS },
      { month: 2, day: 20, expected: ZodiacSign.PISCES },
      { month: 3, day: 10, expected: ZodiacSign.PISCES },
      { month: 3, day: 25, expected: ZodiacSign.ARIES },
      { month: 4, day: 10, expected: ZodiacSign.ARIES },
      { month: 4, day: 25, expected: ZodiacSign.TAURUS },
      { month: 5, day: 10, expected: ZodiacSign.TAURUS },
      { month: 5, day: 25, expected: ZodiacSign.GEMINI },
      { month: 6, day: 10, expected: ZodiacSign.GEMINI },
      { month: 6, day: 25, expected: ZodiacSign.CANCER },
      { month: 7, day: 10, expected: ZodiacSign.CANCER },
      { month: 7, day: 25, expected: ZodiacSign.LEO },
      { month: 8, day: 10, expected: ZodiacSign.LEO },
      { month: 8, day: 25, expected: ZodiacSign.VIRGO },
      { month: 9, day: 10, expected: ZodiacSign.VIRGO },
      { month: 9, day: 25, expected: ZodiacSign.LIBRA },
      { month: 10, day: 10, expected: ZodiacSign.LIBRA },
      { month: 10, day: 25, expected: ZodiacSign.SCORPIO },
      { month: 11, day: 10, expected: ZodiacSign.SCORPIO },
      { month: 11, day: 25, expected: ZodiacSign.SAGITTARIUS },
      { month: 12, day: 10, expected: ZodiacSign.SAGITTARIUS },
      { month: 12, day: 25, expected: ZodiacSign.CAPRICORN },
    ];

    testCases.forEach(({ month, day, expected }) => {
      it(`${month}월 ${day}일은 ${expected}여야 한다`, () => {
        // @ts-ignore (private method access)
        expect(extractor.getZodiacSign(month, day)).toBe(expected);
      });
    });
  });

  describe('내부 유틸리티 메서드 검증', () => {
    it('sumDigits는 각 자릿수의 합을 정확히 계산해야 한다', () => {
      // @ts-ignore
      expect(extractor.sumDigits(1234)).toBe(10);
      // @ts-ignore
      expect(extractor.sumDigits(999)).toBe(27);
    });

    it('generateNumbers는 시드 번호가 범위를 벗어나면 무시하고 6개를 채워야 한다', () => {
      // @ts-ignore
      const result = extractor.generateNumbers([0, 46, 100, 7]);
      expect(result).toHaveLength(6);
      expect(result).toContain(7);
      expect(result.every((n) => n >= 1 && n <= 45)).toBe(true);
    });
  });
});
