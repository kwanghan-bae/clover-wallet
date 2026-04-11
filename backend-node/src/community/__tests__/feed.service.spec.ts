import { Test, TestingModule } from '@nestjs/testing';
import { FeedService } from '../feed.service';
import { PostService } from '../post.service';
import { PrismaService } from '../../prisma/prisma.service';
import { FollowService } from '../../users/follow.service';

describe('FeedService', () => {
  let service: FeedService;
  let prisma: PrismaService;
  let followService: FollowService;
  let postService: PostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedService,
        {
          provide: FollowService,
          useValue: {
            getFollowingIds: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: PostService,
          useValue: {
            getLikedPostIds: jest.fn().mockResolvedValue(new Set()),
            transformPost: jest.fn((post, isLiked) => ({
              ...post,
              isLiked,
              userSummary: { id: post.user?.id, nickname: 'test' },
            })),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            post: {
              findMany: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<FeedService>(FeedService);
    prisma = module.get<PrismaService>(PrismaService);
    followService = module.get<FollowService>(FollowService);
    postService = module.get<PostService>(PostService);
  });

  describe('getFollowingFeed', () => {
    it('팔로잉이 없는 경우 빈 피드를 반환해야 한다', async () => {
      (followService.getFollowingIds as jest.Mock).mockResolvedValue([]);

      const result = await service.getFollowingFeed(BigInt(1), 0, 10);

      expect(result.content).toEqual([]);
      expect(result.totalElements).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('팔로잉한 사용자의 게시글을 반환해야 한다', async () => {
      const followingIds = [BigInt(2), BigInt(3)];
      (followService.getFollowingIds as jest.Mock).mockResolvedValue(
        followingIds,
      );

      const mockPosts = [
        {
          id: BigInt(10),
          user: { id: BigInt(2), ssoQualifier: 'a@b.c' },
        },
      ];
      (prisma.post.findMany as jest.Mock).mockResolvedValue(mockPosts);
      (prisma.post.count as jest.Mock).mockResolvedValue(1);

      const result = await service.getFollowingFeed(BigInt(1), 0, 10);

      expect(result.content).toHaveLength(1);
      expect(result.pageNumber).toBe(0);
      expect(result.pageSize).toBe(10);
      expect(result.totalElements).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('좋아요 정보가 포함되어야 한다', async () => {
      (followService.getFollowingIds as jest.Mock).mockResolvedValue([
        BigInt(2),
      ]);
      (prisma.post.findMany as jest.Mock).mockResolvedValue([
        { id: BigInt(10), user: { id: BigInt(2) } },
      ]);
      (prisma.post.count as jest.Mock).mockResolvedValue(1);
      (postService.getLikedPostIds as jest.Mock).mockResolvedValue(
        new Set(['10']),
      );

      const result = await service.getFollowingFeed(BigInt(1), 0, 10);

      expect(postService.transformPost).toHaveBeenCalledWith(
        expect.objectContaining({ id: BigInt(10) }),
        true,
      );
      expect(result.content).toHaveLength(1);
    });

    it('페이징 정보가 올바르게 계산되어야 한다', async () => {
      (followService.getFollowingIds as jest.Mock).mockResolvedValue([
        BigInt(2),
      ]);
      (prisma.post.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.post.count as jest.Mock).mockResolvedValue(50);

      const result = await service.getFollowingFeed(BigInt(1), 2, 10);

      expect(result.pageNumber).toBe(2);
      expect(result.totalPages).toBe(5);
    });
  });
});
