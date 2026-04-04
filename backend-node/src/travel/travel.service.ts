import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * 로또 명당 주변 여행 계획 정보를 관리하는 서비스입니다.
 * Kotlin TravelPlanService 로직을 이식함.
 */
@Injectable()
export class TravelService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 모든 여행 플랜을 조회합니다.
   */
  async getAllTravelPlans() {
    return this.prisma.travelPlan.findMany({
      include: { spot: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 위치 기반 10km 반경 내 명당과 연결된 여행 플랜을 추천합니다.
   * @param latitude 위도
   * @param longitude 경도
   */
  async getRecommendedTravelPlans(latitude?: number, longitude?: number) {
    if (!latitude || !longitude) return [];

    const deltaLat = 0.09; // ~10km
    const deltaLng = 0.11; // ~10km at 37°N
    const nearbySpots = await this.prisma.lottoSpot.findMany({
      where: {
        latitude: { gte: latitude - deltaLat, lte: latitude + deltaLat },
        longitude: { gte: longitude - deltaLng, lte: longitude + deltaLng },
      },
      select: { id: true },
    });

    if (nearbySpots.length === 0) return [];

    const spotIds = nearbySpots.map((s) => s.id);
    return this.prisma.travelPlan.findMany({
      where: { spotId: { in: spotIds } },
      include: { spot: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  /**
   * 특정 판매점 주변의 여행 플랜을 조회합니다.
   * @param spotId 판매점 ID
   */
  async getTravelPlansBySpot(spotId: bigint) {
    return this.prisma.travelPlan.findMany({
      where: { spotId },
      include: { spot: true },
    });
  }

  /**
   * 특정 테마의 여행 플랜을 조회합니다.
   * @param theme 테마 이름
   */
  async getTravelPlansByTheme(theme: string) {
    return this.prisma.travelPlan.findMany({
      where: { theme },
      include: { spot: true },
    });
  }

  /**
   * ID로 여행 플랜 상세 정보를 조회합니다.
   * @param id 플랜 ID
   */
  async getTravelPlanById(id: bigint) {
    const plan = await this.prisma.travelPlan.findUnique({
      where: { id },
      include: { spot: true },
    });

    if (!plan) {
      throw new NotFoundException(`여행 플랜을 찾을 수 없습니다: ${id}`);
    }

    return plan;
  }
}
