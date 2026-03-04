import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SaveGameDto } from './dto/save-game.dto';
import { PageResponse } from '../common/types/page-response';
import { BadgeService } from '../users/badge.service';

/**
 * 로또 관련 비즈니스 로직을 처리하는 서비스입니다.
 * 게임 저장, 내역 조회, 통계 계산 등을 담당합니다.
 */
@Injectable()
export class LottoService {
  /**
   * LottoService 생성자
   * @param prisma 데이터베이스 접근을 위한 PrismaService
   * @param badgeService 뱃지 부여를 위한 BadgeService
   */
  constructor(
    private prisma: PrismaService,
    private badgeService: BadgeService,
  ) {}

  /**
   * 사용자의 로또 게임 번호를 저장합니다.
   * @param userId 사용자 ID
   * @param dto 저장할 게임 정보
   */
  async saveGame(userId: string, dto: SaveGameDto) {
    const game = await this.prisma.lottoGame.create({
      data: {
        userId,
        number1: dto.numbers[0],
        number2: dto.numbers[1],
        number3: dto.numbers[2],
        number4: dto.numbers[3],
        number5: dto.numbers[4],
        number6: dto.numbers[5],
        extractionMethod: dto.extractionMethod,
      },
    });

    // 번호 생성 뱃지 체크
    await this.badgeService.updateUserBadges(userId);

    return game;
  }

  /**
   * 사용자의 로또 게임 내역을 페이징하여 조회합니다.
   * @param userId 사용자 ID
   * @param page 페이지 번호
   * @param limit 페이지당 항목 수
   */
  async getHistory(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PageResponse<any>> {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.lottoGame.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.lottoGame.count({ where: { userId } }),
    ]);

    return {
      items,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  /**
   * 사용자의 로또 당첨 통계를 계산합니다.
   * @param userId 사용자 ID
   */
  async getStatistics(userId: string) {
    const games = await this.prisma.lottoGame.findMany({
      where: { userId },
      select: { status: true },
    });

    const stats = {
      total: games.length,
      winCount: games.filter((g) => g.status.startsWith('WINNING')).length,
      loseCount: games.filter((g) => g.status === 'LOSING').length,
    };

    return stats;
  }
}
