import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import type { PageResponse } from '../common/types/page-response';

const USER_SELECT = { id: true, ssoQualifier: true, email: true, badges: true };
const POST_INCLUDE = {
  user: { select: USER_SELECT },
  _count: { select: { comments: true } },
};

/** 게시글 CRUD 및 페이지네이션 로직을 처리하는 서비스입니다. */
@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllPosts(
    page: number,
    size: number,
    currentUserId?: bigint,
  ): Promise<PageResponse<any>> {
    const skip = page * size;
    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        skip, take: size, orderBy: { createdAt: 'desc' }, include: POST_INCLUDE,
      }),
      this.prisma.post.count(),
    ]);

    const likedPostIds = await this.getLikedPostIds(
      posts.map((p) => p.id), currentUserId,
    );
    const content = posts.map((p) =>
      this.transformPost(p, likedPostIds.has(p.id.toString())),
    );

    return { content, pageNumber: page, pageSize: size, totalElements: total, totalPages: Math.ceil(total / size) };
  }

  async getPostById(postId: bigint, currentUserId?: bigint) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { user: { select: USER_SELECT } },
    });

    if (!post) throw new NotFoundException(`게시글을 찾을 수 없습니다: ${postId}`);

    const isLiked = currentUserId
      ? !!(await this.prisma.postLike.findUnique({
          where: { postId_userId: { postId, userId: currentUserId } },
        }))
      : false;

    return this.transformPost(post, isLiked);
  }

  async createPost(userId: bigint, dto: CreatePostDto) {
    return this.prisma.post.create({
      data: { userId, title: dto.title, content: dto.content, likes: 0 },
    });
  }

  async updatePost(postId: bigint, userId: bigint, dto: UpdatePostDto) {
    await this.validatePostOwnership(postId, userId);
    return this.prisma.post.update({
      where: { id: postId },
      data: { ...dto, updatedAt: new Date() },
    });
  }

  async deletePost(postId: bigint, userId: bigint): Promise<void> {
    await this.validatePostOwnership(postId, userId);
    await this.prisma.post.delete({ where: { id: postId } });
  }

  async getUserPosts(userId: bigint, page: number, size: number) {
    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { userId },
        skip: page * size,
        take: size,
        orderBy: { createdAt: 'desc' },
        include: POST_INCLUDE,
      }),
      this.prisma.post.count({ where: { userId } }),
    ]);

    return {
      content: posts.map((p) => this.transformPost(p, false)),
      pageNumber: page, pageSize: size,
      totalElements: total, totalPages: Math.ceil(total / size),
    };
  }

  transformPost(post: any, isLiked: boolean) {
    return { ...post, isLiked, userSummary: this.mapToUserSummary(post.user) };
  }

  mapToUserSummary(user: any) {
    if (!user) return null;
    return {
      id: user.id,
      nickname: user.ssoQualifier.split('@')[0],
      badges: user.badges?.split(',') || [],
    };
  }

  async getLikedPostIds(postIds: bigint[], userId?: bigint): Promise<Set<string>> {
    if (!userId || postIds.length === 0) return new Set();
    const likes = await this.prisma.postLike.findMany({
      where: { userId, postId: { in: postIds } },
      select: { postId: true },
    });
    return new Set(likes.map((l) => l.postId.toString()));
  }

  async validatePostOwnership(postId: bigint, userId: bigint) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('게시글을 찾을 수 없습니다.');
    if (post.userId !== userId) throw new ForbiddenException('수정 권한이 없습니다.');
    return post;
  }
}
