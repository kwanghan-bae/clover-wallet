import { Test, TestingModule } from '@nestjs/testing';
import { CommunityService } from '../community.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

/**
 * CommunityService에 대한 단위 테스트입니다.
 * 게시글 및 댓글의 CRUD, 좋아요 토글 기능, 권한 검증 및 페이징 로직을 검증합니다.
 */
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

  describe('getAllPosts', () => {
    it('게시글 목록을 페이징하여 반환해야 한다', async () => {
      const mockPosts = [
        {
          id: BigInt(1),
          user: {
            id: BigInt(10),
            ssoQualifier: 'user@test.com',
            badges: 'A,B',
          },
        },
      ];
      (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
      (prisma.post.count as jest.Mock).mockResolvedValue(15);

      const result = await service.getAllPosts(0, 10);

      expect(result.content).toHaveLength(1);
      expect(result.totalPages).toBe(2);
      expect(result.content[0].userSummary.nickname).toBe('user');
    });

    it('로그인한 사용자의 경우 좋아요 여부를 포함해야 한다', async () => {
      (prisma.post.findMany as jest.Mock).mockResolvedValue([
        { id: BigInt(1) },
      ]);
      (prisma.post.count as jest.Mock).mockResolvedValue(1);
      (prisma.postLike.findMany as jest.Mock).mockResolvedValue([
        { postId: BigInt(1) },
      ]);

      const result = await service.getAllPosts(0, 10, BigInt(100));
      expect(result.content[0].isLiked).toBe(true);
    });
  });

  describe('getPostById', () => {
    it('게시글 상세 정보를 반환해야 한다', async () => {
      const mockPost = {
        id: BigInt(1),
        user: { id: BigInt(10), ssoQualifier: 'u@t.c', badges: '' },
      };
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(mockPost);

      const result = await service.getPostById(BigInt(1));
      expect(result.id).toBe(BigInt(1));
      expect(result.userSummary).toBeDefined();
    });

    it('존재하지 않는 게시글 조회 시 NotFoundException을 던져야 한다', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.getPostById(BigInt(99))).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createPost', () => {
    it('새 게시글을 생성해야 한다', async () => {
      const dto = { title: 'T', content: 'C' };
      (prisma.post.create as jest.Mock).mockResolvedValue({ id: BigInt(1) });
      await service.createPost(BigInt(1), dto);
      expect(prisma.post.create).toHaveBeenCalled();
    });
  });

  describe('likePost', () => {
    it('좋아요가 없는 경우 새로 추가해야 한다', async () => {
      const pid = BigInt(1);
      const uid = BigInt(100);
      (prisma.postLike.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.post.findUnique as jest.Mock).mockResolvedValue({
        id: pid,
        user: null,
      });

      await service.likePost(pid, uid);

      expect(prisma.postLike.create).toHaveBeenCalled();
      expect(prisma.post.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { likes: { increment: 1 } },
        }),
      );
    });

    it('이미 좋아요를 누른 경우 취소해야 한다', async () => {
      const pid = BigInt(1);
      const uid = BigInt(100);
      (prisma.postLike.findUnique as jest.Mock).mockResolvedValue({
        id: BigInt(1),
      });
      (prisma.post.findUnique as jest.Mock).mockResolvedValue({
        id: pid,
        user: null,
      });

      await service.likePost(pid, uid);

      expect(prisma.postLike.delete).toHaveBeenCalled();
      expect(prisma.post.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { likes: { decrement: 1 } },
        }),
      );
    });
  });

  describe('getCommentsByPostId', () => {
    it('특정 게시글의 댓글 목록을 페이징하여 반환해야 한다', async () => {
      const mockComments = [
        { id: BigInt(1), user: { id: BigInt(10), ssoQualifier: 'c@t.c' } },
      ];
      (prisma.comment.findMany as jest.Mock).mockResolvedValue(mockComments);
      (prisma.comment.count as jest.Mock).mockResolvedValue(1);

      const result = await service.getCommentsByPostId(BigInt(1), 0, 10);
      expect(result.content).toHaveLength(1);
      expect(result.content[0].userSummary.nickname).toBe('c');
    });
  });

  describe('createComment', () => {
    it('게시글이 존재할 때 댓글을 생성해야 한다', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue({
        id: BigInt(1),
      });
      await service.createComment(BigInt(1), { postId: '1', content: 'C' });
      expect(prisma.comment.create).toHaveBeenCalled();
    });

    it('게시글이 없을 때 NotFoundException을 던져야 한다', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(
        service.createComment(BigInt(1), { postId: '1', content: 'C' }),
      ).rejects.toThrow(NotFoundException);
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

  describe('updateComment', () => {
    it('작성자일 경우 댓글을 수정해야 한다', async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue({
        id: BigInt(1),
        userId: BigInt(1),
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
  });
});
