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
          user: {
            select: { id: true, ssoQualifier: true, email: true, badges: true },
          },
          _count: { select: { comments: true } },
        },
      }),
      this.prisma.post.count(),
    ]);

    const likedPostIds = await this.getLikedPostIds(
      posts.map((p) => p.id),
      currentUserId,
    );
    const content = posts.map((p) =>
      this.transformPost(p, likedPostIds.has(p.id.toString())),
    );

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
        user: {
          select: { id: true, ssoQualifier: true, email: true, badges: true },
        },
      },
    });

    if (!post)
      throw new NotFoundException(`게시글을 찾을 수 없습니다: ${postId}`);

    const isLiked = currentUserId
      ? !!(await this.prisma.postLike.findUnique({
          where: { postId_userId: { postId, userId: currentUserId } },
        }))
      : false;

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
    await this.validatePostOwnership(postId, userId);
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

    return this.getPostById(postId, userId);
  }

  /**
   * 특정 게시글의 댓글 목록을 조회합니다. (최상위 댓글만, 대댓글 포함)
   */
  async getCommentsByPostId(postId: bigint, page: number, size: number) {
    const skip = page * size;
    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { postId, parentId: null },
        skip,
        take: size,
        orderBy: { createdAt: 'asc' },
        include: {
          user: { select: { id: true, ssoQualifier: true, badges: true } },
          replies: {
            orderBy: { createdAt: 'asc' },
            include: {
              user: { select: { id: true, ssoQualifier: true, badges: true } },
            },
          },
        },
      }),
      this.prisma.comment.count({ where: { postId, parentId: null } }),
    ]);

    const content = comments.map((c) => ({
      ...c,
      userSummary: this.mapToUserSummary(c.user),
      replies: c.replies.map((r) => ({
        ...r,
        userSummary: this.mapToUserSummary(r.user),
      })),
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
   * 게시글을 삭제합니다. (작성자만 가능)
   */
  async deletePost(postId: bigint, userId: bigint): Promise<void> {
    await this.validatePostOwnership(postId, userId);
    await this.prisma.post.delete({ where: { id: postId } });
  }

  /**
   * 특정 사용자가 작성한 게시글 목록을 페이지네이션하여 조회합니다.
   */
  async getUserPosts(userId: bigint, page: number, size: number) {
    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { userId },
        skip: page * size,
        take: size,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, ssoQualifier: true, email: true, badges: true } },
          _count: { select: { comments: true } },
        },
      }),
      this.prisma.post.count({ where: { userId } }),
    ]);

    return {
      content: posts.map((p) => this.transformPost(p, false)),
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
    const post = await this.prisma.post.findUnique({
      where: { id: BigInt(dto.postId) },
    });
    if (!post) throw new NotFoundException('게시글을 찾을 수 없습니다.');

    return this.prisma.comment.create({
      data: {
        userId,
        postId: BigInt(dto.postId),
        content: dto.content,
        likes: 0,
      },
    });
  }

  /**
   * 댓글을 수정합니다.
   */
  async updateComment(
    commentId: bigint,
    userId: bigint,
    dto: UpdateCommentDto,
  ) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) throw new NotFoundException('댓글을 찾을 수 없습니다.');
    if (comment.userId !== userId)
      throw new ForbiddenException('수정 권한이 없습니다.');

    return this.prisma.comment.update({
      where: { id: commentId },
      data: { content: dto.content, updatedAt: new Date() },
    });
  }

  // Helper Methods

  /**
   * 특정 사용자가 좋아요를 누른 게시글 ID 목록을 조회하여 Set 형태로 반환합니다.
   */
  private async getLikedPostIds(
    postIds: bigint[],
    userId?: bigint,
  ): Promise<Set<string>> {
    if (!userId || postIds.length === 0) return new Set();
    const likes = await this.prisma.postLike.findMany({
      where: { userId, postId: { in: postIds } },
      select: { postId: true },
    });
    return new Set(likes.map((l) => l.postId.toString()));
  }

  /**
   * 원본 게시글 데이터를 API 응답용 데이터 형식으로 변환합니다.
   * 좋아요 여부 및 사용자 요약 정보를 포함합니다.
   */
  private transformPost(post: any, isLiked: boolean) {
    return {
      ...post,
      isLiked,
      userSummary: this.mapToUserSummary(post.user),
    };
  }

  /**
   * 사용자 엔티티로부터 닉네임, 뱃지 목록 등이 포함된 요약 정보를 생성합니다.
   */
  private mapToUserSummary(user: any) {
    if (!user) return null;
    return {
      id: user.id,
      nickname: user.ssoQualifier.split('@')[0],
      badges: user.badges?.split(',') || [],
    };
  }

  /**
   * 특정 게시글의 소유권을 확인합니다.
   * 작성자가 아닌 경우 ForbiddenException을 던집니다.
   */
  private async validatePostOwnership(postId: bigint, userId: bigint) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('게시글을 찾을 수 없습니다.');
    if (post.userId !== userId)
      throw new ForbiddenException('수정 권한이 없습니다.');
    return post;
  }
}
