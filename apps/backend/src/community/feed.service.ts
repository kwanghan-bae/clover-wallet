import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FollowService } from '../users/follow.service';
import { PostService } from './post.service';
import type { PageResponse } from '../common/types/page-response';

/**
 * 팔로잉 피드 조회 로직을 처리하는 서비스입니다.
 */
@Injectable()
export class FeedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly followService: FollowService,
    private readonly postService: PostService,
  ) {}

  async getFollowingFeed(
    userId: bigint,
    page: number,
    size: number,
  ): Promise<PageResponse<any>> {
    const followingIds = await this.followService.getFollowingIds(userId);
    if (followingIds.length === 0) {
      return {
        content: [],
        pageNumber: page,
        pageSize: size,
        totalElements: 0,
        totalPages: 0,
      };
    }

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { userId: { in: followingIds } },
        skip: page * size,
        take: size,
        orderBy: { createdAt: 'desc' },
        include: { user: true, _count: { select: { comments: true } } },
      }),
      this.prisma.post.count({ where: { userId: { in: followingIds } } }),
    ]);

    const likedIds = await this.postService.getLikedPostIds(
      posts.map((p) => p.id),
      userId,
    );

    return {
      content: posts.map((p) =>
        this.postService.transformPost(p, likedIds.has(p.id.toString())),
      ),
      pageNumber: page,
      pageSize: size,
      totalElements: total,
      totalPages: Math.ceil(total / size),
    };
  }
}
