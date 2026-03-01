import { Test, TestingModule } from '@nestjs/testing';
import { TravelService } from '../travel.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('TravelService', () => {
  let service: TravelService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TravelService,
        {
          provide: PrismaService,
          useValue: {
            travelPlan: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TravelService>(TravelService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllTravelPlans', () => {
    it('should return all plans', async () => {
      (prisma.travelPlan.findMany as jest.Mock).mockResolvedValue([{ id: BigInt(1) }]);
      const result = await service.getAllTravelPlans();
      expect(result).toHaveLength(1);
    });
  });

  describe('getTravelPlanById', () => {
    it('should return a plan if found', async () => {
      const mockPlan = { id: BigInt(1), title: 'Test Plan' };
      (prisma.travelPlan.findUnique as jest.Mock).mockResolvedValue(mockPlan);

      const result = await service.getTravelPlanById(BigInt(1));
      expect(result).toEqual(mockPlan);
    });

    it('should throw NotFoundException if not found', async () => {
      (prisma.travelPlan.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.getTravelPlanById(BigInt(1))).rejects.toThrow(NotFoundException);
    });
  });
});
