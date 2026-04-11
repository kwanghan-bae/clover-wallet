import { Test, TestingModule } from '@nestjs/testing';
import { WinnerNotificationService } from '../winner-notification.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadgeService } from '../../users/badge.service';
import { FcmService } from '../../notification/fcm.service';

describe('WinnerNotificationService', () => {
  let service: WinnerNotificationService;
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WinnerNotificationService,
        {
          provide: PrismaService,
          useValue: {
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

    service = module.get<WinnerNotificationService>(WinnerNotificationService);
    prisma = module.get<PrismaService>(PrismaService);
    badgeService = module.get<BadgeService>(BadgeService);
    fcmService = module.get<FcmService>(FcmService);
  });

  describe('handleWinnerActions', () => {
    it('뱃지 업데이트와 알림 발송을 호출해야 한다', async () => {
      const ticket = {
        id: 1,
        userId: 10,
        games: [
          {
            number1: 1,
            number2: 2,
            number3: 3,
            number4: 4,
            number5: 5,
            number6: 6,
          },
        ],
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        fcmToken: 'token123',
      });

      service.handleWinnerActions(ticket, mockWinning);

      // handleWinnerActions is fire-and-forget, wait for async
      await new Promise((r) => setTimeout(r, 50));

      expect(badgeService.updateUserBadges).toHaveBeenCalledWith(10);
      expect(fcmService.sendWinningNotification).toHaveBeenCalled();
    });
  });

  describe('notifyWinner', () => {
    it('FCM 토큰이 없으면 알림을 보내지 않아야 한다', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        fcmToken: null,
      });

      const ticket = { userId: 10, games: [] };
      await service.notifyWinner(ticket, mockWinning);

      expect(fcmService.sendWinningNotification).not.toHaveBeenCalled();
    });

    it('사용자를 찾을 수 없으면 알림을 보내지 않아야 한다', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const ticket = { userId: 999, games: [] };
      await service.notifyWinner(ticket, mockWinning);

      expect(fcmService.sendWinningNotification).not.toHaveBeenCalled();
    });

    it('당첨 게임이 있으면 FCM 알림을 발송해야 한다', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        fcmToken: 'token123',
      });

      const ticket = {
        userId: 10,
        games: [
          {
            number1: 1,
            number2: 2,
            number3: 3,
            number4: 4,
            number5: 5,
            number6: 6,
          },
        ],
      };

      await service.notifyWinner(ticket, mockWinning);

      expect(fcmService.sendWinningNotification).toHaveBeenCalledWith(
        'token123',
        '1등',
        [1, 2, 3, 4, 5, 6],
        mockWinning.firstPrizeAmount,
      );
    });
  });

  describe('getBestWinningResult', () => {
    it('가장 높은 당첨 순위를 반환해야 한다', () => {
      const ticket = {
        games: [
          {
            number1: 1,
            number2: 2,
            number3: 3,
            number4: 4,
            number5: 5,
            number6: 45,
          },
          {
            number1: 1,
            number2: 2,
            number3: 3,
            number4: 4,
            number5: 5,
            number6: 6,
          },
        ],
      };

      const result = service.getBestWinningResult(ticket, mockWinning);
      expect(result).not.toBeNull();
      expect(result!.res.status).toBe('WINNING_1');
    });

    it('당첨 게임이 없으면 null을 반환해야 한다', () => {
      const ticket = {
        games: [
          {
            number1: 40,
            number2: 41,
            number3: 42,
            number4: 43,
            number5: 44,
            number6: 45,
          },
        ],
      };

      const result = service.getBestWinningResult(ticket, mockWinning);
      expect(result).toBeNull();
    });

    it('여러 당첨 게임 중 가장 높은 등수를 반환해야 한다', () => {
      const ticket = {
        games: [
          {
            number1: 1,
            number2: 2,
            number3: 3,
            number4: 40,
            number5: 41,
            number6: 42,
          },
          {
            number1: 1,
            number2: 2,
            number3: 3,
            number4: 4,
            number5: 40,
            number6: 41,
          },
        ],
      };

      const result = service.getBestWinningResult(ticket, mockWinning);
      expect(result).not.toBeNull();
      expect(result!.res.status).toBe('WINNING_4');
    });
  });
});
