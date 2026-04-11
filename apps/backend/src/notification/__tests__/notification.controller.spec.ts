import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from '../notification.controller';
import { NotificationService } from '../notification.service';
import { FcmService } from '../fcm.service';

/**
 * NotificationController에 대한 단위 테스트입니다.
 * 알림 목록 조회, 읽음 처리 및 FCM 토큰 등록 API의 연동을 확인합니다.
 */
describe('NotificationController', () => {
  let controller: NotificationController;
  let notificationService: NotificationService;
  let fcmService: FcmService;

  const mockNotificationService = {
    getMyNotifications: jest.fn(),
    markAsRead: jest.fn(),
    getUnreadCount: jest.fn(),
    createNotification: jest.fn(),
  };

  const mockFcmService = {
    registerTokenById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
        {
          provide: FcmService,
          useValue: mockFcmService,
        },
      ],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
    notificationService = module.get<NotificationService>(NotificationService);
    fcmService = module.get<FcmService>(FcmService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyNotifications', () => {
    it('should call notificationService.getMyNotifications', async () => {
      const req = { user: { id: 'user-id' } };
      await controller.getMyNotifications(req, 0, 20);
      expect(notificationService.getMyNotifications).toHaveBeenCalledWith(
        'user-id',
        0,
        20,
      );
    });
  });

  describe('markAsRead', () => {
    it('should call notificationService.markAsRead', async () => {
      const req = { user: { id: 'user-id' } };
      const result = await controller.markAsRead('1', req);
      expect(notificationService.markAsRead).toHaveBeenCalledWith(
        BigInt(1),
        'user-id',
      );
      expect(result).toEqual({ success: true });
    });
  });

  describe('getUnreadCount', () => {
    it('should call notificationService.getUnreadCount', async () => {
      const req = { user: { id: 'user-id' } };
      await controller.getUnreadCount(req);
      expect(notificationService.getUnreadCount).toHaveBeenCalledWith(
        'user-id',
      );
    });
  });

  describe('createNotification', () => {
    it('should call notificationService.createNotification with user id and body', async () => {
      const req = { user: { id: 'user-id' } };
      const body = { title: 'Test', message: 'Hello', type: 'INFO' };
      const created = { id: BigInt(1), ...body };
      mockNotificationService.createNotification.mockResolvedValue(created);
      const result = await controller.createNotification(req, body);
      expect(notificationService.createNotification).toHaveBeenCalledWith(
        'user-id',
        'Test',
        'Hello',
        'INFO',
      );
      expect(result).toEqual(created);
    });

    it('should default type to INFO when not provided', async () => {
      const req = { user: { id: 'user-id' } };
      const body = { title: 'Test', message: 'Hello' };
      mockNotificationService.createNotification.mockResolvedValue({});
      await controller.createNotification(req, body);
      expect(notificationService.createNotification).toHaveBeenCalledWith(
        'user-id',
        'Test',
        'Hello',
        'INFO',
      );
    });
  });

  describe('registerFcmToken', () => {
    it('should call fcmService.registerTokenById', async () => {
      const req = { user: { id: 'user-id' } };
      const body = { token: 'fcm-token' };
      const result = await controller.registerFcmToken(req, body);
      expect(fcmService.registerTokenById).toHaveBeenCalledWith(
        'user-id',
        'fcm-token',
      );
      expect(result).toEqual({ success: true });
    });
  });
});
