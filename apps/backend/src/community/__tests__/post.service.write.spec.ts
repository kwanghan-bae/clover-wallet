import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from '../post.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('PostService — 쓰기/검증', () => {
  let service: PostService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        {
          provide: PrismaService,
          useValue: {
            post: {
              findMany: jest.fn(),
              count: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            postLike: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('createPost', () => {
    it('새 게시글을 생성해야 한다', async () => {
      const dto = { title: 'T', content: 'C' };
      (prisma.post.create as jest.Mock).mockResolvedValue({ id: BigInt(1) });
      await service.createPost(BigInt(1), dto);
      expect(prisma.post.create).toHaveBeenCalled();
    });
  });

  describe('updatePost', () => {
    it('작성자일 경우 게시글을 수정해야 한다', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue({
        id: BigInt(1),
        userId: BigInt(1),
      });
      await service.updatePost(BigInt(1), BigInt(1), { title: 'U' });
      expect(prisma.post.update).toHaveBeenCalled();
    });

    it('작성자가 아닐 경우 ForbiddenException을 던져야 한다', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue({
        id: BigInt(1),
        userId: BigInt(2),
      });
      await expect(
        service.updatePost(BigInt(1), BigInt(1), { title: 'U' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deletePost', () => {
    it('작성자일 경우 게시글을 삭제해야 한다', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue({
        id: BigInt(1),
        userId: BigInt(1),
      });
      (prisma.post.delete as jest.Mock).mockResolvedValue({ id: BigInt(1) });

      await service.deletePost(BigInt(1), BigInt(1));

      expect(prisma.post.delete).toHaveBeenCalledWith({
        where: { id: BigInt(1) },
      });
    });

    it('게시글이 없을 경우 NotFoundException을 던져야 한다', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.deletePost(BigInt(99), BigInt(1))).rejects.toThrow(
        NotFoundException,
      );
    });

    it('작성자가 아닐 경우 ForbiddenException을 던져야 한다', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue({
        id: BigInt(1),
        userId: BigInt(2),
      });
      await expect(service.deletePost(BigInt(1), BigInt(1))).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('validatePostOwnership', () => {
    it('작성자일 경우 게시글을 반환해야 한다', async () => {
      const post = { id: BigInt(1), userId: BigInt(1) };
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(post);
      const result = await service.validatePostOwnership(BigInt(1), BigInt(1));
      expect(result).toEqual(post);
    });

    it('게시글이 없으면 NotFoundException을 던져야 한다', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(
        service.validatePostOwnership(BigInt(1), BigInt(1)),
      ).rejects.toThrow(NotFoundException);
    });

    it('작성자가 아니면 ForbiddenException을 던져야 한다', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue({
        id: BigInt(1),
        userId: BigInt(2),
      });
      await expect(
        service.validatePostOwnership(BigInt(1), BigInt(1)),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
