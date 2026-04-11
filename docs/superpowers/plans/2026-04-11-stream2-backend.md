# Stream 2: Backend Modernization Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 백엔드의 150줄 초과 파일을 분리하고, TDD로 테스트 커버리지 80%+를 달성하며, @clover/shared 타입을 적용

**Architecture:** NestJS 모듈 구조를 유지하면서, 서비스를 책임 단위로 분리. community 모듈을 post/comment/like/feed 서비스로 4분할. winning-check에서 알림 로직 분리.

**Tech Stack:** NestJS 11, Prisma 7, Jest 30, TypeScript

**Pre-requisite:** Stream 1 (Infrastructure) 완료 상태에서 시작. `apps/backend/` 경로 기준.

**참고:** `FollowService`는 `apps/backend/src/users/follow.service.ts`에 이미 존재하며, `UsersModule`에서 export됨. FeedService가 이를 import하여 사용.

---

## Task 1: community.service.ts 분리 — PostService 추출

**Files:**
- Create: `apps/backend/src/community/post.service.ts`
- Create: `apps/backend/src/community/__tests__/post.service.spec.ts`
- Modify: `apps/backend/src/community/community.service.ts`
- Modify: `apps/backend/src/community/community.module.ts`

- [ ] **Step 1: PostService 테스트 작성 (Red)**

`apps/backend/src/community/__tests__/post.service.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from '../post.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('PostService', () => {
  let service: PostService;
  let prisma: jest.Mocked<PrismaService>;

  const mockPrisma = {
    post: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    postLike: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('getAllPosts', () => {
    it('should return paginated posts', async () => {
      const mockPost = {
        id: BigInt(1),
        userId: BigInt(1),
        title: 'Test',
        content: 'Content',
        likes: 0,
        createdAt: new Date(),
        user: { id: BigInt(1), ssoQualifier: 'test@test.com', email: 'test@test.com', badges: null },
        _count: { comments: 0 },
      };
      mockPrisma.post.findMany.mockResolvedValue([mockPost]);
      mockPrisma.post.count.mockResolvedValue(1);
      mockPrisma.postLike.findMany.mockResolvedValue([]);

      const result = await service.getAllPosts(0, 10);

      expect(result.content).toHaveLength(1);
      expect(result.totalElements).toBe(1);
      expect(result.pageNumber).toBe(0);
    });
  });

  describe('getPostById', () => {
    it('should throw NotFoundException for non-existent post', async () => {
      mockPrisma.post.findUnique.mockResolvedValue(null);

      await expect(service.getPostById(BigInt(999))).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createPost', () => {
    it('should create a post', async () => {
      const dto = { title: 'New', content: 'Post' };
      const expected = { id: BigInt(1), userId: BigInt(1), ...dto, likes: 0 };
      mockPrisma.post.create.mockResolvedValue(expected);

      const result = await service.createPost(BigInt(1), dto);

      expect(result).toEqual(expected);
    });
  });

  describe('deletePost', () => {
    it('should throw ForbiddenException for non-owner', async () => {
      mockPrisma.post.findUnique.mockResolvedValue({
        id: BigInt(1),
        userId: BigInt(2),
      });

      await expect(
        service.deletePost(BigInt(1), BigInt(1)),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getUserPosts', () => {
    it('should return user posts', async () => {
      mockPrisma.post.findMany.mockResolvedValue([]);
      mockPrisma.post.count.mockResolvedValue(0);

      const result = await service.getUserPosts(BigInt(1), 0, 10);

      expect(result.content).toEqual([]);
      expect(result.totalElements).toBe(0);
    });
  });
});
```

- [ ] **Step 2: 테스트가 실패하는지 확인**

Run: `cd apps/backend && npx jest --testPathPattern="post.service.spec" --no-coverage`
Expected: FAIL — PostService 모듈을 찾을 수 없음

- [ ] **Step 3: PostService 구현**

`apps/backend/src/community/post.service.ts`:

