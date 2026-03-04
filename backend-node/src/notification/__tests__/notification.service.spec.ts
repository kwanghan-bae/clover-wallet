import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from '../notification.service';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * NotificationService에 대한 단위 테스트입니다.
 * 인앱 알림의 생성, 조회, 읽음 처리 및 미읽음 개수 확인 기능을 검증합니다.
 */
describe('NotificationService', () => {
  let service: NotificationService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: PrismaService,
          useValue: {
            notification: {
              create: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn().mockResolvedValue(0),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('createNotification', () => {
    it('새 알림을 성공적으로 생성해야 한다', async () => {
      const userId = BigInt(1);
      const title = '제목';
      const message = '내용';

      await service.createNotification(userId, title, message);

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId,
          title,
          message,
          type: 'INFO',
          isRead: false,
        },
      });
    });
  });

  describe('getMyNotifications', () => {
    it('사용자의 알림 목록을 페이징하여 반환해야 한다', async () => {
      const userId = BigInt(1);
      const mockContent = [{ id: BigInt(101) }, { id: BigInt(102) }];
      (prisma.notification.findMany as jest.Mock).mockResolvedValue(
        mockContent,
      );
      (prisma.notification.count as jest.Mock).mockResolvedValue(25);

      const result = await service.getMyNotifications(userId, 1, 10);

      expect(result.content).toEqual(mockContent);
      expect(result.pageNumber).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.totalElements).toBe(25);
      expect(result.totalPages).toBe(3); // Math.ceil(25 / 10)
      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });
  });

  describe('markAsRead', () => {
    it('자신의 알림인 경우 읽음 처리해야 한다', async () => {
      const nid = BigInt(100);
      const uid = BigInt(1);
      (prisma.notification.findUnique as jest.Mock).mockResolvedValue({
        id: nid,
        userId: uid,
      });

      await service.markAsRead(nid, uid);

      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: nid },
        data: { isRead: true },
      });
    });

    it('타인의 알림인 경우 읽음 처리를 수행하지 않아야 한다', async () => {
      const nid = BigInt(100);
      const uid = BigInt(1);
      const otherUid = BigInt(2);
      (prisma.notification.findUnique as jest.Mock).mockResolvedValue({
        id: nid,
        userId: otherUid,
      });

      await service.markAsRead(nid, uid);

      expect(prisma.notification.update).not.toHaveBeenCalled();
    });

    it('존재하지 않는 알림인 경우 무시해야 한다', async () => {
      (prisma.notification.findUnique as jest.Mock).mockResolvedValue(null);
      await service.markAsRead(BigInt(999), BigInt(1));
      expect(prisma.notification.update).not.toHaveBeenCalled();
    });
  });

  describe('getUnreadCount', () => {
    it('읽지 않은 알림 개수를 반환해야 한다', async () => {
      const userId = BigInt(1);
      (prisma.notification.count as jest.Mock).mockResolvedValue(5);

      const count = await service.getUnreadCount(userId);

      expect(count).toBe(5);
      expect(prisma.notification.count).toHaveBeenCalledWith({
        where: { userId, isRead: false },
      });
    });
  });
});
