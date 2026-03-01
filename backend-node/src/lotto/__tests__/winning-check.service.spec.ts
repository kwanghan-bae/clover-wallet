import { Test, TestingModule } from '@nestjs/testing';
import { WinningCheckService } from '../winning-check.service';
import { PrismaService } from '../../prisma/prisma.service';
import { WinningInfoCrawlerService } from '../winning-info-crawler.service';
import { BadgeService } from '../../users/badge.service';

describe('WinningCheckService', () => {
  let service: WinningCheckService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WinningCheckService,
        {
          provide: PrismaService,
          useValue: {
            winningInfo: { findUnique: jest.fn() },
            lottoTicket: { findMany: jest.fn(), update: jest.fn() },
            lottoGame: { update: jest.fn() },
          },
        },
        {
          provide: WinningInfoCrawlerService,
          useValue: { crawlWinningInfo: jest.fn() },
        },
        {
          provide: BadgeService,
          useValue: { updateUserBadges: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<WinningCheckService>(WinningCheckService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateRank', () => {
    const mockWinning = {
      number1: 1, number2: 2, number3: 3,
      number4: 4, number5: 5, number6: 6,
      bonusNumber: 7,
      firstPrizeAmount: BigInt(1000),
      secondPrizeAmount: BigInt(500),
      thirdPrizeAmount: BigInt(100),
      fourthPrizeAmount: BigInt(50),
      fifthPrizeAmount: BigInt(5),
    };

    it('should return 1st rank for 6 matching numbers', () => {
      const game = { number1: 1, number2: 2, number3: 3, number4: 4, number5: 5, number6: 6 };
      const result = service.calculateRank(game, mockWinning);
      expect(result.status).toBe('WINNING_1');
      expect(result.prize).toBe(BigInt(1000));
    });

    it('should return 2nd rank for 5 matching numbers + bonus', () => {
      const game = { number1: 1, number2: 2, number3: 3, number4: 4, number5: 5, number6: 7 };
      const result = service.calculateRank(game, mockWinning);
      expect(result.status).toBe('WINNING_2');
      expect(result.prize).toBe(BigInt(500));
    });

    it('should return 5th rank for 3 matching numbers', () => {
      const game = { number1: 1, number2: 2, number3: 3, number4: 10, number5: 11, number6: 12 };
      const result = service.calculateRank(game, mockWinning);
      expect(result.status).toBe('WINNING_5');
      expect(result.prize).toBe(BigInt(5));
    });

    it('should return LOSING for 2 matching numbers', () => {
      const game = { number1: 1, number2: 2, number3: 10, number4: 11, number5: 12, number6: 13 };
      const result = service.calculateRank(game, mockWinning);
      expect(result.status).toBe('LOSING');
      expect(result.prize).toBe(BigInt(0));
    });
  });
});
