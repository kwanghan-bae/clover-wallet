import { ExtractionMethod } from '../constants/lotto-extraction-data';
import { ExtractionContext } from '../lotto-number.extractor';

/**
 * @description 로또 번호 추출 전략을 위한 인터페이스입니다.
 */
export interface ExtractionStrategy {
  /**
   * @description 해당 전략이 지원하는 추출 방식인지 확인합니다.
   */
  supports(method: ExtractionMethod): boolean;


  extract(context: ExtractionContext): number[];
}
