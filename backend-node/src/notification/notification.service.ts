import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PageResponse } from '../common/types/page-response';

/**
 * 인앱 알림 내역을 관리하는 서비스입니다.
 * Kotlin NotificationService 로직을 이식함.
 */
@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 새 알림을 생성하여 저장합니다.
   */
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

  /**
   * 사용자의 알림 목록을 페이징하여 조회합니다.
   */
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

  /**
   * 알림을 읽음 처리합니다.
   */
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

  /**
   * 읽지 않은 알림 개수를 조회합니다.
   */
  async getUnreadCount(userId: bigint): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }
}
