import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TravelService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllTravelPlans() {
    return this.prisma.travelPlan.findMany({
      include: { spot: true },
      orderBy: { createdAt: 'desc' },
    });
  }

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

  async getTravelPlansBySpot(spotId: bigint) {
    return this.prisma.travelPlan.findMany({
      where: { spotId },
      include: { spot: true },
    });
  }

  async getTravelPlansByTheme(theme: string) {
    return this.prisma.travelPlan.findMany({
      where: { theme },
      include: { spot: true },
    });
  }

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
