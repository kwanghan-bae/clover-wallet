import { Injectable } from '@nestjs/common';
import { LottoNumberExtractor, ExtractionContext } from './lotto-number.extractor';
import { ExtractNumbersDto } from './dto/extract-numbers.dto';

@Injectable()
export class ExtractionService {
    constructor(private readonly extractor: LottoNumberExtractor) { }

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
