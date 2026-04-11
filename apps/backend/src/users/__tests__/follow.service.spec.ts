import { Test, TestingModule } from '@nestjs/testing';
import { FollowService } from '../follow.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('FollowService', () => {
  let service: FollowService;
  const mockPrisma = {
    follow: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<FollowService>(FollowService);
    jest.clearAllMocks();
  });

  describe('toggleFollow', () => {
    it('should follow when not following', async () => {
      mockPrisma.follow.findUnique.mockResolvedValue(null);
      mockPrisma.follow.create.mockResolvedValue({ id: BigInt(1) });
      const result = await service.toggleFollow(BigInt(1), BigInt(2));
      expect(result.following).toBe(true);
    });

    it('should unfollow when already following', async () => {
      mockPrisma.follow.findUnique.mockResolvedValue({ id: BigInt(1) });
      mockPrisma.follow.delete.mockResolvedValue({});
      const result = await service.toggleFollow(BigInt(1), BigInt(2));
      expect(result.following).toBe(false);
    });
  });

  describe('getCounts', () => {
    it('should return follower and following counts', async () => {
      mockPrisma.follow.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(5);
      const result = await service.getCounts(BigInt(1));
      expect(result).toEqual({ followers: 10, following: 5 });
    });
  });
});
