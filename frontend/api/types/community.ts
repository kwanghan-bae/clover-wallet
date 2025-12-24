export interface Post {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  authorNickname: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  badges?: string[];
}

export interface CreatePostRequest {
  title: string;
  content: string;
}
