import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

/**
 * UsersService에 대한 단위 테스트입니다.
 * 사용자 조회, SSO 연동, 프로필 수정, 회원 탈퇴 및 통계 분석 기능을 검증합니다.
 */
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

  describe('findUser', () => {
    it('존재하는 사용자인 경우 정보를 반환해야 한다', async () => {
      const mockUser = { id: BigInt(1), nickname: '테스터' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findUser(1);
      expect(result).toEqual(mockUser);
    });

    it('존재하지 않는 사용자인 경우 NotFoundException을 던져야 한다', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.findUser(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findUserBySsoQualifier', () => {
    it('SSO 식별자로 사용자를 조회해야 한다', async () => {
      const mockUser = { id: BigInt(1), ssoQualifier: 'google-123' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.findUserBySsoQualifier('google-123');
      expect(result).toEqual(mockUser);
    });

    it('throwError가 false인 경우 사용자가 없어도 null을 반환해야 한다', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      const result = await service.findUserBySsoQualifier('none', false);
      expect(result).toBeNull();
    });
  });

  describe('findOrCreateBySsoQualifier', () => {
    it('이미 존재하는 사용자의 경우 이메일이 다르면 업데이트해야 한다', async () => {
      const existing = {
        id: BigInt(1),
        ssoQualifier: 'sub',
        email: 'old@test.com',
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(existing);
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...existing,
        email: 'new@test.com',
      });

      const result = await service.findOrCreateBySsoQualifier(
        'sub',
        'new@test.com',
      );

      expect(prisma.user.update).toHaveBeenCalled();
      expect(result.email).toBe('new@test.com');
    });

    it('존재하지 않는 사용자의 경우 새로 생성해야 한다', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: BigInt(2),
        ssoQualifier: 'new',
      });

      const result = await service.findOrCreateBySsoQualifier(
        'new',
        'test@test.com',
      );

      expect(prisma.user.create).toHaveBeenCalled();
      expect(result.ssoQualifier).toBe('new');
    });
  });

  describe('updateUser', () => {
    it('사용자 정보를 성공적으로 수정해야 한다', async () => {
      const user = { id: BigInt(1) };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: BigInt(1),
        nickname: '수정됨',
      });

      const result = await service.updateUser(1, { nickname: '수정됨' });

      expect(result.nickname).toBe('수정됨');
      expect(prisma.user.update).toHaveBeenCalled();
    });
  });

  describe('deleteUserAccount', () => {
    it('사용자 계정을 성공적으로 삭제해야 한다', async () => {
      (prisma.user.delete as jest.Mock).mockResolvedValue({ id: BigInt(1) });
      await service.deleteUserAccount(1);
      expect(prisma.user.delete).toHaveBeenCalled();
    });

    it('Prisma P2025 에러(찾을 수 없음) 발생 시 NotFoundException을 던져야 한다', async () => {
      const error = new Error('Record not found');
      (error as any).code = 'P2025';
      (prisma.user.delete as jest.Mock).mockRejectedValue(error);

      await expect(service.deleteUserAccount(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getUserStats', () => {
    it('통계 및 수익률을 정확히 계산해야 한다', async () => {
      (prisma.lottoGame.count as jest.Mock).mockResolvedValue(5); // 5000원 지출
      (prisma.lottoGame.aggregate as jest.Mock).mockResolvedValue({
        _sum: { prizeAmount: BigInt(10000) }, // 10000원 당첨
      });

      const result = await service.getUserStats(1);

      expect(result.totalGames).toBe(5);
      expect(result.totalWinnings).toBe(BigInt(10000));
      expect(result.roi).toBe(100); // (10000 - 5000) / 5000 * 100
    });

    it('게임 내역이 없는 경우 수익률은 0이어야 한다', async () => {
      (prisma.lottoGame.count as jest.Mock).mockResolvedValue(0);
      (prisma.lottoGame.aggregate as jest.Mock).mockResolvedValue({
        _sum: { prizeAmount: null },
      });

      const result = await service.getUserStats(1);
      expect(result.roi).toBe(0);
    });
  });
});
