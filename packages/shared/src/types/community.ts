import type { UserSummary } from './user.js';

export interface Post {
  id: bigint;
  userId: bigint;
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
  id: bigint;
  postId: bigint;
  userId: bigint;
  content: string;
  likes: number;
  parentId?: bigint;
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
  postId: string;
  content: string;
  parentId?: string;
}
