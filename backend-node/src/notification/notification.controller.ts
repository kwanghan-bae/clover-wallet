import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { FcmService } from './fcm.service';
import { AuthGuard } from '@nestjs/passport';

/**
 * 알림 및 FCM 토큰 관리를 담당하는 컨트롤러입니다.
 * Kotlin NotificationController 및 FcmController 로직을 이식함.
 */
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly fcmService: FcmService,
  ) {}

  /**
   * 내 알림 목록 조회 (페이징)
   */
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getMyNotifications(
    @Request() req: any,
    @Query('page') page = 0,
    @Query('size') size = 20,
  ) {
    return this.notificationService.getMyNotifications(req.user.id, +page, +size);
  }

  /**
   * 알림 읽음 처리
   */
  @UseGuards(AuthGuard('jwt'))
  @Put(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    await this.notificationService.markAsRead(BigInt(id), req.user.id);
    return { success: true };
  }

  /**
   * 읽지 않은 알림 개수 조회
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('unread-count')
  async getUnreadCount(@Request() req: any) {
    return this.notificationService.getUnreadCount(req.user.id);
  }

  /**
   * FCM 토큰 등록 (Kotlin FcmController 로직)
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('fcm-token')
  async registerFcmToken(@Request() req: any, @Body() body: { token: string }) {
    await this.fcmService.registerTokenById(req.user.id, body.token);
    return { success: true };
  }
}
