import { Injectable } from '@nestjs/common';
import { ExtractionMethod, LottoExtractionData, ZodiacSign } from './constants/lotto-extraction-data';
// import { StatisticsCalculator } from './statistics-calculator'; // Future

export interface ExtractionContext {
  dreamKeyword?: string;
  birthDate?: string; // ISO Date string
  personalKeywords?: string[];
  natureKeyword?: string;
  divinationKeyword?: string;
  colorKeyword?: string;
  animalKeyword?: string;
}

@Injectable()
export class LottoNumberExtractor {
  private readonly LOTTO_MIN = 1;
  private readonly LOTTO_MAX = 45;
  private readonly LOTTO_COUNT = 6;

  async extract(method: ExtractionMethod, context: ExtractionContext = {}): Promise<number[]> {
    let seedNumbers: number[] = [];

    switch (method) {
        case ExtractionMethod.DREAM:
            seedNumbers = this.extractFromDream(context.dreamKeyword);
            break;
        case ExtractionMethod.SAJU:
            seedNumbers = this.extractFromSaju(context.birthDate);
            break;
        case ExtractionMethod.STATISTICS_HOT:
            seedNumbers = await this.getHotNumbers();
            break;
        case ExtractionMethod.STATISTICS_COLD:
            seedNumbers = await this.getColdNumbers();
            break;
        case ExtractionMethod.HOROSCOPE:
            seedNumbers = this.extractFromHoroscope(context.birthDate);
            break;
        case ExtractionMethod.PERSONAL_SIGNIFICANCE:
            seedNumbers = this.extractFromPersonalSignificance(context.personalKeywords);
            break;
        case ExtractionMethod.NATURE_PATTERNS:
            seedNumbers = this.extractFromNaturePatterns(context.natureKeyword);
            break;
        case ExtractionMethod.ANCIENT_DIVINATION:
            seedNumbers = this.extractFromAncientDivination(context.divinationKeyword);
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

  private async getHotNumbers(): Promise<number[]> {
      // Mock / Fallback for now
      return [34, 1, 13, 12, 27, 45, 17, 20, 33, 39];
  }

  private async getColdNumbers(): Promise<number[]> {
      // Mock / Fallback for now
      return [9, 22, 23, 29, 30, 3, 6, 7, 10, 11];
  }

  private extractFromDream(keyword?: string): number[] {
      if (!keyword) return [];
      return LottoExtractionData.dreamNumberMap[keyword] || [];
  }

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

  private sumDigits(num: number): number {
      return num.toString().split('').reduce((acc, curr) => acc + parseInt(curr), 0);
  }

  private extractFromHoroscope(birthDateStr?: string): number[] {
      if (!birthDateStr) return [];
      const date = new Date(birthDateStr);
      if (isNaN(date.getTime())) return [];
      const sign = this.getZodiacSign(date.getMonth() + 1, date.getDate());
      return LottoExtractionData.horoscopeNumberMap[sign] || [];
  }

  private getZodiacSign(month: number, day: number): ZodiacSign {
      if ((month == 1 && day <= 20) || (month == 12 && day >= 22)) return ZodiacSign.CAPRICORN;
      if ((month == 1 && day >= 21) || (month == 2 && day <= 18)) return ZodiacSign.AQUARIUS;
      if ((month == 2 && day >= 19) || (month == 3 && day <= 20)) return ZodiacSign.PISCES;
      if ((month == 3 && day >= 21) || (month == 4 && day <= 20)) return ZodiacSign.ARIES;
      if ((month == 4 && day >= 21) || (month == 5 && day <= 20)) return ZodiacSign.TAURUS;
      if ((month == 5 && day >= 21) || (month == 6 && day <= 21)) return ZodiacSign.GEMINI;
      if ((month == 6 && day >= 22) || (month == 7 && day <= 22)) return ZodiacSign.CANCER;
      if ((month == 7 && day >= 23) || (month == 8 && day <= 23)) return ZodiacSign.LEO;
      if ((month == 8 && day >= 24) || (month == 9 && day <= 23)) return ZodiacSign.VIRGO;
      if ((month == 9 && day >= 24) || (month == 10 && day <= 23)) return ZodiacSign.LIBRA;
      if ((month == 10 && day >= 24) || (month == 11 && day <= 22)) return ZodiacSign.SCORPIO;
      if ((month == 11 && day >= 23) || (month == 12 && day <= 21)) return ZodiacSign.SAGITTARIUS;
      return ZodiacSign.ARIES; // Default
  }

  private extractFromPersonalSignificance(keywords?: string[]): number[] {
      if (!keywords || keywords.length === 0) return [];
      const numbers = new Set<number>();
      
      keywords.forEach(keyword => {
          // Rudimentary parsing of digits
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

  private extractFromNaturePatterns(keyword?: string): number[] {
      if (keyword === '피보나치') {
          return LottoExtractionData.fibonacciNumbers.filter(n => n <= this.LOTTO_MAX);
      }
      return LottoExtractionData.naturePatternsMap[keyword || ''] || [];
  }

  private extractFromAncientDivination(keyword?: string): number[] {
      return LottoExtractionData.ancientDivinationMap[keyword || ''] || [];
  }

  private extractFromColorsSounds(keyword?: string): number[] {
      return LottoExtractionData.colorsSoundsMap[keyword || ''] || [];
  }

  private extractFromAnimalOmens(keyword?: string): number[] {
      return LottoExtractionData.animalOmensMap[keyword || ''] || [];
  }

  private generateNumbers(seedNumbers: number[]): number[] {
      const validSeeds = new Set(
          seedNumbers.filter(n => n >= this.LOTTO_MIN && n <= this.LOTTO_MAX)
      );
      
      while (validSeeds.size < this.LOTTO_COUNT) {
          const rand = Math.floor(Math.random() * (this.LOTTO_MAX - this.LOTTO_MIN + 1)) + this.LOTTO_MIN;
          validSeeds.add(rand);
      }
      
      return Array.from(validSeeds).sort((a, b) => a - b).slice(0, this.LOTTO_COUNT);
  }
}
