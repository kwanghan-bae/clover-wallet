import { Module } from '@nestjs/common';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { UsersModule } from '../users/users.module';

/**
 * 커뮤니티 게시판 기능을 담당하는 모듈입니다.
 */
@Module({
  imports: [UsersModule],
  controllers: [CommunityController],
  providers: [CommunityService],
})
export class CommunityModule {}
