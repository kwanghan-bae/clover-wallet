import { Test, TestingModule } from '@nestjs/testing';
import { BadgeService } from '../badge.service';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * BadgeService에 대한 단위 테스트입니다.
 * 사용자 활동 및 당첨 이력에 따른 뱃지 자동 부여 로직을 검증합니다.
 */
describe('BadgeService', () => {
  let service: BadgeService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BadgeService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            lottoGame: {
              count: jest.fn(),
              findFirst: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<BadgeService>(BadgeService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateUserBadges', () => {
    const userId = BigInt(1);

    it('should add FIRST_WIN badge if user has any winning', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        badges: '',
      });
      (prisma.lottoGame.count as jest.Mock).mockImplementation(({ where }) => {
        if (where.status?.startsWith === 'WINNING') return Promise.resolve(1);
        return Promise.resolve(0);
      });
      (prisma.lottoGame.findFirst as jest.Mock).mockResolvedValue(null);

      await service.updateUserBadges(userId);

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            badges: expect.stringContaining(BadgeService.BADGE_FIRST_WIN),
          },
        }),
      );
    });

    it('should add LUCKY_1ST badge if user won 1st place', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        badges: '',
      });
      (prisma.lottoGame.count as jest.Mock).mockResolvedValue(0);
      (prisma.lottoGame.findFirst as jest.Mock).mockResolvedValue({
        id: BigInt(100),
      });

      await service.updateUserBadges(userId);

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            badges: expect.stringContaining(BadgeService.BADGE_LUCKY_1ST),
          },
        }),
      );
    });

    it('should add FREQUENT_PLAYER badge if user played 10+ games', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        badges: '',
      });
      (prisma.lottoGame.count as jest.Mock).mockImplementation(({ where }) => {
        if (where.status) return Promise.resolve(0); // winning count
        return Promise.resolve(10); // total count
      });
      (prisma.lottoGame.findFirst as jest.Mock).mockResolvedValue(null);

      await service.updateUserBadges(userId);

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            badges: expect.stringContaining(BadgeService.BADGE_FREQUENT_PLAYER),
          },
        }),
      );
    });

    it('should add extraction badges based on win method', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        badges: '',
      });
      (prisma.lottoGame.count as jest.Mock).mockResolvedValue(0);
      (prisma.lottoGame.findFirst as jest.Mock).mockImplementation(
        ({ where }) => {
          if (where.extractionMethod === 'DREAM')
            return Promise.resolve({ id: BigInt(1) });
          return Promise.resolve(null);
        },
      );

      await service.updateUserBadges(userId);

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            badges: expect.stringContaining(BadgeService.BADGE_DREAM_MASTER),
          },
        }),
      );
    });
  });
});
