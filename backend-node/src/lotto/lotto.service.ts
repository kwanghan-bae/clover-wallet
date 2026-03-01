import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SaveGameDto } from './dto/save-game.dto';
import { PageResponse } from '../common/types/page-response';
import { BadgeService } from '../users/badge.service';

/**
 * 로또 게임 정보 관리 및 저장을 담당하는 서비스입니다.
 * Kotlin LottoGameService 로직을 이식함.
 */
@Injectable()
export class LottoService {
  private readonly logger = new Logger(LottoService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly badgeService: BadgeService,
  ) {}

  /**
   * 특정 사용자의 게임 목록을 페이징하여 조회합니다.
   */
  async getGamesByUserId(
    userId: bigint | number,
    page: number,
    size: number,
  ): Promise<PageResponse<any>> {
    const skip = page * size;
    const [games, total] = await Promise.all([
      this.prisma.lottoGame.findMany({
        where: { userId: BigInt(userId) },
        skip,
        take: size,
        orderBy: { createdAt: 'desc' },
        include: { ticket: true },
      }),
      this.prisma.lottoGame.count({ where: { userId: BigInt(userId) } }),
    ]);

    return {
      content: games,
      pageNumber: page,
      pageSize: size,
      totalElements: total,
      totalPages: Math.ceil(total / size),
    };
  }

  /**
   * 생성된 로또 번호를 저장합니다. (가상 티켓 생성 포함)
   */
  async saveGeneratedGame(dto: SaveGameDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. 가상 티켓 생성 (회차 0)
      const ticket = await tx.lottoTicket.create({
        data: {
          userId: BigInt(dto.userId),
          ordinal: 0,
          status: 'PENDING',
          url: null,
        },
      });

      // 2. 게임 정보 저장
      const game = await tx.lottoGame.create({
        data: {
          userId: BigInt(dto.userId),
          ticketId: ticket.id,
          status: 'PENDING',
          number1: dto.numbers[0],
          number2: dto.numbers[1],
          number3: dto.numbers[2],
          number4: dto.numbers[3],
          number5: dto.numbers[4],
          number6: dto.numbers[5],
          extractionMethod: dto.extractionMethod,
          prizeAmount: BigInt(0),
        },
      });

      // 3. 뱃지 업데이트 (에러 무시)
      try {
        await this.badgeService.updateUserBadges(BigInt(dto.userId));
      } catch (e) {
        this.logger.error(`사용자 ${dto.userId}의 뱃지 업데이트 실패`, e.stack);
      }

      return game;
    });
  }
}
