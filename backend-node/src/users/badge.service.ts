import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * 사용자의 활동 및 당첨 이력을 분석하여 뱃지를 자동으로 부여하는 서비스입니다.
 * Kotlin BadgeService 로직을 완벽히 이식함.
 */
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

  /**
   * 사용자의 당첨 이력 및 게임 횟수를 분석하여 뱃지를 업데이트합니다.
   * @param userId 사용자 ID
   */
  async updateUserBadges(userId: bigint) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const currentBadges = new Set(
      (user.badges?.split(',') || []).filter((b) => b.length > 0),
    );
    const originalCount = currentBadges.size;

    // 1. 기본 통계 조회
    const totalGames = await this.prisma.lottoGame.count({ where: { userId } });
    const winningGamesCount = await this.prisma.lottoGame.count({
      where: {
        userId,
        status: { startsWith: 'WINNING' },
      },
    });

    // 2. 뱃지 조건 확인
    if (winningGamesCount > 0) currentBadges.add(BadgeService.BADGE_FIRST_WIN);
    
    const hasFirstPlace = await this.prisma.lottoGame.findFirst({
      where: { userId, status: 'WINNING_1' },
    });
    if (hasFirstPlace) currentBadges.add(BadgeService.BADGE_LUCKY_1ST);

    if (totalGames >= 10) currentBadges.add(BadgeService.BADGE_FREQUENT_PLAYER);
    if (totalGames >= 50) currentBadges.add(BadgeService.BADGE_VETERAN);

    // 3. 추출 방식별 뱃지 확인
    await this.checkAndAddExtractionBadge(userId, 'DREAM', BadgeService.BADGE_DREAM_MASTER, currentBadges);
    await this.checkAndAddExtractionBadge(userId, 'SAJU', BadgeService.BADGE_SAJU_EXPERT, currentBadges);
    await this.checkAndAddExtractionBadge(userId, 'HOROSCOPE', BadgeService.BADGE_HOROSCOPE_BELIEVER, currentBadges);
    await this.checkAndAddExtractionBadge(userId, 'NATURE_PATTERNS', BadgeService.BADGE_NATURE_LOVER, currentBadges);

    // 통계 뱃지는 HOT 또는 COLD 방식 당첨 시 부여
    const hasStatsWin = await this.prisma.lottoGame.findFirst({
      where: {
        userId,
        extractionMethod: { in: ['STATISTICS_HOT', 'STATISTICS_COLD'] },
        status: { startsWith: 'WINNING' },
      },
    });
    if (hasStatsWin) currentBadges.add(BadgeService.BADGE_STATS_GENIUS);

    // 4. 변경 사항이 있는 경우에만 DB 업데이트
    if (currentBadges.size !== originalCount) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { badges: Array.from(currentBadges).join(',') },
      });
      this.logger.log(`사용자 ${userId}의 뱃지가 업데이트되었습니다. 개수: ${currentBadges.size}`);
    }
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

    if (winWithMethod) {
      currentBadges.add(badgeName);
    }
  }
}
