import { apiClient } from './client';

export interface TravelPlan {
  id: number;
  title: string;
  description: string;
  places: string;
  theme: string;
  estimatedHours: number;
  spot: { id: number; name: string };
}

export const travelApi = {
  getBySpot: (spotId: number) =>
    apiClient.get(`travel-plans/spot/${spotId}`).json<TravelPlan[]>(),

  getById: (id: number) =>
    apiClient.get(`travel-plans/${id}`).json<TravelPlan>(),

  getRecommended: (latitude: number, longitude: number) =>
    apiClient.get(`travel-plans/recommended?latitude=${latitude}&longitude=${longitude}`).json<TravelPlan[]>(),
};
