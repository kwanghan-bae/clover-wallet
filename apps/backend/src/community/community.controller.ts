import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CommentService } from './comment.service';
import { LikeService } from './like.service';
import { FeedService } from './feed.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AuthGuard } from '@nestjs/passport';

/**
 * 커뮤니티 게시글 및 댓글 관리를 담당하는 컨트롤러입니다.
 */
@Controller('community')
export class CommunityController {
  constructor(
    private readonly postService: PostService,
    private readonly commentService: CommentService,
    private readonly likeService: LikeService,
    private readonly feedService: FeedService,
  ) {}

  @Get('posts')
  async getAllPosts(
    @Query('page') page = 0,
    @Query('size') size = 10,
    @Request() req: any,
  ) {
    const userId = req.user?.id;
    return this.postService.getAllPosts(+page, +size, userId);
  }

  @Get('posts/feed')
  @UseGuards(AuthGuard('jwt'))
  async getFeed(
    @Req() req: any,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
  ) {
    return this.feedService.getFollowingFeed(
      req.user.id,
      page ?? 0,
      size ?? 10,
    );
  }

  @Get('posts/:id')
  async getPost(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.id;
    return this.postService.getPostById(BigInt(id), userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('posts')
  async createPost(@Request() req: any, @Body() dto: CreatePostDto) {
    return this.postService.createPost(req.user.id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('posts/:id')
  async updatePost(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postService.updatePost(BigInt(id), req.user.id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('posts/:id/like')
  async likePost(@Request() req: any, @Param('id') id: string) {
    return this.likeService.likePost(BigInt(id), req.user.id);
  }

  @Get('posts/:id/comments')
  async getComments(
    @Param('id') id: string,
    @Query('page') page = 0,
    @Query('size') size = 20,
  ) {
    return this.commentService.getCommentsByPostId(BigInt(id), +page, +size);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('comments')
  async createComment(@Request() req: any, @Body() dto: CreateCommentDto) {
    return this.commentService.createComment(req.user.id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('comments/:id')
  async updateComment(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentService.updateComment(BigInt(id), req.user.id, dto);
  }

  @Delete('posts/:id')
  @UseGuards(AuthGuard('jwt'))
  async deletePost(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    await this.postService.deletePost(BigInt(id), req.user.id);
    return { message: 'Post deleted' };
  }

  @Get('users/:userId/posts')
  async getUserPosts(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
  ) {
    return this.postService.getUserPosts(BigInt(userId), page ?? 0, size ?? 10);
  }
}
