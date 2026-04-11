/* eslint-disable import/first */
jest.mock('../../api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

import { communityApi } from '../../api/community';
import { apiClient } from '../../api/client';

describe('communityApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPosts', () => {
    it('fetches posts with default pagination', async () => {
      const mockJson = jest.fn().mockResolvedValue({ content: [], totalElements: 0 });
      (apiClient.get as jest.Mock).mockReturnValue({ json: mockJson });

      await communityApi.getPosts();

      expect(apiClient.get).toHaveBeenCalledWith('community/posts?page=0&size=10');
    });

    it('fetches posts with custom pagination', async () => {
      const mockJson = jest.fn().mockResolvedValue({ content: [], totalElements: 0 });
      (apiClient.get as jest.Mock).mockReturnValue({ json: mockJson });

      await communityApi.getPosts(2, 5);

      expect(apiClient.get).toHaveBeenCalledWith('community/posts?page=2&size=5');
    });
  });

  describe('getFeed', () => {
    it('fetches feed posts', async () => {
      const mockJson = jest.fn().mockResolvedValue({ content: [], totalElements: 0 });
      (apiClient.get as jest.Mock).mockReturnValue({ json: mockJson });

      await communityApi.getFeed(0, 10);

      expect(apiClient.get).toHaveBeenCalledWith('community/posts/feed?page=0&size=10');
    });
  });

  describe('getPostById', () => {
    it('fetches a post by ID', async () => {
      const mockPost = { id: 1, title: '제목', content: '내용', likes: 5, isLiked: false, createdAt: '2024-01-01', userSummary: { id: 1, nickname: '유저', badges: [] } };
      const mockJson = jest.fn().mockResolvedValue(mockPost);
      (apiClient.get as jest.Mock).mockReturnValue({ json: mockJson });

      const result = await communityApi.getPostById(1);

      expect(apiClient.get).toHaveBeenCalledWith('community/posts/1');
      expect(result.title).toBe('제목');
    });
  });

  describe('createPost', () => {
    it('creates a post with title and content', async () => {
      const mockPost = { id: 2, title: '새 글', content: '새 내용', likes: 0, isLiked: false, createdAt: '2024-01-01', userSummary: { id: 1, nickname: '유저', badges: [] } };
      const mockJson = jest.fn().mockResolvedValue(mockPost);
      (apiClient.post as jest.Mock).mockReturnValue({ json: mockJson });

      const result = await communityApi.createPost('새 글', '새 내용');

      expect(apiClient.post).toHaveBeenCalledWith('community/posts', {
        json: { title: '새 글', content: '새 내용' },
      });
      expect(result.id).toBe(2);
    });
  });

  describe('deletePost', () => {
    it('deletes a post by ID', async () => {
      (apiClient.delete as jest.Mock).mockReturnValue({});

      await communityApi.deletePost(3);

      expect(apiClient.delete).toHaveBeenCalledWith('community/posts/3');
    });
  });

  describe('likePost', () => {
    it('toggles like on a post', async () => {
      const mockJson = jest.fn().mockResolvedValue({ liked: true, likes: 6 });
      (apiClient.post as jest.Mock).mockReturnValue({ json: mockJson });

      const result = await communityApi.likePost(1);

      expect(apiClient.post).toHaveBeenCalledWith('community/posts/1/like');
      expect(result.liked).toBe(true);
    });
  });

  describe('getComments', () => {
    it('fetches comments for a post', async () => {
      const mockJson = jest.fn().mockResolvedValue({ content: [] });
      (apiClient.get as jest.Mock).mockReturnValue({ json: mockJson });

      await communityApi.getComments(1);

      expect(apiClient.get).toHaveBeenCalledWith('community/posts/1/comments?page=0&size=20');
    });
  });

  describe('createComment', () => {
    it('creates a comment without parentId', async () => {
      const mockJson = jest.fn().mockResolvedValue({ id: 10 });
      (apiClient.post as jest.Mock).mockReturnValue({ json: mockJson });

      await communityApi.createComment(1, '댓글 내용');

      expect(apiClient.post).toHaveBeenCalledWith('community/comments', {
        json: { postId: 1, content: '댓글 내용', parentId: undefined },
      });
    });

    it('creates a reply with parentId', async () => {
      const mockJson = jest.fn().mockResolvedValue({ id: 11 });
      (apiClient.post as jest.Mock).mockReturnValue({ json: mockJson });

      await communityApi.createComment(1, '답글', 10);

      expect(apiClient.post).toHaveBeenCalledWith('community/comments', {
        json: { postId: 1, content: '답글', parentId: 10 },
      });
    });
  });
});
