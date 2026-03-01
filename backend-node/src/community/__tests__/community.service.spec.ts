import { Test, TestingModule } from '@nestjs/testing';
import { CommunityService } from '../community.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('CommunityService', () => {
  let service: CommunityService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityService,
        {
          provide: PrismaService,
          useValue: {
            post: {
              findMany: jest.fn(),
              count: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            comment: {
              findMany: jest.fn(),
              count: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              findUnique: jest.fn(),
            },
            postLike: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
            },
            $transaction: jest.fn((promises) => Promise.all(promises)),
          },
        },
      ],
    }).compile();

    service = module.get<CommunityService>(CommunityService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllPosts', () => {
    it('should return paginated posts', async () => {
      (prisma.post.findMany as jest.Mock).mockResolvedValue([{ id: BigInt(1), user: null }]);
      (prisma.post.count as jest.Mock).mockResolvedValue(1);

      const result = await service.getAllPosts(0, 10);

      expect(result.content).toHaveLength(1);
      expect(result.totalElements).toBe(1);
    });
  });

  describe('likePost', () => {
    it('should add like if not already liked', async () => {
      (prisma.postLike.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.post.findUnique as jest.Mock).mockResolvedValue({ id: BigInt(1), user: null });

      await service.likePost(BigInt(1), BigInt(1));

      expect(prisma.postLike.create).toHaveBeenCalled();
      expect(prisma.post.update).toHaveBeenCalledWith(expect.objectContaining({
        data: { likes: { increment: 1 } }
      }));
    });

    it('should remove like if already liked', async () => {
      (prisma.postLike.findUnique as jest.Mock).mockResolvedValue({ id: BigInt(1) });
      (prisma.post.findUnique as jest.Mock).mockResolvedValue({ id: BigInt(1), user: null });

      await service.likePost(BigInt(1), BigInt(1));

      expect(prisma.postLike.delete).toHaveBeenCalled();
      expect(prisma.post.update).toHaveBeenCalledWith(expect.objectContaining({
        data: { likes: { decrement: 1 } }
      }));
    });
  });
});
