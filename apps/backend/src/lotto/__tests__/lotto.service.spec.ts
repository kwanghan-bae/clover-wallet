import { Test, TestingModule } from '@nestjs/testing';
import { LottoService } from '../lotto.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadgeService } from '../../users/badge.service';
import { ExtractionMethod } from '../constants/lotto-extraction-data';

/**
 * LottoService에 대한 단위 테스트입니다.
 * 게임 결과 저장, 페이징 기반 이력 조회, 당첨 통계 계산 기능을 검증합니다.
 */
describe('LottoService', () => {
  let service: LottoService;
  let prisma: PrismaService;
  let badgeService: BadgeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LottoService,
        {
          provide: PrismaService,
          useValue: {
            lottoGame: {
              findMany: jest.fn(),
              count: jest.fn(),
              create: jest.fn(),
            },
            badge: {
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: BadgeService,
          useValue: {
            updateUserBadges: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<LottoService>(LottoService);
    prisma = module.get<PrismaService>(PrismaService);
    badgeService = module.get<BadgeService>(BadgeService);
  });

  describe('saveGame', () => {
    it('로또 번호를 저장하고 사용자의 뱃지를 업데이트해야 한다', async () => {
      const userId = '1';
      const userIdBig = BigInt(1);
      const dto = {
        userId: 999,
        numbers: [1, 10, 20, 30, 40, 45],
        extractionMethod: ExtractionMethod.RANDOM,
      };
      const mockGame = { id: BigInt(1), ...dto };
      (prisma.lottoGame.create as jest.Mock).mockResolvedValue(mockGame);

      const result = await service.saveGame(userId, dto);

      expect(prisma.lottoGame.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: userIdBig,
          number1: 1,
          number2: 10,
          number3: 20,
          number4: 30,
          number5: 40,
          number6: 45,
          extractionMethod: 'RANDOM',
        }),
      });
      expect(badgeService.updateUserBadges).toHaveBeenCalledWith(userIdBig);
      expect(result).toEqual(mockGame);
    });
  });

  describe('getHistory', () => {
    it('사용자의 게임 내역을 페이징하여 반환해야 한다', async () => {
      const userId = '1';
      const mockItems = [{ id: BigInt(1) }, { id: BigInt(2) }];
      (prisma.lottoGame.findMany as jest.Mock).mockResolvedValue(mockItems);
      (prisma.lottoGame.count as jest.Mock).mockResolvedValue(25);

      const result = await service.getHistory(userId, 2, 10);

      expect(result.content).toEqual(mockItems);
      expect(result.totalElements).toBe(25);
      expect(result.pageNumber).toBe(2);
      expect(result.totalPages).toBe(3);
      expect(prisma.lottoGame.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });

    it('기본 인자값(1페이지, 10개)으로 내역을 조회해야 한다', async () => {
      (prisma.lottoGame.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.lottoGame.count as jest.Mock).mockResolvedValue(0);
      await service.getHistory('1');
      expect(prisma.lottoGame.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
        }),
      );
    });
  });

  describe('getStatistics', () => {
    it('사용자의 당첨 및 낙첨 횟수를 정확히 집계해야 한다', async () => {
      const userId = '1';
      const userIdBig = BigInt(1);
      const mockGames = [
        { status: 'WINNING_1' },
        { status: 'WINNING_5' },
        { status: 'LOSING' },
        { status: 'LOSING' },
        { status: 'STASHED' },
      ];
      (prisma.lottoGame.findMany as jest.Mock).mockResolvedValue(mockGames);

      const stats = await service.getStatistics(userId);

      expect(stats.total).toBe(5);
      expect(stats.winCount).toBe(2); // WINNING_1, WINNING_5
      expect(stats.loseCount).toBe(2); // LOSING
      expect(prisma.lottoGame.findMany).toHaveBeenCalledWith({
        where: { userId: userIdBig },
        select: { status: true },
      });
    });
  });
});
