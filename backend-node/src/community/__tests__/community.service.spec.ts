import { Test, TestingModule } from '@nestjs/testing';
import { CommunityService } from '../community.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

/**
 * CommunityService에 대한 단위 테스트입니다.
 * 게시글 조회, 상세 조회, 생성, 수정 및 댓글 관련 로직과 권한 검증을 테스트합니다.
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
    it('should return paginated posts', async () => {
      (prisma.post.findMany as jest.Mock).mockResolvedValue([
        { id: BigInt(1), user: { id: BigInt(1), ssoQualifier: 'user@test.com', badges: 'a,b' } },
      ]);
      (prisma.post.count as jest.Mock).mockResolvedValue(1);

      const result = await service.getAllPosts(0, 10);
      expect(result.content).toHaveLength(1);
      expect(result.content[0].userSummary.nickname).toBe('user');
    });

    it('should show isLiked when currentUserId is provided', async () => {
      (prisma.post.findMany as jest.Mock).mockResolvedValue([{ id: BigInt(1) }]);
      (prisma.post.count as jest.Mock).mockResolvedValue(1);
      (prisma.postLike.findMany as jest.Mock).mockResolvedValue([{ postId: BigInt(1) }]);

      const result = await service.getAllPosts(0, 10, BigInt(1));
      expect(result.content[0].isLiked).toBe(true);
    });
  });

  describe('getPostById', () => {
    it('should return post details', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue({ id: BigInt(1), user: null });
      const result = await service.getPostById(BigInt(1));
      expect(result.id).toBe(BigInt(1));
    });

    it('should throw NotFoundException if post not found', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.getPostById(BigInt(99))).rejects.toThrow(NotFoundException);
    });
  });

  describe('createPost', () => {
    it('should create a new post', async () => {
      const dto = { title: 'T', content: 'C' };
      await service.createPost(BigInt(1), dto);
      expect(prisma.post.create).toHaveBeenCalled();
    });
  });

  describe('updatePost', () => {
    it('should update post if authorized', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue({ id: BigInt(1), userId: BigInt(1) });
      await service.updatePost(BigInt(1), BigInt(1), { title: 'U' });
      expect(prisma.post.update).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if not authorized', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue({ id: BigInt(1), userId: BigInt(2) });
      await expect(service.updatePost(BigInt(1), BigInt(1), { title: 'U' })).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getCommentsByPostId', () => {
    it('should return paginated comments', async () => {
      (prisma.comment.findMany as jest.Mock).mockResolvedValue([{ id: BigInt(1), user: null }]);
      (prisma.comment.count as jest.Mock).mockResolvedValue(1);
      const result = await service.getCommentsByPostId(BigInt(1), 0, 10);
      expect(result.content).toHaveLength(1);
    });
  });

  describe('createComment', () => {
    it('should create comment if post exists', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue({ id: BigInt(1) });
      await service.createComment(BigInt(1), { postId: '1', content: 'C' });
      expect(prisma.comment.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if post missing', async () => {
      (prisma.post.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.createComment(BigInt(1), { postId: '1', content: 'C' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateComment', () => {
    it('should update comment if authorized', async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue({ id: BigInt(1), userId: BigInt(1) });
      await service.updateComment(BigInt(1), BigInt(1), { content: 'U' });
      expect(prisma.comment.update).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if not authorized', async () => {
      (prisma.comment.findUnique as jest.Mock).mockResolvedValue({ id: BigInt(1), userId: BigInt(2) });
      await expect(service.updateComment(BigInt(1), BigInt(1), { content: 'U' })).rejects.toThrow(ForbiddenException);
    });
  });
});
