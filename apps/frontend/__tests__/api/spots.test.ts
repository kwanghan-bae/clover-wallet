/* eslint-disable import/first */
jest.mock('../../api/client', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

import { spotsApi } from '../../api/spots';
import { apiClient } from '../../api/client';

describe('spotsApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSpots', () => {
    it('fetches spots with default pagination', async () => {
      const mockSpots = [{ id: 1, name: '행운 복권방', address: '서울' }];
      const mockJson = jest.fn().mockResolvedValue(mockSpots);
      (apiClient.get as jest.Mock).mockReturnValue({ json: mockJson });

      const result = await spotsApi.getSpots();

      expect(apiClient.get).toHaveBeenCalledWith('lotto-spots', {
        searchParams: { page: 0, size: 100 },
      });
      expect(result).toEqual(mockSpots);
    });

    it('fetches spots with custom pagination', async () => {
      const mockJson = jest.fn().mockResolvedValue([]);
      (apiClient.get as jest.Mock).mockReturnValue({ json: mockJson });

      await spotsApi.getSpots(1, 50);

      expect(apiClient.get).toHaveBeenCalledWith('lotto-spots', {
        searchParams: { page: 1, size: 50 },
      });
    });
  });

  describe('searchSpots', () => {
    it('searches spots by name query', async () => {
      const mockSpots = [{ id: 2, name: '강남 복권방', address: '서울 강남구' }];
      const mockJson = jest.fn().mockResolvedValue(mockSpots);
      (apiClient.get as jest.Mock).mockReturnValue({ json: mockJson });

      const result = await spotsApi.searchSpots('강남');

      expect(apiClient.get).toHaveBeenCalledWith('lotto-spots/search', {
        searchParams: { name: '강남' },
      });
      expect(result).toEqual(mockSpots);
    });
  });

  describe('getSpotHistory', () => {
    it('fetches spot winning history by ID', async () => {
      const mockHistory = [{ id: 1, round: 1000, rank: 1 }];
      const mockJson = jest.fn().mockResolvedValue(mockHistory);
      (apiClient.get as jest.Mock).mockReturnValue({ json: mockJson });

      const result = await spotsApi.getSpotHistory(5);

      expect(apiClient.get).toHaveBeenCalledWith('lotto-spots/5/history');
      expect(result).toEqual(mockHistory);
    });
  });
});
