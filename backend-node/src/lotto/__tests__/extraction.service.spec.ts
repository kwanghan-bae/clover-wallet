import { Test, TestingModule } from '@nestjs/testing';
import { ExtractionService } from '../extraction.service';
import { LottoNumberExtractor } from '../lotto-number.extractor';
import { ExtractionMethod } from '../constants/lotto-extraction-data';

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

      expect(extractor.extract).toHaveBeenCalledWith(ExtractionMethod.DREAM, expect.objectContaining({
        dreamKeyword: '돼지',
      }));
      expect(result).toEqual(mockNumbers);
    });
  });
});
