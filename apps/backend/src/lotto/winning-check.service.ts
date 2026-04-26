import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OnEvent } from '@nestjs/event-emitter';
import { LottoRankCalculator } from './utils/lotto-rank.calculator';
import { WinnerNotificationService } from './winner-notification.service';





@Injectable()
export class WinningCheckService {
  private readonly logger = new Logger(WinningCheckService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly winnerNotification: WinnerNotificationService,
  ) {}

  @OnEvent('lotto.winning-info.created')
  async handleWinningInfoCreated(payload: { round: number }) {
    this.logger.log(`${payload.round} 회차 당첨 정보 생성 이벤트 수신`);
    await this.checkWinning(payload.round);
  }

  async checkWinning(round: number) {
    const winningInfo = await this.prisma.winningInfo.findUnique({
      where: { round },
    });

    if (!winningInfo) {
      this.logger.warn(`${round} 회차 당첨 정보를 찾을 수 없습니다.`);
      return;
    }

    const tickets = await this.prisma.lottoTicket.findMany({
      where: { ordinal: round },
      include: { games: true },
    });

    this.logger.log(`${round} 회차 티켓 ${tickets.length}건 처리 시작`);

    for (const ticket of tickets) {
      await this.processTicket(ticket, winningInfo);
    }
  }

  private async processTicket(ticket: any, winningInfo: any) {
    try {
      const { hasWinningGame, updates } = this.calculateTicketResults(
        ticket,
        winningInfo,
      );

      if (updates.length > 0) {
        await Promise.all(updates.map((u) => this.prisma.lottoGame.update(u)));
      }

      const newStatus = hasWinningGame ? 'WINNING' : 'LOSING';
      if (ticket.status !== newStatus) {
        await this.updateTicketStatus(ticket, newStatus, winningInfo);
      }
    } catch (error) {
      this.logger.error(`티켓 ${ticket.id} 처리 중 오류 발생`, error.stack);
    }
  }

  private calculateTicketResults(ticket: any, winningInfo: any) {
    let hasWinningGame = false;
    const updates = [];

    const prizeAmounts = {
      WINNING_1: winningInfo.firstPrizeAmount,
      WINNING_2: winningInfo.secondPrizeAmount,
      WINNING_3: winningInfo.thirdPrizeAmount,
      WINNING_4: winningInfo.fourthPrizeAmount,
      WINNING_5: winningInfo.fifthPrizeAmount,
    };

    for (const game of ticket.games) {
      const gameNumbers = [
        game.number1,
        game.number2,
        game.number3,
        game.number4,
        game.number5,
        game.number6,
      ];
      const winNumbers = [
        winningInfo.number1,
        winningInfo.number2,
        winningInfo.number3,
        winningInfo.number4,
        winningInfo.number5,
        winningInfo.number6,
      ];

      const { status, prize } = LottoRankCalculator.calculateRank(
        gameNumbers,
        winNumbers,
        winningInfo.bonusNumber,
        prizeAmounts,
      );

      if (game.status !== status || game.prizeAmount !== prize) {
        updates.push({
          where: { id: game.id },
          data: { status, prizeAmount: prize },
        });
      }

      if (prize > BigInt(0)) hasWinningGame = true;
    }

    return { hasWinningGame, updates };
  }

  private async updateTicketStatus(
    ticket: any,
    status: string,
    winningInfo: any,
  ) {
    await this.prisma.lottoTicket.update({
      where: { id: ticket.id },
      data: { status },
    });

    if (status === 'WINNING') {
      this.winnerNotification.handleWinnerActions(ticket, winningInfo);
    }
  }
}
