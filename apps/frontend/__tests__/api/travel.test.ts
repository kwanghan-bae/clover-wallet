/* eslint-disable import/first */
jest.mock('../../api/client', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

import { travelApi } from '../../api/travel';
import { apiClient } from '../../api/client';

describe('travelApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBySpot', () => {
    it('fetches travel plans for a spot', async () => {
      const mockPlans = [
        { id: 1, title: '강남 여행', description: '설명', places: '장소', theme: '관광', estimatedHours: 3, spot: { id: 10, name: '강남 복권방' } },
      ];
      const mockJson = jest.fn().mockResolvedValue(mockPlans);
      (apiClient.get as jest.Mock).mockReturnValue({ json: mockJson });

      const result = await travelApi.getBySpot(10);

      expect(apiClient.get).toHaveBeenCalledWith('travel-plans/spot/10');
      expect(result).toEqual(mockPlans);
    });
  });

  describe('getById', () => {
    it('fetches a travel plan by ID', async () => {
      const mockPlan = {
        id: 5, title: '명동 여행', description: '설명', places: '장소', theme: '쇼핑', estimatedHours: 4, spot: { id: 20, name: '명동 복권방' },
      };
      const mockJson = jest.fn().mockResolvedValue(mockPlan);
      (apiClient.get as jest.Mock).mockReturnValue({ json: mockJson });

      const result = await travelApi.getById(5);

      expect(apiClient.get).toHaveBeenCalledWith('travel-plans/5');
      expect(result.title).toBe('명동 여행');
    });
  });

  describe('getRecommended', () => {
    it('fetches recommended plans by coordinates', async () => {
      const mockPlans = [{ id: 2, title: '근처 여행', description: '', places: '', theme: '', estimatedHours: 2, spot: { id: 30, name: '근처 복권방' } }];
      const mockJson = jest.fn().mockResolvedValue(mockPlans);
      (apiClient.get as jest.Mock).mockReturnValue({ json: mockJson });

      const result = await travelApi.getRecommended(37.5665, 126.978);

      expect(apiClient.get).toHaveBeenCalledWith(
        'travel-plans/recommended?latitude=37.5665&longitude=126.978'
      );
      expect(result).toEqual(mockPlans);
    });
  });
});
