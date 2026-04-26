import { Module } from '@nestjs/common';
import { CommunityController } from './community.controller';
import { PostService } from './post.service';
import { CommentService } from './comment.service';
import { LikeService } from './like.service';
import { FeedService } from './feed.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [CommunityController],
  providers: [PostService, CommentService, LikeService, FeedService],
})
export class CommunityModule {}
