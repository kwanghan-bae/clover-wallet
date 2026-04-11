import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from '../comment.service';
import { PostService } from '../post.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('CommentService', () => {
  let service: CommentService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: PostService,
          useValue: {
            mapToUserSummary: jest.fn((user) => {
              if (!user) return null;
              return {
                id: user.id,
                nickname: user.ssoQualifier.split('@')[0],
                badges: user.badges?.split(',') || [],
              };
            }),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            post: { findUnique: jest.fn() },
            comment: {
              findMany: jest.fn(),
              count: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CommentService>(CommentService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('getCommentsByPostId', () => {
    it('특정 게시글의 댓글 목록을 페이징하여 반환해야 한다', async () => {
      const mockComments = [
        {
          id: BigInt(1),
          user: { id: BigInt(10), ssoQualifier: 'c@t.c' },
          replies: [],
        },
      ];
      (prisma.comment.findMany as jest.Mock).mockResolvedValue(mockComments);
      (prisma.comment.count as jest.Mock).mockResolvedValue(1);

      const result = await service.getCommentsByPostId(BigInt(1), 0, 10);
      expect(result.content).toHaveLength(1);
      expect(result.content[0].userSummary.nickname).toBe('c');
      expect(result.content[0].replies).toEqual([]);
    });

    it('대댓글이 있는 경우 replies에 포함해야 한다', async () => {
      const mockComments = [
        {
          id: BigInt(1),
          user: { id: BigInt(10), ssoQualifier: 'parent@t.c' },
          replies: [
            {
              id: BigInt(2),
              user: { id: BigInt(11), ssoQualifier: 'reply@t.c' },
            },
          ],
        },
      ];
      (prisma.comment.findMany as jest.Mock).mockResolvedValue(mockComments);
      (prisma.comment.count as jest.Mock).mockResolvedValue(1);

      const result = await service.getCommentsByPostId(BigInt(1), 0, 10);
      expect(result.content[0].replies).toHaveLength(1);
      expect(result.content[0].replies[0].userSummary.nickname).toBe('reply');
    });

    it('페이징 정보가 올바르게 계산되어야 한다', async () => {
      (prisma.comment.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.comment.count as jest.Mock).mockResolvedValue(25);

      const result = await service.getCommentsByPostId(BigInt(1), 1, 10);
      expect(result.pageNumber).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.totalElements).toBe(25);
      expect(result.totalPages).toBe(3);
    });
  });

  describe('createComment', () => {
    it('게시글이 존재할 때 댓글을 생성해야 한다', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue({
        id: BigInt(1),
      });
      (prisma.comment.create as jest.Mock).mockResolvedValue({
        id: BigInt(1),
      });
      await service.createComment(BigInt(1), {
        postId: 1,
        content: 'C',
      });
      expect(prisma.comment.create).toHaveBeenCalled();
    });

    it('게시글이 없을 때 NotFoundException을 던져야 한다', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(
        service.createComment(BigInt(1), { postId: 1, content: 'C' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('대댓글인 경우 parentId가 설정되어야 한다', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue({
        id: BigInt(1),
      });
      (prisma.comment.create as jest.Mock).mockResolvedValue({
        id: BigInt(2),
      });
      await service.createComment(BigInt(1), {
        postId: 1,
        content: 'reply',
        parentId: 10,
      });
      expect(prisma.comment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ parentId: BigInt(10) }),
        }),
      );
    });
  });

  describe('updateComment', () => {
    it('작성자일 경우 댓글을 수정해야 한다', async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue({
        id: BigInt(1),
        userId: BigInt(1),
      });
      (prisma.comment.update as jest.Mock).mockResolvedValue({
        id: BigInt(1),
      });
      await service.updateComment(BigInt(1), BigInt(1), { content: 'U' });
      expect(prisma.comment.update).toHaveBeenCalled();
    });

    it('댓글이 없을 경우 NotFoundException을 던져야 한다', async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(
        service.updateComment(BigInt(99), BigInt(1), { content: 'U' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('작성자가 아닐 경우 ForbiddenException을 던져야 한다', async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue({
        id: BigInt(1),
        userId: BigInt(2),
      });
      await expect(
        service.updateComment(BigInt(1), BigInt(1), { content: 'U' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
