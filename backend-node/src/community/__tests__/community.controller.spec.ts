import { Test, TestingModule } from '@nestjs/testing';
import { CommunityController } from '../community.controller';
import { CommunityService } from '../community.service';
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
  let service: CommunityService;

  const mockCommunityService = {
    getAllPosts: jest.fn(),
    getPostById: jest.fn(),
    createPost: jest.fn(),
    updatePost: jest.fn(),
    likePost: jest.fn(),
    getCommentsByPostId: jest.fn(),
    createComment: jest.fn(),
    updateComment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommunityController],
      providers: [
        {
          provide: CommunityService,
          useValue: mockCommunityService,
        },
      ],
    }).compile();

    controller = module.get<CommunityController>(CommunityController);
    service = module.get<CommunityService>(CommunityService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllPosts', () => {
    it('should call service.getAllPosts', async () => {
      const req = { user: { id: 'user-id' } };
      await controller.getAllPosts(0, 10, req);
      expect(service.getAllPosts).toHaveBeenCalledWith(0, 10, 'user-id');
    });

    it('should handle undefined user', async () => {
      const req = {};
      await controller.getAllPosts(1, 20, req);
      expect(service.getAllPosts).toHaveBeenCalledWith(1, 20, undefined);
    });
  });

  describe('getPost', () => {
    it('should call service.getPostById', async () => {
      const req = { user: { id: 'user-id' } };
      await controller.getPost('1', req);
      expect(service.getPostById).toHaveBeenCalledWith(BigInt(1), 'user-id');
    });
  });

  describe('createPost', () => {
    it('should call service.createPost', async () => {
      const req = { user: { id: 'user-id' } };
      const dto: CreatePostDto = { title: 'title', content: 'content' };
      await controller.createPost(req, dto);
      expect(service.createPost).toHaveBeenCalledWith('user-id', dto);
    });
  });

  describe('updatePost', () => {
    it('should call service.updatePost', async () => {
      const req = { user: { id: 'user-id' } };
      const dto: UpdatePostDto = { title: 'updated', content: 'updated' };
      await controller.updatePost(req, '1', dto);
      expect(service.updatePost).toHaveBeenCalledWith(
        BigInt(1),
        'user-id',
        dto,
      );
    });
  });

  describe('likePost', () => {
    it('should call service.likePost', async () => {
      const req = { user: { id: 'user-id' } };
      await controller.likePost(req, '1');
      expect(service.likePost).toHaveBeenCalledWith(BigInt(1), 'user-id');
    });
  });

  describe('getComments', () => {
    it('should call service.getCommentsByPostId', async () => {
      await controller.getComments('1', 0, 20);
      expect(service.getCommentsByPostId).toHaveBeenCalledWith(
        BigInt(1),
        0,
        20,
      );
    });
  });

  describe('createComment', () => {
    it('should call service.createComment', async () => {
      const req = { user: { id: 'user-id' } };
      const dto: CreateCommentDto = { postId: '1', content: 'comment' };
      await controller.createComment(req, dto);
      expect(service.createComment).toHaveBeenCalledWith('user-id', dto);
    });
  });

  describe('updateComment', () => {
    it('should call service.updateComment', async () => {
      const req = { user: { id: 'user-id' } };
      const dto: UpdateCommentDto = { content: 'updated comment' };
      await controller.updateComment(req, '1', dto);
      expect(service.updateComment).toHaveBeenCalledWith(
        BigInt(1),
        'user-id',
        dto,
      );
    });
  });
});
