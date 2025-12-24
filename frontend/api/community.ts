import { apiClient } from './client';
import { Post, CreatePostRequest } from './types/community';

export const communityApi = {
  getPosts: async (page = 0, size = 20): Promise<Post[]> => {
    return await apiClient.get('community/posts', {
      searchParams: { page, size }
    }).json();
  },
  
  createPost: async (data: CreatePostRequest): Promise<Post> => {
    return await apiClient.post('community/posts', {
      json: data
    }).json();
  }
};
