import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PageResponse } from '../common/types/page-response';

/**
 * 로또 판매점 정보 조회 및 검색을 담당하는 서비스입니다.
 */
@Injectable()
export class LottoSpotService {
  /**
   * Prisma 서비스를 주입받습니다.
   * @param prisma 데이터베이스 접근 서비스
   */
  constructor(private prisma: PrismaService) {}

  /**
   * 모든 로또 판매점 목록을 페이징하여 조회합니다.
   * @param page 페이지 번호 (0부터 시작)
   * @param size 페이지당 항목 수
   */
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

  /**
   * 판매점 이름을 기준으로 로또 판매점을 검색합니다.
   * @param name 검색할 판매점 이름
   */
  async searchByName(name: string): Promise<any[]> {
    return this.prisma.lottoSpot.findMany({
      where: {
        name: { contains: name.toString() },
      },
    });
  }

  /**
   * 특정 ID를 가진 로또 판매점 상세 정보를 조회합니다.
   * @param spotId 판매점 ID (BigInt 또는 number)
   */
  async getSpotById(spotId: bigint | number) {
    return this.prisma.lottoSpot.findUnique({
      where: { id: BigInt(spotId) },
    });
  }
}
