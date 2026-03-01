import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BadgeService } from '../users/badge.service';
import { WinningInfoCrawlerService } from './winning-info-crawler.service';
import { FcmService } from '../notification/fcm.service';

/**
 * 사용자의 로또 게임 결과와 당첨 번호를 대조하여 등수를 계산하고 상태를 업데이트하는 서비스입니다.
 * Kotlin WinningCheckService 로직을 이식함.
 */
@Injectable()
export class WinningCheckService {
  private readonly logger = new Logger(WinningCheckService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly winningInfoCrawler: WinningInfoCrawlerService,
    private readonly badgeService: BadgeService,
    private readonly fcmService: FcmService,
  ) {}

  /**
   * 특정 회차의 모든 티켓에 대해 당첨 여부를 확인합니다.
   * @param round 로또 회차
   */
  async checkWinning(round: number) {
    let winningInfo = await this.prisma.winningInfo.findUnique({
      where: { round },
    });

    if (!winningInfo) {
      this.logger.log(`${round} 회차 정보 미발견. 크롤링 시도...`);
      await this.winningInfoCrawler.crawlWinningInfo(round);
      winningInfo = await this.prisma.winningInfo.findUnique({
        where: { round },
      });
    }

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
      let hasWinningGame = false;
      const updates = [];

      for (const game of ticket.games) {
        const { status, prize } = this.calculateRank(game, winningInfo);
        
        if (game.status !== status || game.prizeAmount !== prize) {
          updates.push(
            this.prisma.lottoGame.update({
              where: { id: game.id },
              data: { status, prizeAmount: prize },
            }),
          );
        }

        if (prize > BigInt(0)) {
          hasWinningGame = true;
        }
      }

      if (updates.length > 0) {
        await Promise.all(updates);
      }

      const newStatus = hasWinningGame ? 'WINNING' : 'LOSING';
      if (ticket.status !== newStatus) {
        await this.prisma.lottoTicket.update({
          where: { id: ticket.id },
          data: { status: newStatus },
        });

        if (hasWinningGame) {
          this.badgeService.updateUserBadges(ticket.userId).catch((e) =>
            this.logger.error(`사용자 ${ticket.userId} 뱃지 업데이트 실패`, e.stack),
          );
          
          this.notifyWinner(ticket, winningInfo).catch((e) =>
            this.logger.error(`사용자 ${ticket.userId} 당첨 알림 발송 실패`, e.stack),
          );
        }
      }
    } catch (error) {
      this.logger.error(`티켓 ${ticket.id} 처리 중 오류 발생`, error.stack);
    }
  }

  private async notifyWinner(ticket: any, winningInfo: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: ticket.userId },
      select: { fcmToken: true },
    });

    if (user?.fcmToken) {
      const bestGame = ticket.games
        .map((g) => ({ game: g, res: this.calculateRank(g, winningInfo) }))
        .filter((r) => r.res.prize > BigInt(0))
        .sort((a, b) => (a.res.status < b.res.status ? -1 : 1))[0];

      if (bestGame) {
        const rankName = this.getRankName(bestGame.res.status);
        const numbers = [
          bestGame.game.number1, bestGame.game.number2, bestGame.game.number3,
          bestGame.game.number4, bestGame.game.number5, bestGame.game.number6
        ];
        
        await this.fcmService.sendWinningNotification(
          user.fcmToken,
          rankName,
          numbers,
          bestGame.res.prize,
        );
      }
    }
  }

  calculateRank(game: any, winning: any): { status: string; prize: bigint } {
    const myNumbers = new Set([
      game.number1, game.number2, game.number3,
      game.number4, game.number5, game.number6
    ]);
    const winNumbers = new Set([
      winning.number1, winning.number2, winning.number3,
      winning.number4, winning.number5, winning.number6
    ]);

    const matchCount = [...myNumbers].filter(n => winNumbers.has(n)).length;
    const bonusMatch = myNumbers.has(winning.bonusNumber);

    switch (matchCount) {
      case 6: return { status: 'WINNING_1', prize: winning.firstPrizeAmount };
      case 5: return bonusMatch
          ? { status: 'WINNING_2', prize: winning.secondPrizeAmount }
          : { status: 'WINNING_3', prize: winning.thirdPrizeAmount };
      case 4: return { status: 'WINNING_4', prize: winning.fourthPrizeAmount };
      case 3: return { status: 'WINNING_5', prize: winning.fifthPrizeAmount };
      default: return { status: 'LOSING', prize: BigInt(0) };
    }
  }

  private getRankName(status: string): string {
    switch (status) {
      case 'WINNING_1': return '1등';
      case 'WINNING_2': return '2등';
      case 'WINNING_3': return '3등';
      case 'WINNING_4': return '4등';
      case 'WINNING_5': return '5등';
      default: return '당첨';
    }
  }
}
