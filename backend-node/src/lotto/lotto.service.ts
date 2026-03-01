import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SaveGameDto } from './dto/save-game.dto';
import { PageResponse } from '../common/types/page-response';

@Injectable()
export class LottoService {
  constructor(private prisma: PrismaService) {}

  async getGamesByUserId(userId: bigint | number, page: number, size: number): Promise<PageResponse<any>> {
    const skip = page * size;
    const [games, total] = await Promise.all([
      this.prisma.lottoGame.findMany({
        where: { userId: BigInt(userId) },
        skip,
        take: size,
        orderBy: { createdAt: 'desc' },
        include: { ticket: true }
      }),
      this.prisma.lottoGame.count({ where: { userId: BigInt(userId) } })
    ]);

    return {
      content: games,
      pageNumber: page,
      pageSize: size,
      totalElements: total,
      totalPages: Math.ceil(total / size),
    };
  }

  async saveGeneratedGame(dto: SaveGameDto) {
    // 1. Create Placeholder Ticket (Ordinal 0, Status PENDING)
    // In Kotlin: saveGeneratedGame -> ticketRepository.save(...)
    
    // We can use a transaction for safety
    return this.prisma.$transaction(async (tx) => {
      const ticket = await tx.lottoTicket.create({
        data: {
          userId: BigInt(dto.userId),
          ordinal: 0,
          status: 'PENDING',
          url: null // Generated
        }
      });

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
          prizeAmount: 0 // BigInt(0)
        }
      });

      // TODO: Update Badges (BadgeService)
      // swallow error if badge update fails (as per Kotlin code)
      
      return game;
    });
  }
}
