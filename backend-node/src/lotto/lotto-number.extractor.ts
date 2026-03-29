import { Injectable } from '@nestjs/common';
import {
  ExtractionMethod,
  LottoExtractionData,
  ZodiacSign,
} from './constants/lotto-extraction-data';

/**
 * @description 로또 번호 추출을 위한 컨텍스트 인터페이스입니다.
 */
export interface ExtractionContext {
  /** @description 꿈 키워드 */
  dreamKeyword?: string;
  /** @description 생년월일 (ISO 날짜 문자열) */
  birthDate?: string;
  /** @description 개인적인 키워드 배열 */
  personalKeywords?: string[];
  /** @description 자연 패턴 키워드 */
  natureKeyword?: string;
  /** @description 점성/고대 점술 키워드 */
  divinationKeyword?: string;
  /** @description 색상 및 소리 키워드 */
  colorKeyword?: string;
  /** @description 동물 징조 키워드 */
  animalKeyword?: string;
}

/**
 * @description 다양한 기법(꿈, 사주, 통계 등)을 사용하여 로또 번호를 추출하는 서비스 클래스입니다.
 */
@Injectable()
export class LottoNumberExtractor {
  /** @description 로또 번호의 최솟값입니다. */
  private readonly LOTTO_MIN = 1;
  /** @description 로또 번호의 최댓값입니다. */
  private readonly LOTTO_MAX = 45;
  /** @description 추출할 로또 번호의 개수입니다. */
  private readonly LOTTO_COUNT = 6;

  /**
   * @description 지정된 방법과 컨텍스트를 사용하여 로또 번호를 추출합니다.
   * @param method 번호 추출 방법 (ExtractionMethod)
   * @param context 추출에 필요한 데이터 (ExtractionContext)
   * @returns 추출된 6개의 로또 번호 배열
   */
  async extract(
    method: ExtractionMethod,
    context: ExtractionContext = {},
  ): Promise<number[]> {
    let seedNumbers: number[] = [];

    switch (method) {
      case ExtractionMethod.DREAM:
        seedNumbers = this.extractFromDream(context.dreamKeyword);
        break;
      case ExtractionMethod.SAJU:
        seedNumbers = this.extractFromSaju(context.birthDate);
        break;
      case ExtractionMethod.STATISTICS_HOT:
        seedNumbers = this.getHotNumbers();
        break;
      case ExtractionMethod.STATISTICS_COLD:
        seedNumbers = this.getColdNumbers();
        break;
      case ExtractionMethod.HOROSCOPE:
        seedNumbers = this.extractFromHoroscope(context.birthDate);
        break;
      case ExtractionMethod.PERSONAL_SIGNIFICANCE:
        seedNumbers = this.extractFromPersonalSignificance(
          context.personalKeywords,
        );
        break;
      case ExtractionMethod.NATURE_PATTERNS:
        seedNumbers = this.extractFromNaturePatterns(context.natureKeyword);
        break;
      case ExtractionMethod.ANCIENT_DIVINATION:
        seedNumbers = this.extractFromAncientDivination(
          context.divinationKeyword,
        );
        break;
      case ExtractionMethod.COLORS_SOUNDS:
        seedNumbers = this.extractFromColorsSounds(context.colorKeyword);
        break;
      case ExtractionMethod.ANIMAL_OMENS:
        seedNumbers = this.extractFromAnimalOmens(context.animalKeyword);
        break;
      case ExtractionMethod.RANDOM:
      default:
        seedNumbers = [];
        break;
    }

    return this.generateNumbers(seedNumbers);
  }

  /**
   * @description 자주 출현하는 번호(Hot Numbers) 목록을 반환합니다.
   * @returns 번호 배열
   */
  private getHotNumbers(): number[] {
    // 현재는 임시 데이터를 반환합니다.
    return [34, 1, 13, 12, 27, 45, 17, 20, 33, 39];
  }

  /**
   * @description 드물게 출현하는 번호(Cold Numbers) 목록을 반환합니다.
   * @returns 번호 배열
   */
  private getColdNumbers(): number[] {
    // 현재는 임시 데이터를 반환합니다.
    return [9, 22, 23, 29, 30, 3, 6, 7, 10, 11];
  }

  /**
   * @description 꿈 키워드를 바탕으로 번호를 추출합니다.
   * @param keyword 꿈 관련 키워드
   * @returns 추출된 번호 배열
   */
  private extractFromDream(keyword?: string): number[] {
    if (!keyword) return [];
    return LottoExtractionData.dreamNumberMap[keyword] || [];
  }

  /**
   * @description 사주(생년월일)를 바탕으로 번호를 추출합니다.
   * @param birthDateStr 생년월일 문자열
   * @returns 추출된 번호 배열
   */
  private extractFromSaju(birthDateStr?: string): number[] {
    if (!birthDateStr) return [];
    const date = new Date(birthDateStr);
    if (isNaN(date.getTime())) return [];

    const yearSum = this.sumDigits(date.getFullYear());
    const monthSum = this.sumDigits(date.getMonth() + 1);
    const daySum = this.sumDigits(date.getDate());

    const sum = yearSum + monthSum + daySum;
    return [(sum % this.LOTTO_MAX) + 1];
  }

  /**
   * @description 숫자의 각 자릿수 합계를 계산합니다.
   * @param num 계산할 숫자
   * @returns 자릿수 합계
   */
  private sumDigits(num: number): number {
    return num
      .toString()
      .split('')
      .reduce((acc, curr) => acc + parseInt(curr), 0);
  }

