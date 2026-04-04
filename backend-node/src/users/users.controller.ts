import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { FollowService } from './follow.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';

/**
 * 사용자 정보 관리 및 프로필 조회를 담당하는 컨트롤러입니다.
 * Kotlin UserController 로직을 완벽히 이식함.
 */
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly followService: FollowService,
  ) {}

  /**
   * 내 프로필 정보 조회 (JWT 인증 필요)
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getProfile(@Request() req: any) {
    return this.usersService.findUser(req.user.id);
  }

  /**
   * 특정 사용자 정보 조회
   * @param id 사용자 ID
   */
  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.usersService.findUser(id);
  }

  /**
   * 사용자 정보 수정
   * @param id 사용자 ID
   * @param dto 수정할 데이터
   */
  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(id, dto);
  }

  /**
   * 회원 탈퇴 (본인 확인)
   */
  @UseGuards(AuthGuard('jwt'))
  @Delete('me')
  async deleteAccount(@Request() request: any) {
    if (!request.user) {
      return { message: '사용자 인증 정보를 확인할 수 없습니다' };
    }
    const targetUserId = request.user.userId;
    await this.usersService.deleteUserAccount(targetUserId);
    return { message: '회원 탈퇴가 완료되었습니다' };
  }

  /**
   * 사용자의 통계 정보 조회
   * @param id 사용자 ID
   */
  @Get(':id/stats')
  async getUserStats(@Param('id') id: string) {
    return this.usersService.getUserStats(id);
  }

  /**
   * 팔로우/언팔로우 토글 (JWT 인증 필요)
   * @param id 대상 사용자 ID
   */
  @Post(':id/follow')
  @UseGuards(AuthGuard('jwt'))
  async toggleFollow(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.followService.toggleFollow(req.user.id, BigInt(id));
  }

  /**
   * 특정 사용자의 팔로워 목록 조회
   * @param id 사용자 ID
   */
  @Get(':id/followers')
  async getFollowers(
    @Param('id', ParseIntPipe) id: number,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
  ) {
    return this.followService.getFollowers(BigInt(id), page ?? 0, size ?? 20);
  }

  /**
   * 특정 사용자가 팔로잉하는 목록 조회
   * @param id 사용자 ID
   */
  @Get(':id/following')
  async getFollowing(
    @Param('id', ParseIntPipe) id: number,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
  ) {
    return this.followService.getFollowing(BigInt(id), page ?? 0, size ?? 20);
  }

  /**
   * 특정 사용자의 팔로워/팔로잉 카운트 조회
   * @param id 사용자 ID
   */
  @Get(':id/follow-counts')
  async getFollowCounts(@Param('id', ParseIntPipe) id: number) {
    return this.followService.getCounts(BigInt(id));
  }
}
