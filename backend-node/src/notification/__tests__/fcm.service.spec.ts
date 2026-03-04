import { Test, TestingModule } from '@nestjs/testing';
import { FcmService } from '../fcm.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

/**
 * Firebase Admin SDK 모킹을 위한 클로저 변수들입니다.
 */
let mockApps: any[] = [];
const mockSend = jest.fn();
const mockSendEach = jest.fn();

jest.mock('firebase-admin', () => ({
  get apps() {
    return mockApps;
  },
  initializeApp: jest.fn(() => {
    mockApps.push({ name: '[DEFAULT]' });
  }),
  credential: {
    cert: jest.fn(),
  },
  messaging: jest.fn(() => ({
    send: mockSend,
    sendEach: mockSendEach,
  })),
}));

/**
 * FcmService에 대한 단위 테스트입니다.
 * Firebase 초기화, 사용자 토큰 관리, 푸시 알림 발송 기능을 검증합니다.
 */
describe('FcmService', () => {
  let service: FcmService;
  let prisma: PrismaService;
  let configService: ConfigService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockApps = [];

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FcmService,
        {
          provide: PrismaService,
          useValue: {
            user: { findUnique: jest.fn(), update: jest.fn() },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mock-path'),
          },
        },
      ],
    }).compile();

    service = module.get<FcmService>(FcmService);
    prisma = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('onModuleInit (Firebase 초기화)', () => {
    it('설정된 경로로 Firebase를 초기화해야 한다', () => {
      service.onModuleInit();
      expect(admin.initializeApp).toHaveBeenCalled();
      expect(mockApps.length).toBe(1);
    });

    it('설정 경로가 없으면 초기화하지 않고 경고를 남겨야 한다', () => {
      (configService.get as jest.Mock).mockReturnValue(null);
      service.onModuleInit();
      expect(admin.initializeApp).not.toHaveBeenCalled();
    });
  });

  describe('알림 전송', () => {
    beforeEach(() => {
      (configService.get as jest.Mock).mockReturnValue('mock-path');
      mockApps = [];
      service.onModuleInit(); // 여기서 mockApps에 1개가 들어감
    });

    it('당첨 알림을 전송해야 한다', async () => {
      mockSend.mockResolvedValue('msg-id');
      await service.sendWinningNotification(
        'token',
        '1등',
        [1, 2, 3, 4, 5, 6],
        BigInt(1000),
      );
      expect(mockSend).toHaveBeenCalled();
    });

    it('당첨 알림 전송 실패 시 에러를 로깅해야 한다', async () => {
      mockSend.mockRejectedValue(new Error('Send Error'));
      await expect(
        service.sendWinningNotification('token', '1등', [1, 2, 3, 4, 5, 6]),
      ).resolves.not.toThrow();
    });

    it('Firebase 미초기화 시 당첨 알림 전송을 스킵해야 한다', async () => {
      // 초기화 로직을 실패하게 만듦
      (configService.get as jest.Mock).mockReturnValue(null);
      const uninitService = new FcmService(prisma, configService);
      uninitService.onModuleInit();

      await uninitService.sendWinningNotification(
        'token',
        '1등',
        [1, 2, 3, 4, 5, 6],
      );
      expect(mockSend).not.toHaveBeenCalled();
    });

    it('브로드캐스트 알림을 전송해야 한다', async () => {
      mockSendEach.mockResolvedValue({ successCount: 2, failureCount: 0 });
      await service.sendBroadcastNotification(['t1', 't2'], 'Title', 'Body');
      expect(mockSendEach).toHaveBeenCalled();
    });
  });

  describe('토큰 등록', () => {
    it('ID 기반으로 토큰을 등록해야 한다', async () => {
      const userId = BigInt(1);
      const token = 'token123';
      await service.registerTokenById(userId, token);
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it('SSO 식별자 기반으로 토큰을 등록해야 한다', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: BigInt(10),
      });
      await service.registerToken('sso', 'token');
      expect(prisma.user.update).toHaveBeenCalled();
    });
  });
});
