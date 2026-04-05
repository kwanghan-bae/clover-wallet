import { Test, TestingModule } from '@nestjs/testing';
import { WinningInfoCrawlerService } from '../winning-info-crawler.service';
import { PrismaService } from '../../prisma/prisma.service';
import { FcmService } from '../../notification/fcm.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import axios from 'axios';

jest.mock('axios');
/** axios 모듈을 jest Mock 객체로 캐스팅하여 동행복권 API 호출 결과 모킹에 사용합니다. */
const mockedAxios = axios as jest.Mocked<typeof axios>;

/**
 * WinningInfoCrawlerService에 대한 단위 테스트입니다.
 * 회차 계산 로직과 당첨 정보 크롤링 및 이벤트 발행 기능을 테스트합니다.
 */
describe('WinningInfoCrawlerService', () => {
  let service: WinningInfoCrawlerService;
  let prisma: PrismaService;
  let eventEmitter: EventEmitter2;
  let fcmService: FcmService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WinningInfoCrawlerService,
        {
          provide: PrismaService,
          useValue: {
            winningInfo: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            user: {
              findMany: jest.fn().mockResolvedValue([]),
            },
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
        {
          provide: FcmService,
          useValue: {
            sendBroadcastNotification: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WinningInfoCrawlerService>(WinningInfoCrawlerService);
    prisma = module.get<PrismaService>(PrismaService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    fcmService = module.get<FcmService>(FcmService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateCurrentRound', () => {
    it('should calculate correct round based on date', () => {
      const round = service.calculateCurrentRound();
      expect(round).toBeGreaterThan(1100); // 2024년 기준 1100회 이상
    });
  });

  describe('crawlWinningInfo', () => {
    it('should skip if winning info already exists', async () => {
      (prisma.winningInfo.findUnique as jest.Mock).mockResolvedValue({
        round: 1000,
      });
      await service.crawlWinningInfo(1000);
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should crawl and save winning info if not exists', async () => {
      (prisma.winningInfo.findUnique as jest.Mock).mockResolvedValue(null);
      mockedAxios.get.mockResolvedValue({
        data: {
          returnValue: 'success',
          drwNoDate: '2024-01-01',
          drwtNo1: 1,
          drwtNo2: 2,
          drwtNo3: 3,
          drwtNo4: 4,
          drwtNo5: 5,
          drwtNo6: 6,
          bnusNo: 7,
          firstWinamnt: 1000000,
        },
      });

      await service.crawlWinningInfo(1000);
      expect(prisma.winningInfo.create).toHaveBeenCalled();
    });

    it('should throw error if API fails', async () => {
      (prisma.winningInfo.findUnique as jest.Mock).mockResolvedValue(null);
      mockedAxios.get.mockResolvedValue({ data: { returnValue: 'fail' } });

      await expect(service.crawlWinningInfo(1000)).rejects.toThrow();
    });
  });

  describe('handleWeeklyLottoTasks', () => {
    it('should call crawlWinningInfo and emit event', async () => {
      const spy = jest
        .spyOn(service, 'crawlWinningInfo')
        .mockResolvedValue(undefined);
      await service.handleWeeklyLottoTasks();
      expect(spy).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'lotto.winning-info.created',
        expect.any(Object),
      );
    });
  });

  describe('handleDrawDayReminder', () => {
    it('should send broadcast notification to users with FCM tokens', async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([
        { fcmToken: 'token1' },
        { fcmToken: 'token2' },
      ]);
      (fcmService.sendBroadcastNotification as jest.Mock).mockResolvedValue(
        undefined,
      );

      await service.handleDrawDayReminder();

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { fcmToken: { not: null } },
        select: { fcmToken: true },
      });
      expect(fcmService.sendBroadcastNotification).toHaveBeenCalledWith(
        ['token1', 'token2'],
        expect.stringContaining('추첨일'),
        expect.any(String),
      );
    });

    it('should not send if no users have FCM tokens', async () => {
      (prisma.user.findMany as jest.Mock).mockResolvedValue([]);

      await service.handleDrawDayReminder();

      expect(fcmService.sendBroadcastNotification).not.toHaveBeenCalled();
    });
  });
});
