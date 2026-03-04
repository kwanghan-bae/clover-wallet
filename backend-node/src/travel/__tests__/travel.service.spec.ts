import { Test, TestingModule } from '@nestjs/testing';
import { TravelService } from '../travel.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

/**
 * TravelService에 대한 단위 테스트입니다.
 * 로또 판매점 주변 여행 정보 조회, 추천 및 테마별 검색 기능을 검증합니다.
 */
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

  describe('getAllTravelPlans', () => {
    it('모든 여행 플랜 목록을 최신순으로 반환해야 한다', async () => {
      const mockPlans = [{ id: BigInt(1) }];
      (prisma.travelPlan.findMany as jest.Mock).mockResolvedValue(mockPlans);

      const result = await service.getAllTravelPlans();

      expect(result).toEqual(mockPlans);
      expect(prisma.travelPlan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        }),
      );
    });
  });

  describe('getRecommendedTravelPlans', () => {
    it('사용자 추천 플랜 조회 시 빈 배열을 반환해야 한다 (사양 준수)', () => {
      const result = service.getRecommendedTravelPlans(BigInt(1));
      expect(result).toEqual([]);
    });
  });

  describe('getTravelPlansBySpot', () => {
    it('특정 판매점 ID에 속한 플랜 목록을 반환해야 한다', async () => {
      const spotId = BigInt(10);
      const mockPlans = [{ id: BigInt(1), spotId }];
      (prisma.travelPlan.findMany as jest.Mock).mockResolvedValue(mockPlans);

      const result = await service.getTravelPlansBySpot(spotId);

      expect(result).toEqual(mockPlans);
      expect(prisma.travelPlan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { spotId },
        }),
      );
    });
  });

  describe('getTravelPlansByTheme', () => {
    it('특정 테마에 속한 플랜 목록을 반환해야 한다', async () => {
      const theme = '바다';
      const mockPlans = [{ id: BigInt(1), theme }];
      (prisma.travelPlan.findMany as jest.Mock).mockResolvedValue(mockPlans);

      const result = await service.getTravelPlansByTheme(theme);

      expect(result).toEqual(mockPlans);
      expect(prisma.travelPlan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { theme },
        }),
      );
    });
  });

  describe('getTravelPlanById', () => {
    it('ID로 플랜을 성공적으로 조회해야 한다', async () => {
      const mockPlan = { id: BigInt(1), title: '여행지' };
      (prisma.travelPlan.findUnique as jest.Mock).mockResolvedValue(mockPlan);

      const result = await service.getTravelPlanById(BigInt(1));

      expect(result).toEqual(mockPlan);
    });

    it('존재하지 않는 ID인 경우 NotFoundException을 던져야 한다', async () => {
      (prisma.travelPlan.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.getTravelPlanById(BigInt(999))).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
