import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { FcmService } from './fcm.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [NotificationController],
  providers: [NotificationService, FcmService],
  exports: [NotificationService, FcmService],
})
export class NotificationModule {}
