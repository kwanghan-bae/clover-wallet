import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PageResponse } from '../common/types/page-response';

@Injectable()
export class LottoSpotService {
  constructor(private prisma: PrismaService) {}

  async getAllLottoSpots(
    page: number,
    size: number,
  ): Promise<PageResponse<any>> {
    const skip = page * size;
    const [spots, total] = await Promise.all([
      this.prisma.lottoSpot.findMany({
        skip,
        take: size,
        orderBy: { id: 'desc' },
      }),
      this.prisma.lottoSpot.count(),
    ]);

    return {
      content: spots,
      pageNumber: page,
      pageSize: size,
      totalElements: total,
      totalPages: Math.ceil(total / size),
    };
  }

  async searchByName(name: string): Promise<any[]> {
    return this.prisma.lottoSpot.findMany({
      where: {
        name: { contains: name.toString() },
      },
    });
  }

  async getSpotById(spotId: bigint | number) {
    return this.prisma.lottoSpot.findUnique({
      where: { id: BigInt(spotId) },
    });
  }
}
