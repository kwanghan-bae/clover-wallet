import type { UserSummary } from './user.js';

export interface Post {
  id: number;
  userId: number;
  title: string;
  content: string;
  likes: number;
  isLiked: boolean;
  userSummary: UserSummary | null;
  commentCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Comment {
  id: number;
  postId: number;
  userId: number;
  content: string;
  likes: number;
  parentId?: number;
  userSummary: UserSummary | null;
  replies?: Comment[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
}

export interface CreateCommentRequest {
  postId: number;
  content: string;
  parentId?: number;
}
