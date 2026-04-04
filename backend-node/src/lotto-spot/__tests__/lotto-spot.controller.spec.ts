import { Test, TestingModule } from '@nestjs/testing';
import { LottoSpotController } from '../lotto-spot.controller';
import { LottoSpotService } from '../lotto-spot.service';
import { LottoWinningStoreService } from '../lotto-winning-store.service';
import { WinningInfoCrawlerService } from '../../lotto/winning-info-crawler.service';
import { WinningCheckService } from '../../lotto/winning-check.service';
import { NotFoundException } from '@nestjs/common';

/**
 * LottoSpotController에 대한 단위 테스트입니다.
 * 로또 판매점 조회, 검색, 당첨 이력 및 크롤링 요청 제어 로직을 테스트합니다.
 */
describe('LottoSpotController', () => {
  let controller: LottoSpotController;
  let lottoSpotService: LottoSpotService;
  let lottoWinningStoreService: LottoWinningStoreService;
  let winningInfoCrawlerService: WinningInfoCrawlerService;
  let winningCheckService: WinningCheckService;

  const mockLottoSpotService = {
    getAllLottoSpots: jest.fn(),
    searchByName: jest.fn(),
    getSpotById: jest.fn(),
  };

  const mockLottoWinningStoreService = {
    crawlWinningStores: jest.fn(),
    getWinningStores: jest.fn(),
    getWinningHistoryByName: jest.fn(),
  };

  const mockWinningInfoCrawlerService = {
    crawlWinningInfo: jest.fn(),
    getWinningInfo: jest.fn(),
  };

  const mockWinningCheckService = {
    checkWinning: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LottoSpotController],
      providers: [
        {
          provide: LottoSpotService,
          useValue: mockLottoSpotService,
        },
        {
          provide: LottoWinningStoreService,
          useValue: mockLottoWinningStoreService,
        },
        {
          provide: WinningInfoCrawlerService,
          useValue: mockWinningInfoCrawlerService,
        },
        {
          provide: WinningCheckService,
          useValue: mockWinningCheckService,
        },
      ],
    }).compile();

    controller = module.get<LottoSpotController>(LottoSpotController);
    lottoSpotService = module.get<LottoSpotService>(LottoSpotService);
    lottoWinningStoreService = module.get<LottoWinningStoreService>(
      LottoWinningStoreService,
    );
    winningInfoCrawlerService = module.get<WinningInfoCrawlerService>(
      WinningInfoCrawlerService,
    );
    winningCheckService = module.get<WinningCheckService>(WinningCheckService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllLottoSpots', () => {
    it('should call lottoSpotService.getAllLottoSpots', async () => {
      await controller.getAllLottoSpots(0, 20);
      expect(lottoSpotService.getAllLottoSpots).toHaveBeenCalledWith(0, 20);
    });
  });

  describe('searchByName', () => {
    it('should call lottoSpotService.searchByName', async () => {
      await controller.searchByName('store-name');
      expect(lottoSpotService.searchByName).toHaveBeenCalledWith('store-name');
    });
  });

  describe('crawlStores', () => {
    it('should call lottoWinningStoreService.crawlWinningStores', async () => {
      mockLottoWinningStoreService.crawlWinningStores.mockResolvedValue({
        count: 10,
      });
      const result = await controller.crawlStores('1000');
      expect(lottoWinningStoreService.crawlWinningStores).toHaveBeenCalledWith(
        1000,
      );
      expect(result).toEqual({
        message: 'Crawling started for round 1000',
        result: { count: 10 },
      });
    });
  });

  describe('crawlWinningInfo', () => {
    it('should call winningInfoCrawlerService.crawlWinningInfo', async () => {
      const result = await controller.crawlWinningInfo('1000');
      expect(winningInfoCrawlerService.crawlWinningInfo).toHaveBeenCalledWith(
        1000,
      );
      expect(result).toEqual({
        message: 'Winning Info Crawling started for round 1000',
      });
    });
  });

  describe('triggerCrawl', () => {
    it('should call winningInfoCrawlerService.crawlWinningInfo and return message', async () => {
      mockWinningInfoCrawlerService.crawlWinningInfo.mockResolvedValue(
        undefined,
      );
      const result = await controller.triggerCrawl(1000);
      expect(winningInfoCrawlerService.crawlWinningInfo).toHaveBeenCalledWith(
        1000,
      );
      expect(result).toEqual({ message: 'Crawl triggered for round 1000' });
    });
  });

  describe('triggerCheck', () => {
    it('should call winningCheckService.checkWinning and return message', async () => {
      mockWinningCheckService.checkWinning.mockResolvedValue(undefined);
      const result = await controller.triggerCheck(1000);
      expect(winningCheckService.checkWinning).toHaveBeenCalledWith(1000);
      expect(result).toEqual({
        message: 'Winning check triggered for round 1000',
      });
    });
  });

  describe('getWinningInfo', () => {
    it('should call winningInfoCrawlerService.getWinningInfo', async () => {
      await controller.getWinningInfo('1000');
      expect(winningInfoCrawlerService.getWinningInfo).toHaveBeenCalledWith(
        1000,
      );
    });
  });

  describe('getWinningStores', () => {
    it('should call lottoWinningStoreService.getWinningStores', async () => {
      await controller.getWinningStores('1000');
      expect(lottoWinningStoreService.getWinningStores).toHaveBeenCalledWith(
        1000,
      );
    });
  });

  describe('getSpotWinningHistory', () => {
    it('should call lottoWinningStoreService.getWinningHistoryByName', async () => {
      mockLottoSpotService.getSpotById.mockResolvedValue({
        name: 'store-name',
      });
      await controller.getSpotWinningHistory('1');
      expect(
        lottoWinningStoreService.getWinningHistoryByName,
      ).toHaveBeenCalledWith('store-name');
    });

    it('should throw NotFoundException if spot not found', async () => {
      mockLottoSpotService.getSpotById.mockResolvedValue(null);
      await expect(controller.getSpotWinningHistory('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
