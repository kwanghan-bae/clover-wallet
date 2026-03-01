import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { BadgeService } from './badge.service';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * 사용자 정보 및 활동 뱃지를 관리하는 모듈입니다.
 */
@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService, BadgeService],
  exports: [UsersService, BadgeService],
})
export class UsersModule {}
