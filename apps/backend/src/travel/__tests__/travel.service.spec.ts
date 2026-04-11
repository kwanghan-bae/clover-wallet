import { Test, TestingModule } from '@nestjs/testing';
import { TravelService } from '../travel.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('TravelService', () => {
  let service: TravelService;

  const mockPrisma = {
    travelPlan: { findMany: jest.fn(), findUnique: jest.fn() },
    lottoSpot: { findMany: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TravelService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<TravelService>(TravelService);
    jest.clearAllMocks();
  });

  describe('getRecommendedTravelPlans', () => {
    it('should return plans near given coordinates', async () => {
      mockPrisma.lottoSpot.findMany.mockResolvedValue([
        { id: BigInt(1), latitude: 37.5, longitude: 127.0, name: 'Spot A' },
      ]);
      mockPrisma.travelPlan.findMany.mockResolvedValue([
        { id: BigInt(1), spotId: BigInt(1), title: 'Plan A', spot: { name: 'Spot A' } },
      ]);
      const result = await service.getRecommendedTravelPlans(37.5665, 126.978);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Plan A');
    });

    it('should return empty array when no spots nearby', async () => {
      mockPrisma.lottoSpot.findMany.mockResolvedValue([]);
      const result = await service.getRecommendedTravelPlans(0, 0);
      expect(result).toHaveLength(0);
    });

    it('should return empty array when no coordinates', async () => {
      const result = await service.getRecommendedTravelPlans();
      expect(result).toHaveLength(0);
    });
  });
});
