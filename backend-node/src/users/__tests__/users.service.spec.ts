import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
            },
            lottoGame: {
              count: jest.fn(),
              aggregate: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findUser', () => {
    it('should return a user if found', async () => {
      const mockUser = { id: BigInt(1), email: 'test@test.com' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findUser(1);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.findUser(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOrCreateBySsoQualifier', () => {
    it('should return existing user and update email if changed', async () => {
      const mockUser = { id: BigInt(1), ssoQualifier: 'sub', email: 'old@test.com' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue({ ...mockUser, email: 'new@test.com' });

      const result = await service.findOrCreateBySsoQualifier('sub', 'new@test.com');

      expect(prisma.user.update).toHaveBeenCalled();
      expect(result.email).toBe('new@test.com');
    });

    it('should create a new user if not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({ id: BigInt(2), ssoQualifier: 'new' });

      const result = await service.findOrCreateBySsoQualifier('new', 'test@test.com');

      expect(prisma.user.create).toHaveBeenCalled();
      expect(result.ssoQualifier).toBe('new');
    });
  });

  describe('getUserStats', () => {
    it('should calculate stats correctly', async () => {
      (prisma.lottoGame.count as jest.Mock).mockResolvedValue(10);
      (prisma.lottoGame.aggregate as jest.Mock).mockResolvedValue({
        _sum: { prizeAmount: BigInt(5000) },
      });

      const result = await service.getUserStats(1);

      expect(result.totalGames).toBe(10);
      expect(result.totalWinnings).toBe(BigInt(5000));
      expect(result.totalSpent).toBe(BigInt(10000));
      expect(result.roi).toBe(-50); // (5000 - 10000) / 10000 * 100
    });
  });
});
