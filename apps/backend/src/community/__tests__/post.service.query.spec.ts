import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from '../post.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('PostService — 읽기/조회', () => {
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

  describe('getAllPosts', () => {
    it('게시글 목록을 페이징하여 반환해야 한다', async () => {
      const mockPosts = [
        {
          id: BigInt(1),
          user: { id: BigInt(10), ssoQualifier: 'user@test.com', badges: 'A,B' },
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

  describe('getUserPosts', () => {
    it('사용자가 작성한 게시글 목록을 페이징하여 반환해야 한다', async () => {
      const mockPosts = [
        {
          id: BigInt(1),
          userId: BigInt(10),
          user: {
            id: BigInt(10),
            ssoQualifier: 'user@test.com',
            email: 'user@test.com',
            badges: 'A,B',
          },
          _count: { comments: 3 },
        },
      ];
      (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
      (prisma.post.count as jest.Mock).mockResolvedValue(25);

      const result = await service.getUserPosts(BigInt(10), 0, 10);

      expect(result.content).toHaveLength(1);
      expect(result.totalPages).toBe(3);
      expect(result.pageNumber).toBe(0);
      expect(result.pageSize).toBe(10);
      expect(result.totalElements).toBe(25);
    });

    it('게시글이 없을 경우 빈 목록을 반환해야 한다', async () => {
      (prisma.post.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.post.count as jest.Mock).mockResolvedValue(0);

      const result = await service.getUserPosts(BigInt(99), 0, 10);

      expect(result.content).toHaveLength(0);
      expect(result.totalPages).toBe(0);
      expect(result.totalElements).toBe(0);
    });
  });

  describe('transformPost', () => {
    it('게시글 데이터를 API 응답 형식으로 변환해야 한다', () => {
      const post = {
        id: BigInt(1),
        user: { id: BigInt(10), ssoQualifier: 'nick@t.c', badges: 'A' },
      };
      const result = service.transformPost(post, true);
      expect(result.isLiked).toBe(true);
      expect(result.userSummary.nickname).toBe('nick');
    });
  });

  describe('mapToUserSummary', () => {
    it('사용자 요약 정보를 생성해야 한다', () => {
      const user = { id: BigInt(1), ssoQualifier: 'test@a.b', badges: 'X,Y' };
      const result = service.mapToUserSummary(user);
      expect(result).toEqual({
        id: BigInt(1),
        nickname: 'test',
        badges: ['X', 'Y'],
      });
    });

    it('user가 null인 경우 null을 반환해야 한다', () => {
      expect(service.mapToUserSummary(null)).toBeNull();
    });

    it('badges가 없는 경우 빈 배열을 반환해야 한다', () => {
      const user = { id: BigInt(1), ssoQualifier: 'u@a.b', badges: undefined };
      const result = service.mapToUserSummary(user);
      expect(result!.badges).toEqual([]);
    });
  });

  describe('getLikedPostIds', () => {
    it('좋아요를 누른 게시글 ID Set을 반환해야 한다', async () => {
      (prisma.postLike.findMany as jest.Mock).mockResolvedValue([
        { postId: BigInt(1) },
        { postId: BigInt(3) },
      ]);

      const result = await service.getLikedPostIds(
        [BigInt(1), BigInt(2), BigInt(3)],
        BigInt(100),
      );
      expect(result.has('1')).toBe(true);
      expect(result.has('2')).toBe(false);
      expect(result.has('3')).toBe(true);
    });

    it('userId가 없으면 빈 Set을 반환해야 한다', async () => {
      const result = await service.getLikedPostIds([BigInt(1)]);
      expect(result.size).toBe(0);
    });

    it('postIds가 비어있으면 빈 Set을 반환해야 한다', async () => {
      const result = await service.getLikedPostIds([], BigInt(1));
      expect(result.size).toBe(0);
    });
  });
});
