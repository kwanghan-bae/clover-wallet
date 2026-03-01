import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';

/**
 * 사용자 정보 관리 및 프로필 조회를 담당하는 컨트롤러입니다.
 * Kotlin UserController 로직을 완벽히 이식함.
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
  async deleteAccount(@Request() req: any) {
    await this.usersService.deleteUserAccount(req.user.id);
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
}
