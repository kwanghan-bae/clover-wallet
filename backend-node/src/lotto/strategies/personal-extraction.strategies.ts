import { ExtractionMethod, LottoExtractionData, ZodiacSign } from '../constants/lotto-extraction-data';
import { ExtractionContext } from '../lotto-number.extractor';
import { ExtractionStrategy } from './extraction-strategy.interface';

/**
 * @description 별자리 운세 기반 로또 번호 추출 전략입니다.
 */
export class HoroscopeExtractionStrategy implements ExtractionStrategy {
  supports(method: ExtractionMethod): boolean {
    return method === ExtractionMethod.HOROSCOPE;
  }

  extract(context: ExtractionContext): number[] {
    const birthDateStr = context.birthDate;
    if (!birthDateStr) return [];
    const date = new Date(birthDateStr);
    if (isNaN(date.getTime())) return [];
    const sign = this.getZodiacSign(date.getMonth() + 1, date.getDate());
    return LottoExtractionData.horoscopeNumberMap[sign] || [];
  }

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
    return ZodiacSign.ARIES;
  }
}

/**
 * @description 개인적인 의미 있는 숫자 기반 로또 번호 추출 전략입니다.
 */
export class PersonalSignificanceExtractionStrategy implements ExtractionStrategy {
  private readonly LOTTO_MIN = 1;
  private readonly LOTTO_MAX = 45;

  supports(method: ExtractionMethod): boolean {
    return method === ExtractionMethod.PERSONAL_SIGNIFICANCE;
  }

  extract(context: ExtractionContext): number[] {
    const keywords = context.personalKeywords;
    if (!keywords || keywords.length === 0) return [];
    const numbers = new Set<number>();

    keywords.forEach((keyword) => {
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
}
