import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { CommunityService } from './community.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../users/users.service';

/**
 * 커뮤니티 게시글 및 댓글 관리를 담당하는 컨트롤러입니다.
 */
@Controller('community')
export class CommunityController {
    /**
     * 커뮤니티 서비스와 사용자 서비스 의존성을 주입받습니다.
     * @param communityService 게시글 및 댓글 로직 처리 서비스
     * @param usersService 사용자 정보 조회 서비스
     */
    constructor(
        private readonly communityService: CommunityService,
        private readonly usersService: UsersService
    ) { }

    /**
     * 모든 게시글을 페이지네이션하여 조회합니다.
     * @param page 페이지 번호 (기본값: 0)
     * @param size 한 페이지당 게시글 수 (기본값: 10)
     * @param req 요청 객체
     * @returns 게시글 목록
     */
    @Get('posts')
    async getAllPosts(
        @Query('page') page = 0,
        @Query('size') size = 10,
        @Request() req: any
    ) {
        return this.communityService.getAllPosts(+page, +size, undefined);
    }

    /**
     * 특정 ID의 게시글 상세 정보를 조회합니다.
     * @param id 게시글 ID
     * @returns 게시글 상세 정보
     */
    @Get('posts/:id')
    async getPost(@Param('id') id: string) {
        return this.communityService.getPostById(BigInt(id));
    }

    /**
     * 새로운 게시글을 작성합니다.
     * @param req 인증된 사용자 정보가 포함된 요청 객체
     * @param dto 게시글 생성 데이터
     * @returns 생성된 게시글 정보
     */
    @UseGuards(AuthGuard('jwt'))
    @Post('posts')
    async createPost(@Request() req: any, @Body() dto: CreatePostDto) {
        const user = await this.usersService.findUserBySsoQualifier(req.user.userId);
        return this.communityService.createPost(user.id, dto);
    }

    /**
     * 기존 게시글을 수정합니다.
     * @param req 인증된 사용자 정보가 포함된 요청 객체
     * @param id 수정할 게시글 ID
     * @param dto 게시글 수정 데이터
     * @returns 수정된 게시글 정보
     */
    @UseGuards(AuthGuard('jwt'))
    @Put('posts/:id')
    async updatePost(@Request() req: any, @Param('id') id: string, @Body() dto: UpdatePostDto) {
        const user = await this.usersService.findUserBySsoQualifier(req.user.userId);
        return this.communityService.updatePost(BigInt(id), user.id, dto);
    }

    /**
     * 게시글에 '좋아요'를 표시하거나 취소합니다.
     * @param req 인증된 사용자 정보가 포함된 요청 객체
     * @param id 게시글 ID
     * @returns 좋아요 처리 결과
     */
    @UseGuards(AuthGuard('jwt'))
    @Post('posts/:id/like')
    async likePost(@Request() req: any, @Param('id') id: string) {
        const user = await this.usersService.findUserBySsoQualifier(req.user.userId);
        return this.communityService.likePost(BigInt(id), user.id);
    }

    /**
     * 특정 게시글의 댓글 목록을 조회합니다.
     * @param id 게시글 ID
     * @param page 페이지 번호 (기본값: 0)
     * @param size 페이지당 댓글 수 (기본값: 20)
     * @returns 댓글 목록
     */
    @Get('posts/:id/comments')
    async getComments(
        @Param('id') id: string,
        @Query('page') page = 0,
        @Query('size') size = 20
    ) {
        return this.communityService.getCommentsByPostId(BigInt(id), +page, +size);
    }

    /**
     * 게시글에 새로운 댓글을 작성합니다.
     * @param req 인증된 사용자 정보가 포함된 요청 객체
     * @param dto 댓글 생성 데이터
     * @returns 생성된 댓글 정보
     */
    @UseGuards(AuthGuard('jwt'))
    @Post('comments')
    async createComment(@Request() req: any, @Body() dto: CreateCommentDto) {
        const user = await this.usersService.findUserBySsoQualifier(req.user.userId);
        return this.communityService.createComment(user.id, dto);
    }

    /**
     * 기존 댓글을 수정합니다.
     * @param req 인증된 사용자 정보가 포함된 요청 객체
     * @param id 수정할 댓글 ID
     * @param dto 댓글 수정 데이터
     * @returns 수정된 댓글 정보
     */
    @UseGuards(AuthGuard('jwt'))
    @Put('comments/:id')
    async updateComment(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateCommentDto) {
        const user = await this.usersService.findUserBySsoQualifier(req.user.userId);
        return this.communityService.updateComment(BigInt(id), user.id, dto);
    }
}
