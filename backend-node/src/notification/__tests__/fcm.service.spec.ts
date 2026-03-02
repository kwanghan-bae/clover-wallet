import { Test, TestingModule } from '@nestjs/testing';
import { FcmService } from '../fcm.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

/** Firebase Cloud Messaging 단일 전송을 위한 Mock 함수입니다. */
const mockSend = jest.fn().mockResolvedValue('success');
/** Firebase Cloud Messaging 일괄 전송을 위한 Mock 함수입니다. */
const mockSendEach = jest.fn().mockResolvedValue({ successCount: 1, failureCount: 0 });

jest.mock('firebase-admin', () => ({
  apps: [],
  initializeApp: jest.fn(),
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
 * Firebase Admin SDK 초기화 및 알림 전송 기능을 검증합니다.
 */
describe('FcmService', () => {
  let service: FcmService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FcmService,
        {
          provide: PrismaService,
          useValue: {
            user: { findMany: jest.fn(), update: jest.fn() },
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
    configService = module.get<ConfigService>(ConfigService);
    service.onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendWinningNotification', () => {
    it('should send notification to a specific token', async () => {
      const token = 'mock-token';
      const rank = '1등';
      const numbers = [1, 2, 3, 4, 5, 6];
      const prize = BigInt(1000000);

      await service.sendWinningNotification(token, rank, numbers, prize);

      expect(mockSend).toHaveBeenCalled();
    });
  });
});
