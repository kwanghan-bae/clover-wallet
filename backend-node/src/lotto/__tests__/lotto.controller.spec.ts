import { Test, TestingModule } from '@nestjs/testing';
import { LottoController } from '../lotto.controller';
import { LottoService } from '../lotto.service';
import { ExtractionService } from '../extraction.service';
import { SaveGameDto } from '../dto/save-game.dto';
import { ExtractNumbersDto } from '../dto/extract-numbers.dto';

/**
 * LottoController에 대한 단위 테스트입니다.
 * 내 로또 기록 조회, 번호 저장 및 자동 번호 추출 API의 동작을 검증합니다.
 */
describe('LottoController', () => {
  let controller: LottoController;
  let lottoService: LottoService;
  let extractionService: ExtractionService;

  const mockLottoService = {
    getGamesByUserId: jest.fn(),
    saveGeneratedGame: jest.fn(),
  };

  const mockExtractionService = {
    extractLottoNumbers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LottoController],
      providers: [
        {
          provide: LottoService,
          useValue: mockLottoService,
        },
        {
          provide: ExtractionService,
          useValue: mockExtractionService,
        },
      ],
    }).compile();

    controller = module.get<LottoController>(LottoController);
    lottoService = module.get<LottoService>(LottoService);
    extractionService = module.get<ExtractionService>(ExtractionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyGames', () => {
    it('should call lottoService.getGamesByUserId', async () => {
      const req = { user: { id: 'user-id' } };
      await controller.getMyGames(req, 0, 20);
      expect(lottoService.getGamesByUserId).toHaveBeenCalledWith(
        'user-id',
        0,
        20,
      );
    });
  });

  describe('saveGame', () => {
    it('should call lottoService.saveGeneratedGame with userId from token', async () => {
      const req = { user: { id: 'user-id' } };
      const dto: SaveGameDto = {
        userId: 'other',
        numbers: [1, 2, 3, 4, 5, 6],
        round: 1000,
      };
      await controller.saveGame(req, dto);
      expect(lottoService.saveGeneratedGame).toHaveBeenCalledWith({
        ...dto,
        userId: 'user-id',
      });
    });
  });

  describe('extractNumbers', () => {
    it('should call extractionService.extractLottoNumbers and return sorted unique numbers', async () => {
      const dto: ExtractNumbersDto = { type: 'dream', input: 'lucky dream' };
      mockExtractionService.extractLottoNumbers.mockResolvedValue([
        10, 5, 5, 20, 1, 30,
      ]);

      const result = await controller.extractNumbers(dto);

      expect(extractionService.extractLottoNumbers).toHaveBeenCalledWith(dto);
      expect(result).toEqual([1, 5, 10, 20, 30]);
    });
  });
});
