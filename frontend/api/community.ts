import { apiClient } from './client';

export interface Post {
  id: number;
  title: string;
  content: string;
  likes: number;
  isLiked: boolean;
  createdAt: string;
  userSummary: { id: number; nickname: string; badges: string[] };
  _count?: { comments: number };
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export const communityApi = {
  getPosts: (page = 0, size = 10) =>
    apiClient.get(`community/posts?page=${page}&size=${size}`).json<PageResponse<Post>>(),

  getFeed: (page = 0, size = 10) =>
    apiClient.get(`community/posts/feed?page=${page}&size=${size}`).json<PageResponse<Post>>(),

  getPostById: (id: number) =>
    apiClient.get(`community/posts/${id}`).json<Post>(),

  createPost: (title: string, content: string) =>
    apiClient.post('community/posts', { json: { title, content } }).json<Post>(),

  deletePost: (id: number) =>
    apiClient.delete(`community/posts/${id}`),

  likePost: (id: number) =>
    apiClient.post(`community/posts/${id}/like`).json<{ liked: boolean; likes: number }>(),

  getComments: (postId: number, page = 0, size = 20) =>
    apiClient.get(`community/posts/${postId}/comments?page=${page}&size=${size}`).json(),

  createComment: (postId: number, content: string, parentId?: number) =>
    apiClient.post('community/comments', { json: { postId, content, parentId } }).json(),
};
