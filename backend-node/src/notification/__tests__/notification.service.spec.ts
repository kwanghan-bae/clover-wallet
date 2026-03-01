import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from '../notification.service';
import { PrismaService } from '../../prisma/prisma.service';

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
              count: jest.fn(),
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNotification', () => {
    it('should create a notification', async () => {
      await service.createNotification(BigInt(1), 'Title', 'Message');
      expect(prisma.notification.create).toHaveBeenCalled();
    });
  });

  describe('getMyNotifications', () => {
    it('should return paginated notifications', async () => {
      (prisma.notification.findMany as jest.Mock).mockResolvedValue([{ id: BigInt(1) }]);
      (prisma.notification.count as jest.Mock).mockResolvedValue(1);

      const result = await service.getMyNotifications(BigInt(1));
      expect(result.content).toHaveLength(1);
      expect(result.totalElements).toBe(1);
    });
  });
});