```typescript
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import type { PageResponse } from '@clover/shared';

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

    return { content, pageNumber: page, pageSize: size, totalElements: total, totalPages: Math.ceil(total / size) };
  }

  async getPostById(postId: bigint, currentUserId?: bigint) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: { id: true, ssoQualifier: true, email: true, badges: true },
        },
      },
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
        include: {
          user: { select: { id: true, ssoQualifier: true, email: true, badges: true } },
          _count: { select: { comments: true } },
        },
      }),
      this.prisma.post.count({ where: { userId } }),
    ]);
    return {
      content: posts.map((p) => this.transformPost(p, false)),
      pageNumber: page, pageSize: size, totalElements: total, totalPages: Math.ceil(total / size),
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

  private async validatePostOwnership(postId: bigint, userId: bigint) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('게시글을 찾을 수 없습니다.');
    if (post.userId !== userId) throw new ForbiddenException('수정 권한이 없습니다.');
    return post;
  }
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd apps/backend && npx jest --testPathPattern="post.service.spec" --no-coverage`
Expected: PASS — 모든 테스트 통과

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/community/post.service.ts apps/backend/src/community/__tests__/post.service.spec.ts
git commit -m "refactor(backend): PostService 추출 + 테스트"
```

---

## Task 2: community.service.ts 분리 — CommentService 추출

**Files:**
- Create: `apps/backend/src/community/comment.service.ts`
- Create: `apps/backend/src/community/__tests__/comment.service.spec.ts`

- [ ] **Step 1: CommentService 테스트 작성 (Red)**

`apps/backend/src/community/__tests__/comment.service.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from '../comment.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('CommentService', () => {
  let service: CommentService;

  const mockPrisma = {
    comment: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    post: { findUnique: jest.fn() },
  };
  const mockPostService = { mapToUserSummary: jest.fn((u) => u ? { id: u.id, nickname: 'test', badges: [] } : null) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: 'PostService', useValue: mockPostService },
      ],
    }).compile();
    service = module.get<CommentService>(CommentService);
    jest.clearAllMocks();
  });

  describe('getCommentsByPostId', () => {
    it('should return paginated comments with replies', async () => {
      mockPrisma.comment.findMany.mockResolvedValue([]);
      mockPrisma.comment.count.mockResolvedValue(0);

      const result = await service.getCommentsByPostId(BigInt(1), 0, 20);

      expect(result.content).toEqual([]);
      expect(result.totalElements).toBe(0);
    });
  });

  describe('createComment', () => {
    it('should throw NotFoundException for non-existent post', async () => {
      mockPrisma.post.findUnique.mockResolvedValue(null);

      await expect(
        service.createComment(BigInt(1), { postId: '999', content: 'test' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create a comment', async () => {
      mockPrisma.post.findUnique.mockResolvedValue({ id: BigInt(1) });
      const expected = { id: BigInt(1), content: 'test' };
      mockPrisma.comment.create.mockResolvedValue(expected);

      const result = await service.createComment(BigInt(1), {
        postId: '1',
        content: 'test',
      });

      expect(result).toEqual(expected);
    });
  });

  describe('updateComment', () => {
    it('should throw ForbiddenException for non-owner', async () => {
      mockPrisma.comment.findUnique.mockResolvedValue({
        id: BigInt(1),
        userId: BigInt(2),
      });

      await expect(
        service.updateComment(BigInt(1), BigInt(1), { content: 'updated' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd apps/backend && npx jest --testPathPattern="comment.service.spec" --no-coverage`
Expected: FAIL

- [ ] **Step 3: CommentService 구현**

`apps/backend/src/community/comment.service.ts`:

```typescript
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PostService } from './post.service';

@Injectable()
export class CommentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly postService: PostService,
  ) {}

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
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd apps/backend && npx jest --testPathPattern="comment.service.spec" --no-coverage`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/backend/src/community/comment.service.ts apps/backend/src/community/__tests__/comment.service.spec.ts
git commit -m "refactor(backend): CommentService 추출 + 테스트"
```

---

## Task 3: community.service.ts 분리 — LikeService + FeedService 추출

**Files:**
- Create: `apps/backend/src/community/like.service.ts`
- Create: `apps/backend/src/community/feed.service.ts`
- Create: `apps/backend/src/community/__tests__/like.service.spec.ts`
- Create: `apps/backend/src/community/__tests__/feed.service.spec.ts`

- [ ] **Step 1: LikeService 테스트 작성 (Red)**

`apps/backend/src/community/__tests__/like.service.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { LikeService } from '../like.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PostService } from '../post.service';

describe('LikeService', () => {
  let service: LikeService;

  const mockPrisma = {
    postLike: { findUnique: jest.fn(), create: jest.fn(), delete: jest.fn() },
    post: { update: jest.fn() },
    $transaction: jest.fn(),
  };
  const mockPostService = { getPostById: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LikeService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: PostService, useValue: mockPostService },
      ],
    }).compile();
    service = module.get<LikeService>(LikeService);
    jest.clearAllMocks();
  });

  describe('likePost', () => {
    it('should unlike when already liked', async () => {
      mockPrisma.postLike.findUnique.mockResolvedValue({ id: BigInt(1) });
      mockPrisma.$transaction.mockResolvedValue(undefined);
      mockPostService.getPostById.mockResolvedValue({ id: BigInt(1) });

      await service.likePost(BigInt(1), BigInt(1));

      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('should like when not yet liked', async () => {
      mockPrisma.postLike.findUnique.mockResolvedValue(null);
      mockPrisma.$transaction.mockResolvedValue(undefined);
      mockPostService.getPostById.mockResolvedValue({ id: BigInt(1) });

      await service.likePost(BigInt(1), BigInt(1));

      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });
  });
});
```

- [ ] **Step 2: FeedService 테스트 작성 (Red)**

`apps/backend/src/community/__tests__/feed.service.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { FeedService } from '../feed.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PostService } from '../post.service';
import { FollowService } from '../../users/follow.service';

describe('FeedService', () => {
  let service: FeedService;

  const mockPrisma = {
    post: { findMany: jest.fn(), count: jest.fn() },
  };
  const mockPostService = {
    getLikedPostIds: jest.fn(),
    transformPost: jest.fn(),
  };
  const mockFollowService = { getFollowingIds: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: PostService, useValue: mockPostService },
        { provide: FollowService, useValue: mockFollowService },
      ],
    }).compile();
    service = module.get<FeedService>(FeedService);
    jest.clearAllMocks();
  });

  describe('getFollowingFeed', () => {
    it('should return empty feed when no following', async () => {
      mockFollowService.getFollowingIds.mockResolvedValue([]);

      const result = await service.getFollowingFeed(BigInt(1), 0, 10);

      expect(result.content).toEqual([]);
      expect(result.totalElements).toBe(0);
    });
  });
});
```

- [ ] **Step 3: LikeService 구현**

`apps/backend/src/community/like.service.ts`:

```typescript
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
        this.prisma.postLike.delete({ where: { postId_userId: { postId, userId } } }),
        this.prisma.post.update({ where: { id: postId }, data: { likes: { decrement: 1 } } }),
      ]);
    } else {
      await this.prisma.$transaction([
        this.prisma.postLike.create({ data: { postId, userId } }),
        this.prisma.post.update({ where: { id: postId }, data: { likes: { increment: 1 } } }),
      ]);
    }

    return this.postService.getPostById(postId, userId);
  }
}
```

- [ ] **Step 4: FeedService 구현**

`apps/backend/src/community/feed.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PostService } from './post.service';
import { FollowService } from '../users/follow.service';

@Injectable()
export class FeedService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly postService: PostService,
    private readonly followService: FollowService,
  ) {}

  async getFollowingFeed(userId: bigint, page: number, size: number) {
    const followingIds = await this.followService.getFollowingIds(userId);
    if (followingIds.length === 0) {
      return { content: [], pageNumber: page, pageSize: size, totalElements: 0, totalPages: 0 };
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
      content: posts.map((p) => this.postService.transformPost(p, likedIds.has(p.id.toString()))),
      pageNumber: page,
      pageSize: size,
      totalElements: total,
      totalPages: Math.ceil(total / size),
    };
  }
}
```

- [ ] **Step 5: 테스트 통과 확인**

Run: `cd apps/backend && npx jest --testPathPattern="(like|feed).service.spec" --no-coverage`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/backend/src/community/like.service.ts apps/backend/src/community/feed.service.ts \
  apps/backend/src/community/__tests__/like.service.spec.ts apps/backend/src/community/__tests__/feed.service.spec.ts
git commit -m "refactor(backend): LikeService + FeedService 추출 + 테스트"
```

---

## Task 4: CommunityModule 업데이트 + 기존 community.service.ts 삭제

**Files:**
- Modify: `apps/backend/src/community/community.module.ts`
- Modify: `apps/backend/src/community/community.controller.ts`
- Delete: `apps/backend/src/community/community.service.ts`

- [ ] **Step 1: CommunityModule에 새 서비스 등록**

`apps/backend/src/community/community.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { CommunityController } from './community.controller';
import { PostService } from './post.service';
import { CommentService } from './comment.service';
import { LikeService } from './like.service';
import { FeedService } from './feed.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [CommunityController],
  providers: [PostService, CommentService, LikeService, FeedService],
  exports: [PostService],
})
export class CommunityModule {}
```

- [ ] **Step 2: CommunityController에서 새 서비스 사용**

`apps/backend/src/community/community.controller.ts`를 수정하여 CommunityService 대신 PostService, CommentService, LikeService, FeedService를 주입:

```typescript
import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, Request, Req, ParseIntPipe,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CommentService } from './comment.service';
import { LikeService } from './like.service';
import { FeedService } from './feed.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('community')
export class CommunityController {
  constructor(
    private readonly postService: PostService,
    private readonly commentService: CommentService,
    private readonly likeService: LikeService,
    private readonly feedService: FeedService,
  ) {}

  @Get('posts')
  async getAllPosts(@Query('page') page = 0, @Query('size') size = 10, @Request() req: any) {
    return this.postService.getAllPosts(+page, +size, req.user?.id);
  }

  @Get('posts/feed')
  @UseGuards(AuthGuard('jwt'))
  async getFeed(
    @Req() req: any,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
  ) {
    return this.feedService.getFollowingFeed(req.user.id, page ?? 0, size ?? 10);
  }

  @Get('posts/:id')
  async getPost(@Param('id') id: string, @Request() req: any) {
    return this.postService.getPostById(BigInt(id), req.user?.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('posts')
  async createPost(@Request() req: any, @Body() dto: CreatePostDto) {
    return this.postService.createPost(req.user.id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('posts/:id')
  async updatePost(@Request() req: any, @Param('id') id: string, @Body() dto: UpdatePostDto) {
    return this.postService.updatePost(BigInt(id), req.user.id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('posts/:id/like')
  async likePost(@Request() req: any, @Param('id') id: string) {
    return this.likeService.likePost(BigInt(id), req.user.id);
  }

  @Get('posts/:id/comments')
  async getComments(@Param('id') id: string, @Query('page') page = 0, @Query('size') size = 20) {
    return this.commentService.getCommentsByPostId(BigInt(id), +page, +size);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('comments')
  async createComment(@Request() req: any, @Body() dto: CreateCommentDto) {
    return this.commentService.createComment(req.user.id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('comments/:id')
  async updateComment(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateCommentDto) {
    return this.commentService.updateComment(BigInt(id), req.user.id, dto);
  }

  @Delete('posts/:id')
  @UseGuards(AuthGuard('jwt'))
  async deletePost(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    await this.postService.deletePost(BigInt(id), req.user.id);
    return { message: 'Post deleted' };
  }

  @Get('users/:userId/posts')
  async getUserPosts(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
  ) {
    return this.postService.getUserPosts(BigInt(userId), page ?? 0, size ?? 10);
  }
}
```

- [ ] **Step 3: 기존 community.service.ts 삭제**

```bash
rm apps/backend/src/community/community.service.ts
```

- [ ] **Step 4: 기존 community.service.spec.ts를 새 서비스에 맞게 삭제**

기존 테스트 파일을 삭제 (새 서비스별 테스트로 대체됨):

```bash
rm apps/backend/src/community/__tests__/community.service.spec.ts
```

- [ ] **Step 5: 전체 테스트 실행**

Run: `cd apps/backend && npm test -- --no-coverage`
Expected: 모든 테스트 통과

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor(backend): community 모듈 4분할 완료 (post/comment/like/feed)"
```

---

## Task 5: winning-check.service.ts 분리 — WinnerNotificationService 추출

**Files:**
- Create: `apps/backend/src/lotto/winner-notification.service.ts`
- Create: `apps/backend/src/lotto/__tests__/winner-notification.service.spec.ts`
- Modify: `apps/backend/src/lotto/winning-check.service.ts`

- [ ] **Step 1: WinnerNotificationService 테스트 작성 (Red)**

`apps/backend/src/lotto/__tests__/winner-notification.service.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { WinnerNotificationService } from '../winner-notification.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadgeService } from '../../users/badge.service';
import { FcmService } from '../../notification/fcm.service';

describe('WinnerNotificationService', () => {
  let service: WinnerNotificationService;

  const mockPrisma = { user: { findUnique: jest.fn() } };
  const mockBadgeService = { updateUserBadges: jest.fn() };
  const mockFcmService = { sendWinningNotification: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WinnerNotificationService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: BadgeService, useValue: mockBadgeService },
        { provide: FcmService, useValue: mockFcmService },
      ],
    }).compile();
    service = module.get<WinnerNotificationService>(WinnerNotificationService);
    jest.clearAllMocks();
  });

  describe('handleWinnerActions', () => {
    it('should update badges and send notification', async () => {
      const ticket = { userId: BigInt(1), games: [] };
      mockBadgeService.updateUserBadges.mockResolvedValue(undefined);
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await service.handleWinnerActions(ticket, {});

      expect(mockBadgeService.updateUserBadges).toHaveBeenCalledWith(BigInt(1));
    });
  });
});
```

- [ ] **Step 2: WinnerNotificationService 구현**

`apps/backend/src/lotto/winner-notification.service.ts`:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BadgeService } from '../users/badge.service';
import { FcmService } from '../notification/fcm.service';
import { LottoRankCalculator } from './utils/lotto-rank.calculator';

@Injectable()
export class WinnerNotificationService {
  private readonly logger = new Logger(WinnerNotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly badgeService: BadgeService,
    private readonly fcmService: FcmService,
  ) {}

  async handleWinnerActions(ticket: any, winningInfo: any) {
    this.badgeService
      .updateUserBadges(ticket.userId)
      .catch((e) => this.logger.error(`뱃지 업데이트 실패: ${ticket.userId}`, e.stack));

    this.notifyWinner(ticket, winningInfo).catch((e) =>
      this.logger.error(`당첨 알림 발송 실패: ${ticket.userId}`, e.stack),
    );
  }

  private async notifyWinner(ticket: any, winningInfo: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: ticket.userId },
      select: { fcmToken: true },
    });
    if (!user?.fcmToken) return;

    const best = this.getBestWinningResult(ticket, winningInfo);
    if (best) {
      const rankName = LottoRankCalculator.getRankName(best.res.status);
      const numbers = [
        best.game.number1, best.game.number2, best.game.number3,
        best.game.number4, best.game.number5, best.game.number6,
      ];
      await this.fcmService.sendWinningNotification(user.fcmToken, rankName, numbers, best.res.prize);
    }
  }

  private getBestWinningResult(ticket: any, winningInfo: any) {
    const prizeAmounts = {
      WINNING_1: winningInfo.firstPrizeAmount,
      WINNING_2: winningInfo.secondPrizeAmount,
      WINNING_3: winningInfo.thirdPrizeAmount,
      WINNING_4: winningInfo.fourthPrizeAmount,
      WINNING_5: winningInfo.fifthPrizeAmount,
    };
    const winNumbers = [
      winningInfo.number1, winningInfo.number2, winningInfo.number3,
      winningInfo.number4, winningInfo.number5, winningInfo.number6,
    ];

    const results = ticket.games
      .map((g: any) => ({
        game: g,
        res: LottoRankCalculator.calculateRank(
          [g.number1, g.number2, g.number3, g.number4, g.number5, g.number6],
          winNumbers, winningInfo.bonusNumber, prizeAmounts,
        ),
      }))
      .filter((r: any) => r.res.prize > BigInt(0))
      .sort((a: any, b: any) => (a.res.status < b.res.status ? -1 : 1));

    return results.length > 0 ? results[0] : null;
  }
}
```

- [ ] **Step 3: winning-check.service.ts에서 알림 로직 제거, WinnerNotificationService 주입**

`apps/backend/src/lotto/winning-check.service.ts`에서:
- `handleWinnerActions`, `notifyWinner`, `getBestWinningResult` 메서드 삭제
- `WinnerNotificationService`를 constructor에 주입
- `updateTicketStatus`에서 `this.winnerNotificationService.handleWinnerActions()` 호출

- [ ] **Step 4: 테스트 실행**

Run: `cd apps/backend && npm test -- --no-coverage`
Expected: PASS

- [ ] **Step 5: 줄수 확인**

`winning-check.service.ts`가 150줄 이하인지 확인.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor(backend): WinnerNotificationService 추출 (winning-check 150줄 이하 달성)"
```

---

## Task 6: 백엔드 전체 커버리지 80%+ 달성

**Files:**
- 모든 `__tests__/*.spec.ts` 파일에 누락된 테스트 케이스 추가

- [ ] **Step 1: 현재 커버리지 측정**

Run: `cd apps/backend && npm run test:cov`
Expected: 커버리지 리포트 출력. 80% 미달 영역 확인.

- [ ] **Step 2: 미달 영역 테스트 보강**

커버리지 리포트에서 80% 미달인 서비스/컨트롤러에 대해 테스트 케이스 추가.
각 서비스의 모든 public 메서드에 대해 최소 happy path + error path 테스트 작성.

- [ ] **Step 3: 커버리지 재측정**

Run: `cd apps/backend && npm run test:cov`
Expected: 전체 커버리지 80%+

- [ ] **Step 4: 커버리지 임계값 설정**

`apps/backend/package.json`의 jest 설정에 추가:

```json
{
  "jest": {
    ...existing config...
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

- [ ] **Step 5: 임계값 적용 확인**

Run: `cd apps/backend && npm run test:cov`
Expected: PASS (80% 이상이므로 통과)

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "test(backend): 커버리지 80%+ 달성 + 임계값 CI 강제"
```

---

## Task 7: 최종 검증 — 모든 파일 150줄 이하

- [ ] **Step 1: 줄수 검사**

Run: `find apps/backend/src -name "*.ts" -not -path "*node_modules*" -not -name "*.spec.ts" -not -name "*.dto.ts" -not -name "*.module.ts" | xargs wc -l | sort -rn | head -20`
Expected: 모든 파일이 150줄 이하

- [ ] **Step 2: 150줄 초과 파일이 있다면 추가 분리**

초과 파일 발견 시 같은 TDD 패턴으로 분리: 테스트 작성 → 실패 확인 → 구현 → 통과 확인 → 커밋

- [ ] **Step 3: 전체 빌드 + 테스트 확인**

Run: `cd apps/backend && npm run build && npm run test:cov`
Expected: 빌드 성공, 커버리지 80%+

- [ ] **Step 4: 최종 커밋**

```bash
git add -A
git commit -m "refactor(backend): Stream 2 완료 — 모든 파일 ≤150줄, 커버리지 80%+"
```
