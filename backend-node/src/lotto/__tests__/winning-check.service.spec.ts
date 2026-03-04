import { Test, TestingModule } from '@nestjs/testing';
import { WinningCheckService } from '../winning-check.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadgeService } from '../../users/badge.service';
import { FcmService } from '../../notification/fcm.service';

/**
 * WinningCheckService에 대한 단위 테스트입니다.
 * 로또 번호 대조를 통한 등수 계산 로직(1등~5등 및 낙첨)과
 * 당첨 시 알림 및 뱃지 업데이트 연동을 검증합니다.
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

  describe('calculateRank', () => {
    it('6개 번호가 일치하면 1등이어야 한다', () => {
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
      expect(result.prize).toBe(mockWinning.firstPrizeAmount);
    });

    it('5개 번호와 보너스 번호가 일치하면 2등이어야 한다', () => {
      const game = {
        number1: 1,
        number2: 2,
        number3: 3,
        number4: 4,
        number5: 5,
        number6: 7,
      };
      const result = service.calculateRank(game, mockWinning);
      expect(result.status).toBe('WINNING_2');
      expect(result.prize).toBe(mockWinning.secondPrizeAmount);
    });

    it('5개 번호만 일치하면 3등이어야 한다', () => {
      const game = {
        number1: 1,
        number2: 2,
        number3: 3,
        number4: 4,
        number5: 5,
        number6: 45,
      };
      const result = service.calculateRank(game, mockWinning);
      expect(result.status).toBe('WINNING_3');
      expect(result.prize).toBe(mockWinning.thirdPrizeAmount);
    });

    it('4개 번호가 일치하면 4등이어야 한다', () => {
      const game = {
        number1: 1,
        number2: 2,
        number3: 3,
        number4: 4,
        number5: 44,
        number6: 45,
      };
      const result = service.calculateRank(game, mockWinning);
      expect(result.status).toBe('WINNING_4');
      expect(result.prize).toBe(mockWinning.fourthPrizeAmount);
    });

    it('3개 번호가 일치하면 5등이어야 한다', () => {
      const game = {
        number1: 1,
        number2: 2,
        number3: 3,
        number4: 43,
        number5: 44,
        number6: 45,
      };
      const result = service.calculateRank(game, mockWinning);
      expect(result.status).toBe('WINNING_5');
      expect(result.prize).toBe(mockWinning.fifthPrizeAmount);
    });

    it('2개 이하 번호가 일치하면 낙첨이어야 한다', () => {
      const game = {
        number1: 1,
        number2: 2,
        number3: 42,
        number4: 43,
        number5: 44,
        number6: 45,
      };
      const result = service.calculateRank(game, mockWinning);
      expect(result.status).toBe('LOSING');
      expect(result.prize).toBe(BigInt(0));
    });
  });

  describe('checkWinning', () => {
    it('당첨 정보가 없으면 경고 메시지를 남기고 종료해야 한다', async () => {
      (prisma.winningInfo.findUnique as jest.Mock).mockResolvedValue(null);
      await service.checkWinning(1000);
      expect(prisma.lottoTicket.findMany).not.toHaveBeenCalled();
    });

    it('티켓의 당첨 여부에 따라 상태를 업데이트하고 알림을 보내야 한다', async () => {
      (prisma.winningInfo.findUnique as jest.Mock).mockResolvedValue(
        mockWinning,
      );
      (prisma.lottoTicket.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          userId: 10,
          status: 'STASHED',
          games: [
            {
              id: 101,
              number1: 1,
              number2: 2,
              number3: 3,
              number4: 4,
              number5: 5,
              number6: 6,
              status: 'STASHED',
              prizeAmount: BigInt(0),
            },
          ],
        },
      ]);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        fcmToken: 'token123',
      });

      await service.checkWinning(1000);

      expect(prisma.lottoGame.update).toHaveBeenCalledWith({
        where: { id: 101 },
        data: {
          status: 'WINNING_1',
          prizeAmount: mockWinning.firstPrizeAmount,
        },
      });
      expect(prisma.lottoTicket.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'WINNING' },
      });
      expect(badgeService.updateUserBadges).toHaveBeenCalledWith(10);
      expect(fcmService.sendWinningNotification).toHaveBeenCalled();
    });

    it('처리 중 에러가 발생해도 로깅 후 계속 진행해야 한다', async () => {
      (prisma.winningInfo.findUnique as jest.Mock).mockResolvedValue(
        mockWinning,
      );
      (prisma.lottoTicket.findMany as jest.Mock).mockResolvedValue([
        { id: 1, games: [] },
      ]);
      (prisma.lottoTicket.update as jest.Mock).mockRejectedValue(
        new Error('DB Error'),
      );

      await service.checkWinning(1000);
      // 에러가 throw되지 않고 catch되어야 함
    });
  });

  describe('handleWinningInfoCreated', () => {
    it('이벤트 수신 시 checkWinning을 호출해야 한다', async () => {
      const spy = jest
        .spyOn(service, 'checkWinning')
        .mockResolvedValue(undefined);
      await service.handleWinningInfoCreated({ round: 1000 });
      expect(spy).toHaveBeenCalledWith(1000);
    });
  });
});
