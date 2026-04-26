import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { BadgeService } from './badge.service';
import { FollowService } from './follow.service';
import { PrismaModule } from '../prisma/prisma.module';




@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService, BadgeService, FollowService],
  exports: [UsersService, BadgeService, FollowService],
})
export class UsersModule {}
