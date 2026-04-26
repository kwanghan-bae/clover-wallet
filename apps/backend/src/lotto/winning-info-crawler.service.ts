import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { calculateCurrentRound } from '../common/utils/lotto-round.util';
import axios from 'axios';
import { Cron } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FcmService } from '../notification/fcm.service';


@Injectable()
export class WinningInfoCrawlerService {
  private readonly logger = new Logger(WinningInfoCrawlerService.name);
  private readonly jsonApiUrl =
    'https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=';

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly fcmService: FcmService,
  ) {}

  
  @Cron('0 30 21 * * 6') // 매주 토요일 21:30
  async handleWeeklyLottoTasks() {
    const round = this.calculateCurrentRound();
    this.logger.log(`${round} 회차 정기 작업 시작`);

    try {
      // 1. 당첨 번호 크롤링
      await this.crawlWinningInfo(round);

      // 2. 이벤트 발행 (WinningCheckService 등에서 수신)
      this.eventEmitter.emit('lotto.winning-info.created', { round });

      this.logger.log(`${round} 회차 정기 작업 완료 및 이벤트 발행`);
    } catch (error) {
      this.logger.error(`${round} 회차 정기 작업 실패`, error.stack);
    }
  }


  @Cron('0 10 * * 6') // 매주 토요일 10:00 AM
  async handleDrawDayReminder() {
    this.logger.log('추첨일 알림 발송 시작');

    try {
      const users = await this.prisma.user.findMany({
        where: { fcmToken: { not: null } },
        select: { fcmToken: true },
      });

      const tokens = users
        .map((u) => u.fcmToken)
        .filter((t): t is string => t !== null);

      if (tokens.length === 0) {
        this.logger.log('FCM 토큰이 등록된 사용자가 없습니다.');
        return;
      }

      await this.fcmService.sendBroadcastNotification(
        tokens,
        '🍀 오늘은 추첨일!',
        '오늘 저녁 로또 추첨이 있습니다. 번호를 확인해보세요!',
      );

      this.logger.log(`추첨일 알림 발송 완료: ${tokens.length}명`);
    } catch (error) {
      this.logger.error('추첨일 알림 발송 실패', error.stack);
    }
  }


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
          secondPrizeAmount: BigInt(data.firstWinamnt) / BigInt(6),
          thirdPrizeAmount: BigInt(1500000),
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


  async getWinningInfo(round: number) {
    return this.prisma.winningInfo.findUnique({ where: { round } });
  }


  calculateCurrentRound(): number {
    return calculateCurrentRound();
  }
}
