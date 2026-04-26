import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BadgeService {
  private readonly logger = new Logger(BadgeService.name);

  // 뱃지 상수 정의
  static readonly BADGE_FIRST_WIN = 'FIRST_WIN';
  static readonly BADGE_LUCKY_1ST = 'LUCKY_1ST';
  static readonly BADGE_FREQUENT_PLAYER = 'FREQUENT_PLAYER';
  static readonly BADGE_VETERAN = 'VETERAN';
  static readonly BADGE_DREAM_MASTER = 'DREAM_MASTER';
  static readonly BADGE_SAJU_EXPERT = 'SAJU_EXPERT';
  static readonly BADGE_STATS_GENIUS = 'STATS_GENIUS';
  static readonly BADGE_HOROSCOPE_BELIEVER = 'HOROSCOPE_BELIEVER';
  static readonly BADGE_NATURE_LOVER = 'NATURE_LOVER';

  constructor(private readonly prisma: PrismaService) {}

  /** 사용자의 당첨 이력 및 게임 횟수를 분석하여 뱃지를 업데이트합니다. */
  async updateUserBadges(userId: bigint) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const currentBadges = new Set(
      (user.badges?.split(',') || []).filter((b) => b.length > 0),
    );
    const originalCount = currentBadges.size;

    // 1. 활동 및 당첨 결과 기반 뱃지 체크
    await this.checkActivityAndWinBadges(userId, currentBadges);

    // 2. 추출 방법론별 전문 뱃지 체크
    await this.checkMethodSpecialistBadges(userId, currentBadges);

    // 3. 변경 사항 반영
    if (currentBadges.size !== originalCount) {
      await this.saveUserBadges(userId, currentBadges);
    }
  }

  private async checkActivityAndWinBadges(userId: bigint, badges: Set<string>) {
    const [totalGames, winningGamesCount, hasFirstPlace] = await Promise.all([
      this.prisma.lottoGame.count({ where: { userId } }),
      this.prisma.lottoGame.count({
        where: { userId, status: { startsWith: 'WINNING' } },
      }),
      this.prisma.lottoGame.findFirst({
        where: { userId, status: 'WINNING_1' },
      }),
    ]);

    if (winningGamesCount > 0) badges.add(BadgeService.BADGE_FIRST_WIN);
    if (hasFirstPlace) badges.add(BadgeService.BADGE_LUCKY_1ST);
    if (totalGames >= 10) badges.add(BadgeService.BADGE_FREQUENT_PLAYER);
    if (totalGames >= 50) badges.add(BadgeService.BADGE_VETERAN);
  }

  private async checkMethodSpecialistBadges(
    userId: bigint,
    badges: Set<string>,
  ) {
    const methodBadgeMap: { [key: string]: string } = {
      DREAM: BadgeService.BADGE_DREAM_MASTER,
      SAJU: BadgeService.BADGE_SAJU_EXPERT,
      HOROSCOPE: BadgeService.BADGE_HOROSCOPE_BELIEVER,
      NATURE_PATTERNS: BadgeService.BADGE_NATURE_LOVER,
    };

    // 일반 키워드 기반 추출 뱃지 체크
    await Promise.all(
      Object.entries(methodBadgeMap).map(([method, badge]) =>
        this.checkAndAddExtractionBadge(userId, method, badge, badges),
      ),
    );

    // 통계 기반 추출 뱃지 별도 체크
    const hasStatsWin = await this.prisma.lottoGame.findFirst({
      where: {
        userId,
        extractionMethod: { in: ['STATISTICS_HOT', 'STATISTICS_COLD'] },
        status: { startsWith: 'WINNING' },
      },
    });
    if (hasStatsWin) badges.add(BadgeService.BADGE_STATS_GENIUS);
  }

  private async checkAndAddExtractionBadge(
    userId: bigint,
    method: string,
    badgeName: string,
    currentBadges: Set<string>,
  ) {
    if (currentBadges.has(badgeName)) return;

    const winWithMethod = await this.prisma.lottoGame.findFirst({
      where: {
        userId,
        extractionMethod: method,
        status: { startsWith: 'WINNING' },
      },
    });

    if (winWithMethod) currentBadges.add(badgeName);
  }

  private async saveUserBadges(userId: bigint, badges: Set<string>) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { badges: Array.from(badges).join(',') },
    });
    this.logger.log(
      `사용자 ${userId}의 뱃지가 업데이트되었습니다. 개수: ${badges.size}`,
    );
  }
}
