import {
  ExtractionMethod,
  LottoExtractionData,
} from '../constants/lotto-extraction-data';
import { ExtractionContext } from '../lotto-number.extractor';
import { ExtractionStrategy } from './extraction-strategy.interface';

/**
 * @description 꿈 키워드 기반 로또 번호 추출 전략입니다.
 */
export class DreamExtractionStrategy implements ExtractionStrategy {
  supports(method: ExtractionMethod): boolean {
    return method === ExtractionMethod.DREAM;
  }

  extract(context: ExtractionContext): number[] {
    const keyword = context.dreamKeyword;
    if (!keyword) return [];
    return LottoExtractionData.dreamNumberMap[keyword] || [];
  }
}

/**
 * @description 생년월일 사주 기반 로또 번호 추출 전략입니다.
 */
export class SajuExtractionStrategy implements ExtractionStrategy {
  private readonly LOTTO_MAX = 45;

  supports(method: ExtractionMethod): boolean {
    return method === ExtractionMethod.SAJU;
  }

  extract(context: ExtractionContext): number[] {
    const birthDateStr = context.birthDate;
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
    return num
      .toString()
      .split('')
      .reduce((acc, curr) => acc + parseInt(curr), 0);
  }
}
