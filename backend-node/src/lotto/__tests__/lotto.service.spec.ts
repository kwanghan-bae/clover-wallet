import { Test, TestingModule } from '@nestjs/testing';
import { LottoService } from '../lotto.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadgeService } from '../../users/badge.service';

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
            lottoTicket: {
              create: jest.fn(),
            },
            $transaction: jest.fn((cb) => cb(prisma)),
          },
        },
        {
          provide: BadgeService,
          useValue: {
            updateUserBadges: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LottoService>(LottoService);
    prisma = module.get<PrismaService>(PrismaService);
    badgeService = module.get<BadgeService>(BadgeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getGamesByUserId', () => {
    it('should return paginated games', async () => {
      (prisma.lottoGame.findMany as jest.Mock).mockResolvedValue([{ id: BigInt(1) }]);
      (prisma.lottoGame.count as jest.Mock).mockResolvedValue(1);

      const result = await service.getGamesByUserId(BigInt(1), 0, 20);

      expect(result.content).toHaveLength(1);
      expect(result.totalElements).toBe(1);
    });
  });

  describe('saveGeneratedGame', () => {
    it('should create a ticket and a game, then update badges', async () => {
      (prisma.lottoTicket.create as jest.Mock).mockResolvedValue({ id: BigInt(1) });
      (prisma.lottoGame.create as jest.Mock).mockResolvedValue({ id: BigInt(1) });

      const dto = {
        userId: '1',
        numbers: [1, 2, 3, 4, 5, 6],
        extractionMethod: 'DREAM',
      };

      const result = await service.saveGeneratedGame(dto);

      expect(prisma.lottoTicket.create).toHaveBeenCalled();
      expect(prisma.lottoGame.create).toHaveBeenCalled();
      expect(badgeService.updateUserBadges).toHaveBeenCalledWith(BigInt(1));
      expect(result.id).toBe(BigInt(1));
    });
  });
});
