import { Test, TestingModule } from '@nestjs/testing';
import { WinningCheckService } from '../winning-check.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadgeService } from '../../users/badge.service';
import { FcmService } from '../../notification/fcm.service';
import { LottoRankCalculator } from '../utils/lotto-rank.calculator';

/**
 * WinningCheckService 및 LottoRankCalculator에 대한 단위 테스트입니다.
 */
describe('WinningCheckService', () => {
  let service: WinningCheckService;
  let prisma: PrismaService;
  let badgeService: BadgeService;
  let fcmService: FcmService;

  const mockWinning = {
    round: 1000,
    number1: 1,
    number2: 2,
    number3: 3,
    number4: 4,
    number5: 5,
    number6: 6,
    bonusNumber: 7,
    firstPrizeAmount: BigInt(1000000),
    secondPrizeAmount: BigInt(500000),
    thirdPrizeAmount: BigInt(100000),
    fourthPrizeAmount: BigInt(50000),
    fifthPrizeAmount: BigInt(5000),
  };

  const prizeAmounts = {
    'WINNING_1': mockWinning.firstPrizeAmount,
    'WINNING_2': mockWinning.secondPrizeAmount,
    'WINNING_3': mockWinning.thirdPrizeAmount,
    'WINNING_4': mockWinning.fourthPrizeAmount,
    'WINNING_5': mockWinning.fifthPrizeAmount,
  };

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
          provide: BadgeService,
          useValue: {
            updateUserBadges: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: FcmService,
          useValue: {
            sendWinningNotification: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<WinningCheckService>(WinningCheckService);
    prisma = module.get<PrismaService>(PrismaService);
    badgeService = module.get<BadgeService>(BadgeService);
    fcmService = module.get<FcmService>(FcmService);
  });

  describe('LottoRankCalculator', () => {
    it('6개 번호가 일치하면 1등이어야 한다', () => {
      const result = LottoRankCalculator.calculateRank(
        [1, 2, 3, 4, 5, 6], [1, 2, 3, 4, 5, 6], 7, prizeAmounts
      );
      expect(result.status).toBe('WINNING_1');
      expect(result.prize).toBe(mockWinning.firstPrizeAmount);
    });

    it('5개 번호와 보너스 번호가 일치하면 2등이어야 한다', () => {
      const result = LottoRankCalculator.calculateRank(
        [1, 2, 3, 4, 5, 7], [1, 2, 3, 4, 5, 6], 7, prizeAmounts
      );
      expect(result.status).toBe('WINNING_2');
      expect(result.prize).toBe(mockWinning.secondPrizeAmount);
    });

    it('2개 이하 번호가 일치하면 낙첨이어야 한다', () => {
      const result = LottoRankCalculator.calculateRank(
        [1, 2, 40, 41, 42, 43], [1, 2, 3, 4, 5, 6], 7, prizeAmounts
      );
      expect(result.status).toBe('LOSING');
      expect(result.prize).toBe(BigInt(0));
    });
  });

  describe('checkWinning', () => {
    it('티켓의 당첨 여부에 따라 상태를 업데이트하고 알림을 보내야 한다', async () => {
      (prisma.winningInfo.findUnique as jest.Mock).mockResolvedValue(mockWinning);
      (prisma.lottoTicket.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          userId: 10,
          status: 'STASHED',
          games: [
            { id: 101, number1: 1, number2: 2, number3: 3, number4: 4, number5: 5, number6: 6, status: 'STASHED', prizeAmount: BigInt(0) },
          ],
        },
      ]);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ fcmToken: 'token123' });

      await service.checkWinning(1000);

      expect(prisma.lottoGame.update).toHaveBeenCalled();
      expect(prisma.lottoTicket.update).toHaveBeenCalled();
      expect(badgeService.updateUserBadges).toHaveBeenCalled();
      expect(fcmService.sendWinningNotification).toHaveBeenCalled();
    });
  });
});
