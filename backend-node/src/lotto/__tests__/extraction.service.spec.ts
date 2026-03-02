import { Test, TestingModule } from '@nestjs/testing';
import { ExtractionService } from '../extraction.service';
import { LottoNumberExtractor } from '../lotto-number.extractor';
import { ExtractionMethod } from '../constants/lotto-extraction-data';

/**
 * ExtractionService에 대한 단위 테스트입니다.
 * 다양한 키워드 정보를 바탕으로 로또 번호 추출 로직이 올바르게 호출되는지 검증합니다.
 */
describe('ExtractionService', () => {
  let service: ExtractionService;
  let extractor: LottoNumberExtractor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExtractionService,
        {
          provide: LottoNumberExtractor,
          useValue: {
            extract: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ExtractionService>(ExtractionService);
    extractor = module.get<LottoNumberExtractor>(LottoNumberExtractor);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('extractLottoNumbers', () => {
    it('should call extractor with correct context', async () => {
      const mockNumbers = [1, 2, 3, 4, 5, 6];
      (extractor.extract as jest.Mock).mockResolvedValue(mockNumbers);

      const dto = {
        method: ExtractionMethod.DREAM,
        dreamKeyword: '돼지',
      };

      const result = await service.extractLottoNumbers(dto);

      expect(extractor.extract).toHaveBeenCalledWith(
        ExtractionMethod.DREAM,
        expect.objectContaining({
          dreamKeyword: '돼지',
        }),
      );
      expect(result).toEqual(mockNumbers);
    });
  });
});
