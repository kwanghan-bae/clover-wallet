import { ExtractionMethod, LottoExtractionData } from '../constants/lotto-extraction-data';
import { ExtractionContext } from '../lotto-number.extractor';
import { ExtractionStrategy } from './extraction-strategy.interface';

/**
 * @description 통계 기반(자주 출현/드물게 출현) 로또 번호 추출 전략입니다.
 */
export class StatisticsExtractionStrategy implements ExtractionStrategy {
  supports(method: ExtractionMethod): boolean {
    return [ExtractionMethod.STATISTICS_HOT, ExtractionMethod.STATISTICS_COLD].includes(method);
  }

  extract(context: ExtractionContext): number[] {
    // 실제 구현에서는 context나 DB에서 방법론별 통계 데이터를 가져올 수 있으나,
    // 기존 LottoNumberExtractor의 임시 데이터를 유지합니다.
    return [34, 1, 13, 12, 27, 45, 17, 20, 33, 39]; 
  }
}

/**
 * @description 자연 패턴, 점술, 색상/소리, 동물 징조 등 키워드 매핑 기반 추출 전략입니다.
 */
export class KeywordMappingExtractionStrategy implements ExtractionStrategy {
  supports(method: ExtractionMethod): boolean {
    return [
      ExtractionMethod.NATURE_PATTERNS,
      ExtractionMethod.ANCIENT_DIVINATION,
      ExtractionMethod.COLORS_SOUNDS,
      ExtractionMethod.ANIMAL_OMENS
    ].includes(method);
  }

  /**
   * 자연 패턴, 점술, 색상/소리, 동물 징조 등 키워드 매핑 데이터를 기반으로 로또 번호를 추출합니다.
   * 추출 컨텍스트(ExtractionContext)에 포함된 특정 키워드를 탐색하여 매핑된 번호 배열을 반환합니다.
   */
  extract(context: ExtractionContext): number[] {
    // 키워드별 매핑 데이터를 반환합니다. 
    // 기존 로직의 복잡한 분기들을 공통 데이터 기반으로 단순화합니다.
    if (context.natureKeyword === '피보나치') {
      return LottoExtractionData.fibonacciNumbers.filter(n => n <= 45);
    }
    
    const keyword = context.natureKeyword || context.divinationKeyword || context.colorKeyword || context.animalKeyword;
    if (!keyword) return [];

    return (
      LottoExtractionData.naturePatternsMap[keyword] ||
      LottoExtractionData.ancientDivinationMap[keyword] ||
      LottoExtractionData.colorsSoundsMap[keyword] ||
      LottoExtractionData.animalOmensMap[keyword] ||
      []
    );
  }
}
