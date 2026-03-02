import { LottoNumberExtractor } from '../lotto-number.extractor';
import { ExtractionMethod, ZodiacSign } from '../constants/lotto-extraction-data';

/**
 * LottoNumberExtractor에 대한 단위 테스트입니다.
 * 모든 추출 방식(꿈, 사주, 통계, 별자리 등)에 대한 번호 생성 로직을 검증합니다.
 */
describe('LottoNumberExtractor', () => {
  let extractor: LottoNumberExtractor;

  beforeEach(() => {
    extractor = new LottoNumberExtractor();
  });

  it('should be defined', () => {
    expect(extractor).toBeDefined();
  });

  it('should extract from RANDOM method', async () => {
    const numbers = await extractor.extract(ExtractionMethod.RANDOM);
    expect(numbers).toHaveLength(6);
    expect(new Set(numbers).size).toBe(6);
  });

  it('should extract from DREAM method', async () => {
    const numbers = await extractor.extract(ExtractionMethod.DREAM, { dreamKeyword: '돼지' });
    expect(numbers).toHaveLength(6);
    // DREAM keyword for '돼지' provides [8, 18, 28] as seeds
    expect(numbers).toContain(8);
    expect(numbers).toContain(18);
    expect(numbers).toContain(28);
  });

  it('should extract from SAJU method', async () => {
    const numbers = await extractor.extract(ExtractionMethod.SAJU, { birthDate: '1990-01-01' });
    expect(numbers).toHaveLength(6);
  });

  it('should extract from STATISTICS_HOT method', async () => {
    const numbers = await extractor.extract(ExtractionMethod.STATISTICS_HOT);
    expect(numbers).toHaveLength(6);
  });

  it('should extract from STATISTICS_COLD method', async () => {
    const numbers = await extractor.extract(ExtractionMethod.STATISTICS_COLD);
    expect(numbers).toHaveLength(6);
  });

  it('should extract from HOROSCOPE method', async () => {
    const numbers = await extractor.extract(ExtractionMethod.HOROSCOPE, { birthDate: '1990-01-01' });
    expect(numbers).toHaveLength(6);
  });

  it('should extract from PERSONAL_SIGNIFICANCE method', async () => {
    const numbers = await extractor.extract(ExtractionMethod.PERSONAL_SIGNIFICANCE, { personalKeywords: ['phone123445'] });
    expect(numbers).toHaveLength(6);
    expect(numbers).toContain(12);
    expect(numbers).toContain(34);
    expect(numbers).toContain(45); 
  });

  it('should extract from NATURE_PATTERNS method (Fibonacci)', async () => {
    const numbers = await extractor.extract(ExtractionMethod.NATURE_PATTERNS, { natureKeyword: '피보나치' });
    expect(numbers).toHaveLength(6);
    // Fibonacci: 1, 1, 2, 3, 5, 8, 13, 21, 34
    expect(numbers).toContain(1);
    expect(numbers).toContain(2);
    expect(numbers).toContain(3);
    expect(numbers).toContain(5);
    expect(numbers).toContain(8);
    expect(numbers).toContain(13);
  });

  it('should extract from ANCIENT_DIVINATION method', async () => {
    const numbers = await extractor.extract(ExtractionMethod.ANCIENT_DIVINATION, { divinationKeyword: '주역' });
    expect(numbers).toHaveLength(6);
  });

  it('should extract from COLORS_SOUNDS method', async () => {
    const numbers = await extractor.extract(ExtractionMethod.COLORS_SOUNDS, { colorKeyword: '빨강' });
    expect(numbers).toHaveLength(6);
  });

  it('should extract from ANIMAL_OMENS method', async () => {
    const numbers = await extractor.extract(ExtractionMethod.ANIMAL_OMENS, { animalKeyword: '돼지' });
    expect(numbers).toHaveLength(6);
  });

  describe('Zodiac Sign logic', () => {
    it('should return correct zodiac sign for March 2nd (Pisces)', () => {
      // @ts-ignore (Access private method for testing)
      const sign = extractor.getZodiacSign(3, 2);
      expect(sign).toBe(ZodiacSign.PISCES);
    });
  });
});
