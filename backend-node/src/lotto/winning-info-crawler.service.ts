import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class WinningInfoCrawlerService {
    private readonly logger = new Logger(WinningInfoCrawlerService.name);
    private readonly jsonApiUrl = "https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=";

    constructor(private readonly prisma: PrismaService) { }

    @Cron(CronExpression.EVERY_WEEKEND) // Run every weekend (or specific time like Sat 9PM)
    async handleCron() {
        // Implement logic to find latest round and crawl
        // For MVP/Migration, maybe just crawl specific round or latest + 1?
        // Let's defer strict schedule logic and focus on the crawl function first.
    }

    async crawlWinningInfo(round: number): Promise<void> {
        const existing = await this.prisma.winningInfo.findUnique({
            where: { round },
        });

        if (existing) {
            this.logger.log(`${round} 회차 당첨 정보가 이미 존재합니다. 건너뜁니다.`);
            return;
        }

        this.logger.log(`${round} 회차 당첨 정보 수집 시작 (JSON API)`);

        try {
            const url = `${this.jsonApiUrl}${round}`;
            const response = await axios.get(url);
            const data = response.data;
            this.logger.log(`API Response for ${round}: ${JSON.stringify(data).substring(0, 200)}...`);

            if (data.returnValue !== 'success') {
                this.logger.warn(`${round} 회차 데이터 조회 실패 (API 응답 fail)`);
                return;
            }

            const drawDate = new Date(data.drwNoDate); // "2023-01-01"

            await this.prisma.winningInfo.create({
                data: {
                    round: round,
                    drawDate: drawDate,
                    number1: data.drwtNo1,
                    number2: data.drwtNo2,
                    number3: data.drwtNo3,
                    number4: data.drwtNo4,
                    number5: data.drwtNo5,
                    number6: data.drwtNo6,
                    bonusNumber: data.bnusNo,
                    firstPrizeAmount: BigInt(data.firstWinamnt),
                    secondPrizeAmount: BigInt(0), // API doesn't provide this in simple JSON
                    thirdPrizeAmount: BigInt(0),
                    fourthPrizeAmount: BigInt(0),
                    fifthPrizeAmount: BigInt(0),
                },
            });

            this.logger.log(`${round} 회차 당첨 정보 저장 성공`);

        } catch (error) {
            this.logger.error(`${round} 회차 당첨 정보 수집 실패`, error);
            throw error;
        }
    }

    async getWinningInfo(round: number) {
        return this.prisma.winningInfo.findUnique({
            where: { round },
        });
    }
}
