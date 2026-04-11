import { Injectable } from '@nestjs/common';
import {
  LottoNumberExtractor,
  ExtractionContext,
} from './lotto-number.extractor';
import { ExtractNumbersDto } from './dto/extract-numbers.dto';

/**
 * 다양한 방식(꿈 해몽, 사주 등)으로 로또 번호를 생성하는 요청을 처리하는 서비스입니다.
 */
@Injectable()
export class ExtractionService {
  /**
   * 로또 번호 추출기 인스턴스를 주입받습니다.
   * @param extractor 실제 번호 생성 로직을 담당하는 컴포넌트
   */
  constructor(private readonly extractor: LottoNumberExtractor) {}

  /**
   * 요청된 방식에 따라 로또 번호 6개를 생성합니다.
   * @param dto 추출 방식 및 관련 키워드 정보
   */
  async extractLottoNumbers(dto: ExtractNumbersDto): Promise<number[]> {
    const context: ExtractionContext = {
      dreamKeyword: dto.dreamKeyword,
      birthDate: dto.birthDate,
      personalKeywords: dto.personalKeywords,
      natureKeyword: dto.natureKeyword,
      divinationKeyword: dto.divinationKeyword,
      colorKeyword: dto.colorKeyword,
      animalKeyword: dto.animalKeyword,
    };
    return this.extractor.extract(dto.method, context);
  }
}
