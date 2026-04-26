import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PostService } from './post.service';

@Injectable()
export class LikeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly postService: PostService,
  ) {}

  async likePost(postId: bigint, userId: bigint) {
    const existing = await this.prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existing) {
      await this.prisma.$transaction([
        this.prisma.postLike.delete({
          where: { postId_userId: { postId, userId } },
        }),
        this.prisma.post.update({
          where: { id: postId },
          data: { likes: { decrement: 1 } },
        }),
      ]);
    } else {
      await this.prisma.$transaction([
        this.prisma.postLike.create({ data: { postId, userId } }),
        this.prisma.post.update({
          where: { id: postId },
          data: { likes: { increment: 1 } },
        }),
      ]);
    }

    return this.postService.getPostById(postId, userId);
  }
}
