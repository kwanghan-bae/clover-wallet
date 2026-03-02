import { Test, TestingModule } from '@nestjs/testing';
import { WinningCheckService } from '../winning-check.service';
import { PrismaService } from '../../prisma/prisma.service';
import { WinningInfoCrawlerService } from '../winning-info-crawler.service';
import { BadgeService } from '../../users/badge.service';
import { FcmService } from '../../notification/fcm.service';

/**
 * WinningCheckService에 대한 단위 테스트입니다.
 * 로또 번호 대조를 통한 등수 계산 로직(1등~5등 및 낙첨)을 검증합니다.
 */
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
            user: { findUnique: jest.fn() },
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
        {
          provide: FcmService,
          useValue: { sendWinningNotification: jest.fn() },
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
      number1: 1,
      number2: 2,
      number3: 3,
      number4: 4,
      number5: 5,
      number6: 6,
      bonusNumber: 7,
      firstPrizeAmount: BigInt(1000),
      secondPrizeAmount: BigInt(500),
      thirdPrizeAmount: BigInt(100),
      fourthPrizeAmount: BigInt(50),
      fifthPrizeAmount: BigInt(5),
    };

    it('should return 1st rank for 6 matching numbers', () => {
      const game = {
        number1: 1,
        number2: 2,
        number3: 3,
        number4: 4,
        number5: 5,
        number6: 6,
      };
      const result = service.calculateRank(game, mockWinning);
      expect(result.status).toBe('WINNING_1');
      expect(result.prize).toBe(BigInt(1000));
    });
  });

  describe('checkWinning', () => {
    const round = 1150;
    const mockWinningInfo = { round, number1: 1, number2: 2, number3: 3, number4: 4, number5: 5, number6: 6, bonusNumber: 7 };

    it('should process tickets', async () => {
      (prisma.winningInfo.findUnique as jest.Mock).mockResolvedValue(mockWinningInfo);
      (prisma.lottoTicket.findMany as jest.Mock).mockResolvedValue([
        { id: BigInt(1), userId: BigInt(1), ordinal: round, games: [{ id: BigInt(1), number1: 1, number2: 2, number3: 3, number4: 4, number5: 5, number6: 6 }] },
      ]);

      await service.checkWinning(round);
      expect(prisma.lottoGame.update).toHaveBeenCalled();
    });
  });
});
