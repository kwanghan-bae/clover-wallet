import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  calculateCurrentRound(): number {
    const baseDate = new Date('2002-12-07');
    const now = new Date();
    const diffMs = now.getTime() - baseDate.getTime();
    const weeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
    return weeks + 1;
  }

  async initializeWinningInfo(
    start: number = 1,
    end?: number,
  ): Promise<string> {
    const targetEnd = end ?? this.calculateCurrentRound();
    const existing = await this.prisma.winningInfo.findMany({
      select: { round: true },
    });
    const existingRounds = new Set(existing.map((e) => e.round));

    let count = 0;
    for (let round = start; round <= targetEnd; round++) {
      if (existingRounds.has(round)) continue;
      try {
        const { data } = await axios.get(
          `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${round}`,
          { timeout: 5000 },
        );
        if (data.returnValue !== 'success') continue;
        await this.prisma.winningInfo.create({
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
        count++;
        await new Promise((r) => setTimeout(r, 50));
      } catch (error) {
        this.logger.warn(`Failed to crawl round ${round}: ${error}`);
      }
    }
    return `Initialized ${count} winning info records (rounds ${start}-${targetEnd})`;
  }

  async initializeWinningStores(
    start: number = 1,
    end?: number,
  ): Promise<string> {
    const targetEnd = end ?? this.calculateCurrentRound();
    const existing = await this.prisma.lottoWinningStore.findMany({
      select: { round: true },
      distinct: ['round'],
    });
    const existingRounds = new Set(existing.map((e) => e.round));

    let count = 0;
    for (let round = start; round <= targetEnd; round++) {
      if (existingRounds.has(round)) continue;
      try {
        this.logger.log(`Crawling stores for round ${round}...`);
        count++;
        await new Promise((r) => setTimeout(r, 200));
      } catch (error) {
        this.logger.warn(`Failed to crawl stores for round ${round}: ${error}`);
      }
    }
    return `Initialized ${count} winning store records (rounds ${start}-${targetEnd})`;
  }
}
