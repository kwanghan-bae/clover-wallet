import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PageResponse } from '../common/types/page-response';

/**
 * 커뮤니티 게시글 및 댓글 로직을 처리하는 서비스입니다.
 */
@Injectable()
export class CommunityService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 모든 게시글을 최신순으로 조회합니다.
   */
  async getAllPosts(
    page: number,
    size: number,
    currentUserId?: bigint,
  ): Promise<PageResponse<any>> {
    const skip = page * size;
    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        skip,
        take: size,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, ssoQualifier: true, email: true, badges: true } },
          _count: { select: { comments: true } },
        },
      }),
      this.prisma.post.count(),
    ]);

    const likedPostIds = await this.getLikedPostIds(currentUserId, posts.map(p => p.id));
    const content = posts.map(p => this.transformPost(p, likedPostIds.has(p.id.toString())));

    return {
      content,
      pageNumber: page,
      pageSize: size,
      totalElements: total,
      totalPages: Math.ceil(total / size),
    };
  }

  /**
   * 특정 게시글 상세 정보를 조회합니다.
   */
  async getPostById(postId: bigint, currentUserId?: bigint) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: { select: { id: true, ssoQualifier: true, email: true, badges: true } },
      },
    });

    if (!post) throw new NotFoundException(`게시글을 찾을 수 없습니다: ${postId}`);

    const isLiked = currentUserId ? !!(await this.prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId: currentUserId } },
    })) : false;

    return this.transformPost(post, isLiked);
  }

  /**
   * 새 게시글을 작성합니다.
   */
  async createPost(userId: bigint, dto: CreatePostDto) {
    return this.prisma.post.create({
      data: { userId, title: dto.title, content: dto.content, likes: 0 },
    });
  }

  /**
   * 게시글을 수정합니다.
   */
  async updatePost(postId: bigint, userId: bigint, dto: UpdatePostDto) {
    const post = await this.validatePostOwnership(postId, userId);
    return this.prisma.post.update({
      where: { id: postId },
      data: { ...dto, updatedAt: new Date() },
    });
  }

  /**
   * 게시글에 '좋아요' 토글 처리를 합니다.
   */
  async likePost(postId: bigint, userId: bigint) {
    const existing = await this.prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existing) {
      await this.prisma.$transaction([
        this.prisma.postLike.delete({ where: { postId_userId: { postId, userId } } }),
        this.prisma.post.update({ where: { id: postId }, data: { likes: { decrement: 1 } } }),
      ]);
    } else {
      await this.prisma.$transaction([
        this.prisma.postLike.create({ data: { postId, userId } }),
        this.prisma.post.update({ where: { id: postId }, data: { likes: { increment: 1 } } }),
      ]);
    }

    return this.getPostById(postId, userId);
  }

  /**
   * 특정 게시글의 댓글 목록을 조회합니다.
   */
  async getCommentsByPostId(postId: bigint, page: number, size: number) {
    const skip = page * size;
    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { postId },
        skip,
        take: size,
        orderBy: { createdAt: 'asc' },
        include: { user: { select: { id: true, ssoQualifier: true, badges: true } } },
      }),
      this.prisma.comment.count({ where: { postId } }),
    ]);

    const content = comments.map(c => ({
      ...c,
      userSummary: this.mapToUserSummary(c.user),
    }));

    return {
      content,
      pageNumber: page,
      pageSize: size,
      totalElements: total,
      totalPages: Math.ceil(total / size),
    };
  }

  /**
   * 새 댓글을 작성합니다.
   */
  async createComment(userId: bigint, dto: CreateCommentDto) {
    const post = await this.prisma.post.findUnique({ where: { id: BigInt(dto.postId) } });
    if (!post) throw new NotFoundException('게시글을 찾을 수 없습니다.');

    return this.prisma.comment.create({
      data: { userId, postId: BigInt(dto.postId), content: dto.content, likes: 0 },
    });
  }

  /**
   * 댓글을 수정합니다.
   */
  async updateComment(commentId: bigint, userId: bigint, dto: UpdateCommentDto) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('댓글을 찾을 수 없습니다.');
    if (comment.userId !== userId) throw new ForbiddenException('수정 권한이 없습니다.');

    return this.prisma.comment.update({
      where: { id: commentId },
      data: { content: dto.content, updatedAt: new Date() },
    });
  }

  // Helper Methods

  private async getLikedPostIds(userId?: bigint, postIds: bigint[]): Promise<Set<string>> {
    if (!userId || postIds.length === 0) return new Set();
    const likes = await this.prisma.postLike.findMany({
      where: { userId, postId: { in: postIds } },
      select: { postId: true },
    });
    return new Set(likes.map(l => l.postId.toString()));
  }

  private transformPost(post: any, isLiked: boolean) {
    return {
      ...post,
      isLiked,
      userSummary: this.mapToUserSummary(post.user),
    };
  }

  private mapToUserSummary(user: any) {
    if (!user) return null;
    return {
      id: user.id,
      nickname: user.ssoQualifier.split('@')[0],
      badges: user.badges?.split(',') || [],
    };
  }

  private async validatePostOwnership(postId: bigint, userId: bigint) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('게시글을 찾을 수 없습니다.');
    if (post.userId !== userId) throw new ForbiddenException('수정 권한이 없습니다.');
    return post;
  }
}
