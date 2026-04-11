import { Injectable } from '@nestjs/common';
import { ExtractionMethod } from './constants/lotto-extraction-data';
import { ExtractionStrategy } from './strategies/extraction-strategy.interface';
import {
  DreamExtractionStrategy,
  SajuExtractionStrategy,
} from './strategies/basic-extraction.strategies';
import {
  HoroscopeExtractionStrategy,
  PersonalSignificanceExtractionStrategy,
} from './strategies/personal-extraction.strategies';
import {
  StatisticsExtractionStrategy,
  KeywordMappingExtractionStrategy,
} from './strategies/other-extraction.strategies';

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
 * @description 다양한 전략을 사용하여 로또 번호를 추출하는 서비스 클래스입니다.
 */
@Injectable()
export class LottoNumberExtractor {
  private readonly LOTTO_MIN = 1;
  private readonly LOTTO_MAX = 45;
  private readonly LOTTO_COUNT = 6;
  private readonly strategies: ExtractionStrategy[];

  constructor() {
    this.strategies = [
      new DreamExtractionStrategy(),
      new SajuExtractionStrategy(),
      new HoroscopeExtractionStrategy(),
      new PersonalSignificanceExtractionStrategy(),
      new StatisticsExtractionStrategy(),
      new KeywordMappingExtractionStrategy(),
    ];
  }

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
    const strategy = this.strategies.find((s) => s.supports(method));
    const seedNumbers = strategy ? strategy.extract(context) : [];

    return this.generateNumbers(seedNumbers);
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
