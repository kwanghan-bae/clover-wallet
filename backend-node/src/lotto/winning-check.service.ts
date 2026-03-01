import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BadgeService } from '../users/badge.service';
import { WinningInfoCrawlerService } from './winning-info-crawler.service';

/**
 * 게임 상태 정의 (Kotlin LottoGameStatus 기반)
 */
export enum LottoGameStatus {
  WINNING_1 = 'WINNING_1',
  WINNING_2 = 'WINNING_2',
  WINNING_3 = 'WINNING_3',
  WINNING_4 = 'WINNING_4',
  WINNING_5 = 'WINNING_5',
  LOSING = 'LOSING',
  PENDING = 'PENDING',
}

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
  ) {}

  /**
   * 특정 회차의 모든 티켓에 대해 당첨 여부를 확인합니다.
   * @param round 로또 회차
   */
  async checkWinning(round: number) {
    // 1. 당첨 정보 조회
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

    // 2. 해당 회차의 티켓 조회
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

      // 게임 업데이트 실행
      if (updates.length > 0) {
        await Promise.all(updates);
      }

      // 티켓 상태 업데이트
      const newStatus = hasWinningGame ? 'WINNING' : 'LOSING';
      if (ticket.status !== newStatus) {
        await this.prisma.lottoTicket.update({
          where: { id: ticket.id },
          data: { status: newStatus },
        });

        if (hasWinningGame) {
          // 뱃지 업데이트 (에러 무시)
          this.badgeService.updateUserBadges(ticket.userId).catch((e) =>
            this.logger.error(`사용자 ${ticket.userId} 뱃지 업데이트 실패`, e.stack),
          );
          
          // TODO: FCM 알림 발송 (FcmService 구현 시 추가)
          this.logger.log(`사용자 ${ticket.userId} 당첨 알림 대상 (티켓: ${ticket.id})`);
        }
      }
    } catch (error) {
      this.logger.error(`티켓 ${ticket.id} 처리 중 오류 발생`, error.stack);
    }
  }

  /**
   * 게임 번호와 당첨 번호를 비교하여 등수와 당첨금을 계산합니다.
   * Kotlin LottoGameEntity.calculateRank 로직 이식.
   */
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
      case 6:
        return { status: 'WINNING_1', prize: winning.firstPrizeAmount };
      case 5:
        return bonusMatch
          ? { status: 'WINNING_2', prize: winning.secondPrizeAmount }
          : { status: 'WINNING_3', prize: winning.thirdPrizeAmount };
      case 4:
        return { status: 'WINNING_4', prize: winning.fourthPrizeAmount };
      case 3:
        return { status: 'WINNING_5', prize: winning.fifthPrizeAmount };
      default:
        return { status: 'LOSING', prize: BigInt(0) };
    }
  }
}
