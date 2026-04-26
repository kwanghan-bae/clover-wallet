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
  Req,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { FcmService } from './fcm.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly fcmService: FcmService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getMyNotifications(
    @Request() req: any,
    @Query('page') page = 0,
    @Query('size') size = 20,
  ) {
    return this.notificationService.getMyNotifications(
      req.user.id,
      +page,
      +size,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    await this.notificationService.markAsRead(BigInt(id), req.user.id);
    return { success: true };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('unread-count')
  async getUnreadCount(@Request() req: any) {
    return this.notificationService.getUnreadCount(req.user.id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createNotification(
    @Req() req: any,
    @Body() body: { title: string; message: string; type?: string },
  ) {
    const userId = req.user.id;
    return this.notificationService.createNotification(
      userId,
      body.title,
      body.message,
      body.type || 'INFO',
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('fcm-token')
  async registerFcmToken(@Request() req: any, @Body() body: { token: string }) {
    await this.fcmService.registerTokenById(req.user.id, body.token);
    return { success: true };
  }
}
