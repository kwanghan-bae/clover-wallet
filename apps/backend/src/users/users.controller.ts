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


@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly followService: FollowService,
  ) {}

  
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getProfile(@Request() req: any) {
    return this.usersService.findUser(req.user.id);
  }


  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.usersService.findUser(id);
  }


  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(id, dto);
  }

  
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


  @Get(':id/stats')
  async getUserStats(@Param('id') id: string) {
    return this.usersService.getUserStats(id);
  }

  
  @Post(':id/follow')
  @UseGuards(AuthGuard('jwt'))
  async toggleFollow(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.followService.toggleFollow(req.user.id, BigInt(id));
  }


  @Get(':id/followers')
  async getFollowers(
    @Param('id', ParseIntPipe) id: number,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
  ) {
    return this.followService.getFollowers(BigInt(id), page ?? 0, size ?? 20);
  }


  @Get(':id/following')
  async getFollowing(
    @Param('id', ParseIntPipe) id: number,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
  ) {
    return this.followService.getFollowing(BigInt(id), page ?? 0, size ?? 20);
  }


  @Get(':id/follow-counts')
  async getFollowCounts(@Param('id', ParseIntPipe) id: number) {
    return this.followService.getCounts(BigInt(id));
  }
}
