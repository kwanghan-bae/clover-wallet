import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PageResponse } from '../common/types/page-response'; // Assuming I created this

@Injectable()
export class CommunityService {
  constructor(private prisma: PrismaService) {}

  async getAllPosts(page: number, size: number, userId?: bigint): Promise<PageResponse<any>> {
    const skip = page * size;
    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        skip,
        take: size,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, ssoQualifier: true, email: true } // Exclude sensitive
          },
          _count: { select: { comments: true } }
        }
      }),
      this.prisma.post.count(),
    ]);

    // Map posts to include isLiked if userId provided?
    // Doing it in JS since nested query is complex or needs raw query
    let content = posts;
    if (userId) {
       // Check likes for these posts
       const postIds = posts.map(p => p.id);
       const likes = await this.prisma.postLike.findMany({
         where: { userId: BigInt(userId), postId: { in: postIds } },
         select: { postId: true }
       });
       const likedSet = new Set(likes.map(l => l.postId.toString()));
       
       content = posts.map(p => ({
         ...p,
         isLiked: likedSet.has(p.id.toString())
       }));
    }

    return {
      content,
      pageNumber: page,
      pageSize: size,
      totalElements: total,
      totalPages: Math.ceil(total / size),
    };
  }

  async getPostById(postId: bigint | number, userId?: bigint) {
    const post = await this.prisma.post.findUnique({
      where: { id: BigInt(postId) },
      include: {
        user: { select: { id: true, ssoQualifier: true, email: true } }
      }
    });

    if (!post) {
      throw new NotFoundException(`Post not found with id: ${postId}`);
    }

    let isLiked = false;
    if (userId) {
      const like = await this.prisma.postLike.findUnique({
        where: { postId_userId: { postId: BigInt(postId), userId: BigInt(userId) } }
      });
      isLiked = !!like;
    }

    return { ...post, isLiked };
  }

  async createPost(userId: bigint, dto: CreatePostDto) {
    return this.prisma.post.create({
      data: {
        userId: BigInt(userId),
        title: dto.title,
        content: dto.content,
        likes: 0
      },
      include: { user: { select: { id: true, ssoQualifier: true, email: true } } }
    });
  }

  async updatePost(postId: bigint | number, userId: bigint, dto: UpdatePostDto) {
    const post = await this.getPostById(postId);
    if (post.userId !== BigInt(userId)) {
        // Simple ownership check
        // In real app, maybe admin can edit too.
        throw new BadRequestException("You can only edit your own posts");
    }

    return this.prisma.post.update({
      where: { id: BigInt(postId) },
      data: {
        ...dto,
        updatedAt: new Date()
      },
      include: { user: { select: { id: true, ssoQualifier: true, email: true } } }
    });
  }

  async likePost(postId: bigint | number, userId: bigint) {
    const pId = BigInt(postId);
    const uId = BigInt(userId);

    // Check if liked
    const existing = await this.prisma.postLike.findUnique({
      where: { postId_userId: { postId: pId, userId: uId } }
    });

    if (existing) {
      // Unlike
      await this.prisma.$transaction([
        this.prisma.postLike.delete({
          where: { postId_userId: { postId: pId, userId: uId } }
        }),
        this.prisma.post.update({
          where: { id: pId },
          data: { likes: { decrement: 1 } }
        })
      ]);
      return this.getPostById(pId, uId);
    } else {
      // Like
      await this.prisma.$transaction([
        this.prisma.postLike.create({
          data: { postId: pId, userId: uId }
        }),
        this.prisma.post.update({
          where: { id: pId },
          data: { likes: { increment: 1 } }
        })
      ]);
      return this.getPostById(pId, uId);
    }
  }

  async getCommentsByPostId(postId: bigint | number, page: number, size: number) {
    const skip = page * size;
    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { postId: BigInt(postId) },
        skip,
        take: size,
        orderBy: { createdAt: 'asc' },
        include: { user: { select: { id: true, ssoQualifier: true, email: true } } }
      }),
      this.prisma.comment.count({ where: { postId: BigInt(postId) } })
    ]);

    return {
        content: comments,
        pageNumber: page,
        pageSize: size,
        totalElements: total,
        totalPages: Math.ceil(total / size),
    };
  }

  async createComment(userId: bigint, dto: CreateCommentDto) {
    return this.prisma.comment.create({
      data: {
        userId: BigInt(userId),
        postId: BigInt(dto.postId),
        content: dto.content,
        likes: 0
      },
      include: { user: { select: { id: true, ssoQualifier: true, email: true } } }
    });
  }

  async updateComment(commentId: bigint | number, userId: bigint, dto: UpdateCommentDto) {
    const comment = await this.prisma.comment.findUnique({ where: { id: BigInt(commentId) }});
    if (!comment) throw new NotFoundException("Comment not found");
    
    if (comment.userId !== BigInt(userId)) {
        throw new BadRequestException("You can only edit your own comments");
    }

    return this.prisma.comment.update({
      where: { id: BigInt(commentId) },
      data: {
        content: dto.content,
        updatedAt: new Date()
      },
      include: { user: { select: { id: true, ssoQualifier: true, email: true } } }
    });
  }
}
