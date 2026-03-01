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
   * 사용자 맞춤형 여행 플랜 추천 (현재는 빈 목록 반환 - Kotlin 사양)
   * @param userId 사용자 ID
   */
  async getRecommendedTravelPlans(userId: bigint) {
    // Kotlin DefaultTravelRecommendationService 로직 이식
    return [];
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
