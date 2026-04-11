import { Test, TestingModule } from '@nestjs/testing';
import { LikeService } from '../like.service';
import { PostService } from '../post.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('LikeService', () => {
  let service: LikeService;
  let prisma: PrismaService;
  let postService: PostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LikeService,
        {
          provide: PostService,
          useValue: {
            getPostById: jest.fn().mockResolvedValue({
              id: BigInt(1),
              isLiked: true,
            }),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            postLike: {
              findUnique: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
            },
            post: {
              update: jest.fn(),
            },
            $transaction: jest.fn((promises) => Promise.all(promises)),
          },
        },
      ],
    }).compile();

    service = module.get<LikeService>(LikeService);
    prisma = module.get<PrismaService>(PrismaService);
    postService = module.get<PostService>(PostService);
  });

  describe('likePost', () => {
    it('좋아요가 없는 경우 새로 추가해야 한다', async () => {
      const pid = BigInt(1);
      const uid = BigInt(100);
      (prisma.postLike.findUnique as jest.Mock).mockResolvedValue(null);

      await service.likePost(pid, uid);

      expect(prisma.postLike.create).toHaveBeenCalled();
      expect(prisma.post.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { likes: { increment: 1 } },
        }),
      );
      expect(postService.getPostById).toHaveBeenCalledWith(pid, uid);
    });

    it('이미 좋아요를 누른 경우 취소해야 한다', async () => {
      const pid = BigInt(1);
      const uid = BigInt(100);
      (prisma.postLike.findUnique as jest.Mock).mockResolvedValue({
        id: BigInt(1),
      });

      await service.likePost(pid, uid);

      expect(prisma.postLike.delete).toHaveBeenCalled();
      expect(prisma.post.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { likes: { decrement: 1 } },
        }),
      );
      expect(postService.getPostById).toHaveBeenCalledWith(pid, uid);
    });

    it('토글 후 업데이트된 게시글을 반환해야 한다', async () => {
      (prisma.postLike.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.likePost(BigInt(1), BigInt(100));
      expect(result.id).toBe(BigInt(1));
      expect(result.isLiked).toBe(true);
    });
  });
});
