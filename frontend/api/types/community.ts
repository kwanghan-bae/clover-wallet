import { UserSummary } from './user';

export interface Post {
  id: number;
  user: UserSummary;
  content: string;
  viewCount: number;
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostRequest {
  content: string;
}
