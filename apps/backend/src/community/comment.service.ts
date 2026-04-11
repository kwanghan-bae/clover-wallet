import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PostService } from './post.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import type { PageResponse } from '../common/types/page-response';

/**
 * 댓글 CRUD 로직을 처리하는 서비스입니다.
 */
@Injectable()
export class CommentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly postService: PostService,
  ) {}

  async getCommentsByPostId(
    postId: bigint,
    page: number,
    size: number,
  ): Promise<PageResponse<any>> {
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
      userSummary: this.postService.mapToUserSummary(c.user),
      replies: c.replies.map((r) => ({
        ...r,
        userSummary: this.postService.mapToUserSummary(r.user),
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
        parentId: dto.parentId ? BigInt(dto.parentId) : undefined,
      },
    });
  }

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
}
