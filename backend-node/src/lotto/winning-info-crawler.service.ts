import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WinningCheckService } from './winning-check.service';

/**
 * 당첨 정보 수집 및 정기 작업을 담당하는 서비스입니다.
 * Kotlin LottoScheduler 및 WinningInfoCrawler 로직을 이식함.
 */
@Injectable()
export class WinningInfoCrawlerService {
  private readonly logger = new Logger(WinningInfoCrawlerService.name);
  private readonly jsonApiUrl =
    'https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=';

  // 1회차 추첨일: 2002-12-07 20:40
  private readonly FIRST_DRAW_DATE = new Date('2002-12-07T20:40:00');

  constructor(
    private readonly prisma: PrismaService,
    private readonly winningCheckService: WinningCheckService,
  ) {}

  /**
   * 매주 토요일 오후 9시 30분에 실행 (추첨 방송 종료 후)
   */
  @Cron('0 30 21 * * 6') // 매주 토요일 21:30
  async handleWeeklyLottoTasks() {
    const round = this.calculateCurrentRound();
    this.logger.log(`${round} 회차 정기 작업 시작`);

    try {
      // 1. 당첨 번호 크롤링
      await this.crawlWinningInfo(round);

      // 2. 사용자 당첨 확인 및 뱃지 업데이트
      await this.winningCheckService.checkWinning(round);

      this.logger.log(`${round} 회차 정기 작업 완료`);
    } catch (error) {
      this.logger.error(`${round} 회차 정기 작업 실패`, error.stack);
    }
  }

  /**
   * 특정 회차의 당첨 정보를 외부 API로부터 가져와 저장합니다.
   * @param round 로또 회차
   */
  async crawlWinningInfo(round: number): Promise<void> {
    const existing = await this.prisma.winningInfo.findUnique({
      where: { round },
    });

    if (existing) {
      this.logger.log(`${round} 회차 당첨 정보가 이미 존재합니다.`);
      return;
    }

    this.logger.log(`${round} 회차 당첨 정보 수집 시작`);

    try {
      const url = `${this.jsonApiUrl}${round}`;
      const response = await axios.get(url);
      const data = response.data;

      if (data.returnValue !== 'success') {
        throw new Error(`${round} 회차 데이터 조회 실패 (API 응답 fail)`);
      }

      await this.prisma.winningInfo.create({
        data: {
          round: round,
          drawDate: new Date(data.drwNoDate),
          number1: data.drwtNo1,
          number2: data.drwtNo2,
          number3: data.drwtNo3,
          number4: data.drwtNo4,
          number5: data.drwtNo5,
          number6: data.drwtNo6,
          bonusNumber: data.bnusNo,
          firstPrizeAmount: BigInt(data.firstWinamnt),
          secondPrizeAmount: BigInt(data.firstWinamnt) / BigInt(6), // 실제 API는 1등만 주므로 임시 계산 (또는 0)
          thirdPrizeAmount: BigInt(1500000), // 평균값
          fourthPrizeAmount: BigInt(50000),
          fifthPrizeAmount: BigInt(5000),
        },
      });

      this.logger.log(`${round} 회차 당첨 정보 저장 성공`);
    } catch (error) {
      this.logger.error(`${round} 회차 당첨 정보 수집 실패`, error.stack);
      throw error;
    }
  }

  /**
   * 특정 회차의 당첨 정보를 조회합니다.
   */
  async getWinningInfo(round: number) {
    return this.prisma.winningInfo.findUnique({ where: { round } });
  }

  /**
   * 현재 날짜를 기준으로 현재 로또 회차를 계산합니다.
   */
  calculateCurrentRound(): number {
    const now = new Date();
    const diffMs = now.getTime() - this.FIRST_DRAW_DATE.getTime();
    const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
    return diffWeeks + 1;
  }
}
