import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { calculateCurrentRound } from '../common/utils/lotto-round.util';
import axios from 'axios';

@Injectable()
export class LottoInfoService {
  private readonly logger = new Logger(LottoInfoService.name);

  constructor(private readonly prisma: PrismaService) {}

  private getNextSaturday(): Date {
    const now = new Date();
    const day = now.getDay();
    const daysUntilSat = (6 - day + 7) % 7 || 7;
    const next = new Date(now);
    next.setDate(now.getDate() + daysUntilSat);
    next.setHours(20, 40, 0, 0);
    if (next <= now) {
      next.setDate(next.getDate() + 7);
    }
    return next;
  }

  async getNextDrawInfo(): Promise<Record<string, unknown>> {
    const currentRound = calculateCurrentRound();
    const nextDrawDate = this.getNextSaturday();
    const now = new Date();
    const diffMs = nextDrawDate.getTime() - now.getTime();
    const daysLeft = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    const hoursLeft = Math.floor(
      (diffMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000),
    );
    const minutesLeft = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000));

    const lastWinning = await this.prisma.winningInfo.findFirst({
      orderBy: { round: 'desc' },
      select: { firstPrizeAmount: true },
    });

    const estimatedJackpot =
      lastWinning?.firstPrizeAmount ?? BigInt(3000000000);

    return {
      currentRound,
      nextDrawDate: nextDrawDate.toISOString(),
      daysLeft,
      hoursLeft,
      minutesLeft,
      estimatedJackpot: estimatedJackpot.toString(),
    };
  }

  async getDrawResult(round: number) {
    let info = await this.prisma.winningInfo.findUnique({ where: { round } });
    if (info) return info;

    try {
      const { data } = await axios.get(
        'https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=' + round,
        { timeout: 5000 },
      );
      if (data.returnValue !== 'success') return null;

      info = await this.prisma.winningInfo.create({
        data: {
          round,
          drawDate: new Date(data.drwNoDate),
          number1: data.drwtNo1,
          number2: data.drwtNo2,
          number3: data.drwtNo3,
          number4: data.drwtNo4,
          number5: data.drwtNo5,
          number6: data.drwtNo6,
          bonusNumber: data.bnusNo,
          firstPrizeAmount: BigInt(data.firstWinamnt || 0),
          secondPrizeAmount: BigInt(0),
          thirdPrizeAmount: BigInt(0),
          fourthPrizeAmount: BigInt(0),
          fifthPrizeAmount: BigInt(0),
        },
      });
      return info;
    } catch (error) {
      this.logger.warn(
        'Failed to fetch draw result for round ' + round + ': ' + error,
      );
      return null;
    }
  }
}
