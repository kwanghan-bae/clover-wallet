import { Controller, Get, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('me')
  async getProfile(@Request() req: any) {
    // req.user.userId is the 'sub' (UUID) from the JWT
    return this.usersService.findUserBySsoQualifier(req.user.userId);
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.usersService.findUser(id);
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Delete('me')
  async deleteAccount(@Request() req: any) {
    const user = await this.usersService.findUserBySsoQualifier(req.user.userId);
    return this.usersService.deleteUserAccount(user.id);
  }
}
