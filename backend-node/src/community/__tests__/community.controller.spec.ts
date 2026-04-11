import { Test, TestingModule } from '@nestjs/testing';
import { CommunityController } from '../community.controller';
import { PostService } from '../post.service';
import { CommentService } from '../comment.service';
import { LikeService } from '../like.service';
import { FeedService } from '../feed.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';

/**
 * CommunityController에 대한 단위 테스트입니다.
 * 커뮤니티 API 엔드포인트의 요청 전달 및 서비스 호출 로직을 검증합니다.
 */
describe('CommunityController', () => {
  let controller: CommunityController;
  let postService: PostService;
  let commentService: CommentService;
  let likeService: LikeService;
  let feedService: FeedService;

  const mockPostService = {
    getAllPosts: jest.fn(),
    getPostById: jest.fn(),
    createPost: jest.fn(),
    updatePost: jest.fn(),
    deletePost: jest.fn(),
    getUserPosts: jest.fn(),
  };

  const mockCommentService = {
    getCommentsByPostId: jest.fn(),
    createComment: jest.fn(),
    updateComment: jest.fn(),
  };

  const mockLikeService = {
    likePost: jest.fn(),
  };

  const mockFeedService = {
    getFollowingFeed: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommunityController],
      providers: [
        { provide: PostService, useValue: mockPostService },
        { provide: CommentService, useValue: mockCommentService },
        { provide: LikeService, useValue: mockLikeService },
        { provide: FeedService, useValue: mockFeedService },
      ],
    }).compile();

    controller = module.get<CommunityController>(CommunityController);
    postService = module.get<PostService>(PostService);
    commentService = module.get<CommentService>(CommentService);
    likeService = module.get<LikeService>(LikeService);
    feedService = module.get<FeedService>(FeedService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllPosts', () => {
    it('should call postService.getAllPosts', async () => {
      const req = { user: { id: 'user-id' } };
      await controller.getAllPosts(0, 10, req);
      expect(postService.getAllPosts).toHaveBeenCalledWith(0, 10, 'user-id');
    });

    it('should handle undefined user', async () => {
      const req = {};
      await controller.getAllPosts(1, 20, req);
      expect(postService.getAllPosts).toHaveBeenCalledWith(1, 20, undefined);
    });
  });

  describe('getPost', () => {
    it('should call postService.getPostById', async () => {
      const req = { user: { id: 'user-id' } };
      await controller.getPost('1', req);
      expect(postService.getPostById).toHaveBeenCalledWith(
        BigInt(1),
        'user-id',
      );
    });
  });

  describe('createPost', () => {
    it('should call postService.createPost', async () => {
      const req = { user: { id: 'user-id' } };
      const dto: CreatePostDto = { title: 'title', content: 'content' };
      await controller.createPost(req, dto);
      expect(postService.createPost).toHaveBeenCalledWith('user-id', dto);
    });
  });

  describe('updatePost', () => {
    it('should call postService.updatePost', async () => {
      const req = { user: { id: 'user-id' } };
      const dto: UpdatePostDto = { title: 'updated', content: 'updated' };
      await controller.updatePost(req, '1', dto);
      expect(postService.updatePost).toHaveBeenCalledWith(
        BigInt(1),
        'user-id',
        dto,
      );
    });
  });

  describe('likePost', () => {
    it('should call likeService.likePost', async () => {
      const req = { user: { id: 'user-id' } };
      await controller.likePost(req, '1');
      expect(likeService.likePost).toHaveBeenCalledWith(
        BigInt(1),
        'user-id',
      );
    });
  });

  describe('getComments', () => {
    it('should call commentService.getCommentsByPostId', async () => {
      await controller.getComments('1', 0, 20);
      expect(commentService.getCommentsByPostId).toHaveBeenCalledWith(
        BigInt(1),
        0,
        20,
      );
    });
  });

  describe('createComment', () => {
    it('should call commentService.createComment', async () => {
      const req = { user: { id: 'user-id' } };
      const dto: CreateCommentDto = { postId: '1', content: 'comment' };
      await controller.createComment(req, dto);
      expect(commentService.createComment).toHaveBeenCalledWith(
        'user-id',
        dto,
      );
    });
  });

  describe('updateComment', () => {
    it('should call commentService.updateComment', async () => {
      const req = { user: { id: 'user-id' } };
      const dto: UpdateCommentDto = { content: 'updated comment' };
      await controller.updateComment(req, '1', dto);
      expect(commentService.updateComment).toHaveBeenCalledWith(
        BigInt(1),
        'user-id',
        dto,
      );
    });
  });

  describe('getFeed', () => {
    it('should call feedService.getFollowingFeed', async () => {
      const req = { user: { id: BigInt(1) } };
      await controller.getFeed(req, 0, 10);
      expect(feedService.getFollowingFeed).toHaveBeenCalledWith(
        BigInt(1),
        0,
        10,
      );
    });

    it('should use defaults when page/size are undefined', async () => {
      const req = { user: { id: BigInt(1) } };
      await controller.getFeed(req, undefined, undefined);
      expect(feedService.getFollowingFeed).toHaveBeenCalledWith(
        BigInt(1),
        0,
        10,
      );
    });
  });

  describe('deletePost', () => {
    it('should call postService.deletePost', async () => {
      mockPostService.deletePost.mockResolvedValue(undefined);
      const req = { user: { id: BigInt(1) } };
      const result = await controller.deletePost(1, req);
      expect(postService.deletePost).toHaveBeenCalledWith(
        BigInt(1),
        BigInt(1),
      );
      expect(result).toEqual({ message: 'Post deleted' });
    });
  });

  describe('getUserPosts', () => {
    it('should call postService.getUserPosts', async () => {
      await controller.getUserPosts(10, 0, 10);
      expect(postService.getUserPosts).toHaveBeenCalledWith(
        BigInt(10),
        0,
        10,
      );
    });

    it('should use defaults when page/size are undefined', async () => {
      await controller.getUserPosts(10, undefined, undefined);
      expect(postService.getUserPosts).toHaveBeenCalledWith(
        BigInt(10),
        0,
        10,
      );
    });
  });
});
