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
import { CommunityService } from './community.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AuthGuard } from '@nestjs/passport';

/**
 * 커뮤니티 게시글 및 댓글 관리를 담당하는 컨트롤러입니다.
 * Kotlin CommunityController 로직을 이식함.
 */
@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  /**
   * 모든 게시글을 페이지네이션하여 조회합니다.
   * @param page 페이지 번호
   * @param size 페이지당 게시글 수
   */
  @Get('posts')
  async getAllPosts(
    @Query('page') page = 0,
    @Query('size') size = 10,
    @Request() req: any,
  ) {
    // JWT 토큰이 있으면 사용자 ID 추출 (비로그인 허용)
    const userId = req.user?.id;
    return this.communityService.getAllPosts(+page, +size, userId);
  }

  /**
   * 특정 ID의 게시글 상세 정보를 조회합니다.
   */
  @Get('posts/:id')
  async getPost(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.id;
    return this.communityService.getPostById(BigInt(id), userId);
  }

  /**
   * 새로운 게시글을 작성합니다.
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('posts')
  async createPost(@Request() req: any, @Body() dto: CreatePostDto) {
    return this.communityService.createPost(req.user.id, dto);
  }

  /**
   * 기존 게시글을 수정합니다.
   */
  @UseGuards(AuthGuard('jwt'))
  @Put('posts/:id')
  async updatePost(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.communityService.updatePost(BigInt(id), req.user.id, dto);
  }

  /**
   * 게시글에 '좋아요'를 표시하거나 취소합니다.
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('posts/:id/like')
  async likePost(@Request() req: any, @Param('id') id: string) {
    return this.communityService.likePost(BigInt(id), req.user.id);
  }

  /**
   * 특정 게시글의 댓글 목록을 조회합니다.
   */
  @Get('posts/:id/comments')
  async getComments(
    @Param('id') id: string,
    @Query('page') page = 0,
    @Query('size') size = 20,
  ) {
    return this.communityService.getCommentsByPostId(BigInt(id), +page, +size);
  }

  /**
   * 게시글에 새로운 댓글을 작성합니다.
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('comments')
  async createComment(@Request() req: any, @Body() dto: CreateCommentDto) {
    return this.communityService.createComment(req.user.id, dto);
  }

  /**
   * 기존 댓글을 수정합니다.
   */
  @UseGuards(AuthGuard('jwt'))
  @Put('comments/:id')
  async updateComment(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.communityService.updateComment(BigInt(id), req.user.id, dto);
  }
}