  /**
   * @description 별자리를 바탕으로 번호를 추출합니다.
   * @param birthDateStr 생년월일 문자열
   * @returns 추출된 번호 배열
   */
  private extractFromHoroscope(birthDateStr?: string): number[] {
    if (!birthDateStr) return [];
    const date = new Date(birthDateStr);
    if (isNaN(date.getTime())) return [];
    const sign = this.getZodiacSign(date.getMonth() + 1, date.getDate());
    return LottoExtractionData.horoscopeNumberMap[sign] || [];
  }

  /**
   * @description 월과 일을 바탕으로 별자리를 판별합니다.
   * @param month 월
   * @param day 일
   * @returns 별자리 (ZodiacSign)
   */
  private getZodiacSign(month: number, day: number): ZodiacSign {
    const zodiacDates = [
      { sign: ZodiacSign.CAPRICORN, month: 1, day: 20 },
      { sign: ZodiacSign.AQUARIUS, month: 2, day: 18 },
      { sign: ZodiacSign.PISCES, month: 3, day: 20 },
      { sign: ZodiacSign.ARIES, month: 4, day: 20 },
      { sign: ZodiacSign.TAURUS, month: 5, day: 20 },
      { sign: ZodiacSign.GEMINI, month: 6, day: 21 },
      { sign: ZodiacSign.CANCER, month: 7, day: 22 },
      { sign: ZodiacSign.LEO, month: 8, day: 23 },
      { sign: ZodiacSign.VIRGO, month: 9, day: 23 },
      { sign: ZodiacSign.LIBRA, month: 10, day: 23 },
      { sign: ZodiacSign.SCORPIO, month: 11, day: 22 },
      { sign: ZodiacSign.SAGITTARIUS, month: 12, day: 21 },
      { sign: ZodiacSign.CAPRICORN, month: 12, day: 31 },
    ];

    for (const item of zodiacDates) {
      if (month < item.month || (month === item.month && day <= item.day)) {
        return item.sign;
      }
    }

    return ZodiacSign.ARIES; // 기본값
  }

  /**
   * @description 개인적인 키워드를 분석하여 번호를 추출합니다.
   * @param keywords 키워드 배열
   * @returns 추출된 번호 배열
   */
  private extractFromPersonalSignificance(keywords?: string[]): number[] {
    if (!keywords || keywords.length === 0) return [];
    const numbers = new Set<number>();

    keywords.forEach((keyword) => {
      // 숫자만 추출하여 분석합니다.
      const digits = keyword.replace(/\D/g, '');
      for (let i = 0; i < digits.length; i += 2) {
        const num = parseInt(digits.slice(i, i + 2));
        if (!isNaN(num) && num >= this.LOTTO_MIN && num <= this.LOTTO_MAX) {
          numbers.add(num);
        }
      }
    });
    return Array.from(numbers);
  }

  /**
   * @description 자연 패턴(피보나치 등)을 바탕으로 번호를 추출합니다.
   * @param keyword 자연 패턴 키워드
   * @returns 추출된 번호 배열
   */
  private extractFromNaturePatterns(keyword?: string): number[] {
    if (keyword === '피보나치') {
      return LottoExtractionData.fibonacciNumbers.filter(
        (n) => n <= this.LOTTO_MAX,
      );
    }
    return LottoExtractionData.naturePatternsMap[keyword || ''] || [];
  }

  /**
   * @description 고대 점술 데이터를 바탕으로 번호를 추출합니다.
   * @param keyword 점술 관련 키워드
   * @returns 추출된 번호 배열
   */
  private extractFromAncientDivination(keyword?: string): number[] {
    return LottoExtractionData.ancientDivinationMap[keyword || ''] || [];
  }

  /**
   * @description 색상 및 소리 정보를 바탕으로 번호를 추출합니다.
   * @param keyword 색상/소리 키워드
   * @returns 추출된 번호 배열
   */
  private extractFromColorsSounds(keyword?: string): number[] {
    return LottoExtractionData.colorsSoundsMap[keyword || ''] || [];
  }

  /**
   * @description 동물 징조 데이터를 바탕으로 번호를 추출합니다.
   * @param keyword 동물 관련 키워드
   * @returns 추출된 번호 배열
   */
  private extractFromAnimalOmens(keyword?: string): number[] {
    return LottoExtractionData.animalOmensMap[keyword || ''] || [];
  }

  /**
   * @description 시드 번호들을 바탕으로 중복되지 않는 6개의 최종 번호를 생성합니다.
   * @param seedNumbers 기반이 되는 번호들
   * @returns 정렬된 6개의 로또 번호 배열
   */
  private generateNumbers(seedNumbers: number[]): number[] {
    const validSeeds = new Set(
      seedNumbers.filter((n) => n >= this.LOTTO_MIN && n <= this.LOTTO_MAX),
    );

    while (validSeeds.size < this.LOTTO_COUNT) {
      const rand =
        Math.floor(Math.random() * (this.LOTTO_MAX - this.LOTTO_MIN + 1)) +
        this.LOTTO_MIN;
      validSeeds.add(rand);
    }

    return Array.from(validSeeds)
      .sort((a, b) => a - b)
      .slice(0, this.LOTTO_COUNT);
  }
}
