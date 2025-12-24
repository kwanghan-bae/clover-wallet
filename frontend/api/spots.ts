import { apiClient } from './client';
import { LottoSpot } from './types/spots';

export const spotsApi = {
  getSpots: async (page = 0, size = 100): Promise<LottoSpot[]> => {
    // Backend expected to support pagination or radius search
    return await apiClient.get('lotto-spots', {
      searchParams: { page, size }
    }).json();
  },
  
  searchSpots: async (query: string): Promise<LottoSpot[]> => {
    return await apiClient.get('lotto-spots/search', {
      searchParams: { name: query }
    }).json();
  }
};
