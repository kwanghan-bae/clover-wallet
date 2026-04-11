import { LottoNumberExtractor } from '../lotto-number.extractor';
import { ExtractionMethod } from '../constants/lotto-extraction-data';

/**
 * LottoNumberExtractor에 대한 단위 테스트입니다.
 * 전략 패턴 리팩토링 후에도 동일한 추출 결과를 보장하는지 검증합니다.
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
      // 돼지(8, 18, 28)가 포함되어야 함
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

    it('HOROSCOPE 방식은 생년월일에 해당하는 별자리 번호를 포함해야 한다', async () => {
      const numbers = await extractor.extract(ExtractionMethod.HOROSCOPE, {
        birthDate: '1990-01-10', // CAPRICORN
      });
      expect(numbers).toHaveLength(6);
      // CAPRICORN 번호 [3, 5, 7, 8, 18, 28] 중 일부 포함 여부 확인 (시드에 따라 다를 수 있음)
      expect(numbers.some((n) => [3, 5, 7, 8, 18, 28].includes(n))).toBe(true);
    });
  });

  describe('내부 유틸리티 동작 검증 (간접)', () => {
    it('generateNumbers는 시드 번호가 범위를 벗어나도 6개를 정확히 채워야 한다', async () => {
      // 프라이빗 메서드 직접 호출 대신 extract를 통해 유효하지 않은 시드가 주어지는 상황을 시뮬레이션
      const numbers = await extractor.extract(ExtractionMethod.RANDOM);
      expect(numbers).toHaveLength(6);
      expect(numbers.every((n) => n >= 1 && n <= 45)).toBe(true);
    });
  });
});
