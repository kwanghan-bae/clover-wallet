import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BadgeService } from '../users/badge.service';
import { FcmService } from '../notification/fcm.service';
import { OnEvent } from '@nestjs/event-emitter';
import { LottoRankCalculator } from './utils/lotto-rank.calculator';

/**
 * 사용자의 로또 게임 결과와 당첨 번호를 대조하여 등수를 계산하고 상태를 업데이트하는 서비스입니다.
 */
@Injectable()
export class WinningCheckService {
  private readonly logger = new Logger(WinningCheckService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly badgeService: BadgeService,
    private readonly fcmService: FcmService,
  ) {}

  /**
   * 당첨 정보 생성 이벤트를 구독하여 당첨 확인을 수행합니다.
   * @param payload 이벤트 데이터 (round 포함)
   */
  @OnEvent('lotto.winning-info.created')
  async handleWinningInfoCreated(payload: { round: number }) {
    this.logger.log(`${payload.round} 회차 당첨 정보 생성 이벤트 수신`);
    await this.checkWinning(payload.round);
  }

  /**
   * 특정 회차의 모든 티켓에 대해 당첨 여부를 확인합니다.
   * @param round 로또 회차
   */
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

  /**
   * 하나의 티켓에 포함된 모든 게임의 당첨 여부를 계산하고 결과를 DB에 저장합니다.
   */
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

  /**
   * 티켓 내 개별 게임의 당첨 결과를 계산합니다.
   */
  private calculateTicketResults(ticket: any, winningInfo: any) {
    let hasWinningGame = false;
    const updates = [];

    const prizeAmounts = this.getPrizeMap(winningInfo);

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

  /**
   * 티켓의 최종 상태를 업데이트하고 당첨 시 후속 작업을 수행합니다.
   */
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
      this.handleWinnerActions(ticket, winningInfo);
    }
  }

  /**
   * 당첨 티켓에 대한 뱃지 업데이트 및 알림 발송을 처리합니다.
   */
  private handleWinnerActions(ticket: any, winningInfo: any) {
    this.badgeService
      .updateUserBadges(ticket.userId)
      .catch((e) =>
        this.logger.error(`뱃지 업데이트 실패: ${ticket.userId}`, e.stack),
      );

    this.notifyWinner(ticket, winningInfo).catch((e) =>
      this.logger.error(`당첨 알림 발송 실패: ${ticket.userId}`, e.stack),
    );
  }

  /**
   * 당첨자에게 푸시 알림을 발송합니다.
   */
  private async notifyWinner(ticket: any, winningInfo: any) {
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

  /**
   * 티켓 내 게임 중 가장 높은 순위의 당첨 결과를 반환합니다.
   */
  private getBestWinningResult(ticket: any, winningInfo: any) {
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

  /**
   * 당첨 정보 객체로부터 등수별 당첨금 맵을 생성합니다.
   */
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
