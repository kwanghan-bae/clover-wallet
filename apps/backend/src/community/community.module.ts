import { Module } from '@nestjs/common';
import { CommunityController } from './community.controller';
import { PostService } from './post.service';
import { CommentService } from './comment.service';
import { LikeService } from './like.service';
import { FeedService } from './feed.service';
import { UsersModule } from '../users/users.module';

/**
 * 커뮤니티 게시판 기능을 담당하는 모듈입니다.
 */
@Module({
  imports: [UsersModule],
  controllers: [CommunityController],
  providers: [PostService, CommentService, LikeService, FeedService],
})
export class CommunityModule {}
