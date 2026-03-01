import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LottoTicketClient } from './client/lotto-ticket.client';
import { JsoupTicketParser } from './client/jsoup-ticket.parser';

/**
 * 로또 티켓 관리 및 스캔 로직을 처리하는 서비스 클래스입니다.
 * Kotlin TicketService 로직을 이식함.
 */
@Injectable()
export class TicketService {
  private readonly logger = new Logger(TicketService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly lottoTicketClient: LottoTicketClient,
    private readonly ticketParser: JsoupTicketParser,
  ) {}

  /**
   * 사용자의 티켓 목록을 페이징하여 조회합니다.
   * @param userId 사용자 ID
   * @param page 페이지 번호
   * @param size 페이지당 항목 수
   */
  async getMyTickets(userId: bigint, page = 0, size = 20) {
    const skip = page * size;
    const [content, total] = await Promise.all([
      this.prisma.lottoTicket.findMany({
        where: { userId },
        skip,
        take: size,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.lottoTicket.count({ where: { userId } }),
    ]);

    return {
      content,
      page,
      size,
      totalElements: total,
      totalPages: Math.ceil(total / size),
    };
  }

  /**
   * 특정 티켓의 상세 정보와 포함된 게임들을 조회합니다.
   * @param ticketId 티켓 ID
   */
  async getTicketById(ticketId: bigint) {
    const ticket = await this.prisma.lottoTicket.findUnique({
      where: { id: ticketId },
      include: { games: true },
    });

    if (!ticket) {
      throw new NotFoundException(`티켓을 찾을 수 없습니다: ${ticketId}`);
    }

    return ticket;
  }

  /**
   * 스캔된 QR URL로부터 티켓 정보를 가져와 저장합니다.
   * Kotlin saveScannedTicket 로직 이식.
   * @param userId 사용자 ID
   * @param url QR 코드 URL
   * @param extractionMethod 추출 방식 (선택)
   */
  async saveScannedTicket(userId: bigint, url: string, extractionMethod?: string) {
    // 1. 이미 등록된 티켓인지 확인
    const existingTicket = await this.prisma.lottoTicket.findUnique({
      where: { url },
    });

    if (existingTicket) {
      this.logger.log(`이미 등록된 티켓입니다: ${url}`);
      return existingTicket;
    }

    try {
      // 2. 외부 사이트에서 HTML 가져오기 및 파싱
      const html = await this.lottoTicketClient.getHtmlByUrl(url);
      const parsedTicket = this.ticketParser.parse(html);

      // 3. 트랜잭션으로 티켓과 게임 정보 저장
      return await this.prisma.$transaction(async (tx) => {
        const savedTicket = await tx.lottoTicket.create({
          data: {
            userId,
            url,
            ordinal: parsedTicket.ordinal,
            status: parsedTicket.status,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        const gameData = parsedTicket.games.map((g) => ({
          ticketId: savedTicket.id,
          userId,
          status: g.status,
          number1: g.number1,
          number2: g.number2,
          number3: g.number3,
          number4: g.number4,
          number5: g.number5,
          number6: g.number6,
          extractionMethod: extractionMethod || 'QR_SCAN',
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        await tx.lottoGame.createMany({
          data: gameData,
        });

        return savedTicket;
      });
    } catch (error) {
      this.logger.error(`티켓 스캔 및 저장 중 오류 발생: ${error.message}`, error.stack);
      throw error;
    }
  }
}
