import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BadgeService } from '../users/badge.service';
import { FcmService } from '../notification/fcm.service';
import { LottoRankCalculator } from './utils/lotto-rank.calculator';




@Injectable()
export class WinnerNotificationService {
  private readonly logger = new Logger(WinnerNotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly badgeService: BadgeService,
    private readonly fcmService: FcmService,
  ) {}

  handleWinnerActions(ticket: any, winningInfo: any) {
    this.badgeService
      .updateUserBadges(ticket.userId)
      .catch((e) =>
        this.logger.error(`뱃지 업데이트 실패: ${ticket.userId}`, e.stack),
      );

    this.notifyWinner(ticket, winningInfo).catch((e) =>
      this.logger.error(`당첨 알림 발송 실패: ${ticket.userId}`, e.stack),
    );
  }

  async notifyWinner(ticket: any, winningInfo: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: ticket.userId },
      select: { fcmToken: true },
    });

    if (!user?.fcmToken) return;

    const best = this.getBestWinningResult(ticket, winningInfo);

    if (best) {
      const rankName = LottoRankCalculator.getRankName(best.res.status);
      const numbers = [
        best.game.number1,
        best.game.number2,
        best.game.number3,
        best.game.number4,
        best.game.number5,
        best.game.number6,
      ];

      await this.fcmService.sendWinningNotification(
        user.fcmToken,
        rankName,
        numbers,
        best.res.prize,
      );
    }
  }

  getBestWinningResult(ticket: any, winningInfo: any) {
    const prizeAmounts = this.getPrizeMap(winningInfo);
    const winNumbers = [
      winningInfo.number1,
      winningInfo.number2,
      winningInfo.number3,
      winningInfo.number4,
      winningInfo.number5,
      winningInfo.number6,
    ];

    const results = ticket.games
      .map((g: any) => ({
        game: g,
        res: LottoRankCalculator.calculateRank(
          [g.number1, g.number2, g.number3, g.number4, g.number5, g.number6],
          winNumbers,
          winningInfo.bonusNumber,
          prizeAmounts,
        ),
      }))
      .filter((r: any) => r.res.prize > BigInt(0))
      .sort((a: any, b: any) => (a.res.status < b.res.status ? -1 : 1));

    return results.length > 0 ? results[0] : null;
  }

  private getPrizeMap(winningInfo: any) {
    return {
      WINNING_1: winningInfo.firstPrizeAmount,
      WINNING_2: winningInfo.secondPrizeAmount,
      WINNING_3: winningInfo.thirdPrizeAmount,
      WINNING_4: winningInfo.fourthPrizeAmount,
      WINNING_5: winningInfo.fifthPrizeAmount,
    };
  }
}
