import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, LottoGame } from '@prisma/client';
import { SaveGameDto } from './dto/save-game.dto';
import { PageResponse } from '../common/types/page-response';
import { BadgeService } from '../users/badge.service';


@Injectable()
export class LottoService {
  
  constructor(
    private prisma: PrismaService,
    private badgeService: BadgeService,
  ) {}


  async saveGame(userId: string, dto: SaveGameDto): Promise<LottoGame> {
    const userIdBig = BigInt(userId);
    const data: Prisma.LottoGameUncheckedCreateInput = {
      userId: userIdBig,
      status: 'STASHED',
      number1: dto.numbers[0],
      number2: dto.numbers[1],
      number3: dto.numbers[2],
      number4: dto.numbers[3],
      number5: dto.numbers[4],
      number6: dto.numbers[5],
      extractionMethod: dto.extractionMethod,
    };
    const game = await this.prisma.lottoGame.create({ data });

    // 번호 생성 뱃지 체크
    await this.badgeService.updateUserBadges(userIdBig);

    return game;
  }


  async getHistory(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PageResponse<LottoGame>> {
    const userIdBig = BigInt(userId);
    const skip = (page - 1) * limit;
    const [content, totalElements] = await Promise.all([
      this.prisma.lottoGame.findMany({
        where: { userId: userIdBig },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.lottoGame.count({ where: { userId: userIdBig } }),
    ]);

    return {
      content,
      pageNumber: page,
      pageSize: limit,
      totalElements,
      totalPages: Math.ceil(totalElements / limit),
    };
  }


  async getStatistics(userId: string) {
    const userIdBig = BigInt(userId);
    const games = await this.prisma.lottoGame.findMany({
      where: { userId: userIdBig },
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
