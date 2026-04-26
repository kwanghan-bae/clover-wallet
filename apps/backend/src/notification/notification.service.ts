import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PageResponse } from '../common/types/page-response';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async createNotification(
    userId: bigint,
    title: string,
    message: string,
    type = 'INFO',
  ) {
    return this.prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        isRead: false,
      },
    });
  }

  async getMyNotifications(
    userId: bigint,
    page = 0,
    size = 20,
  ): Promise<PageResponse<any>> {
    const skip = page * size;
    const [content, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        skip,
        take: size,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    return {
      content,
      pageNumber: page,
      pageSize: size,
      totalElements: total,
      totalPages: Math.ceil(total / size),
    };
  }

  async markAsRead(notificationId: bigint, userId: bigint) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (notification && notification.userId === userId) {
      await this.prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });
    }
  }

  async getUnreadCount(userId: bigint): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }
}
